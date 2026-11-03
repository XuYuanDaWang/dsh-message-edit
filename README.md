# dsh-message-edit

DeepSeek Harness（DSH）的**消息编辑**插件：把**已经发送出去**的用户消息直接改成可编辑，
改完「发送」即用新内容**替换**这条消息并重新生成——不用再手动发一条新消息。

## 功能

- 鼠标移到任意一条已发送的用户消息上，气泡下方出现「复制」「编辑」。
- 点「编辑」，原气泡就地变成输入框（自动带入原文）。
- 点「发送」或回车：先停掉正在进行的回复（如有），以这条消息为界**回卷**——保留它之前
  完全相同的对话历史，丢弃这条消息及其之后的内容，再用修改后的文字重新生成。
- 原会话转入**归档**（可在「归档」中恢复）；当前视图呈现的就是这条消息被替换后的同一段对话。
- 支持 Enter 发送 / Shift+Enter 换行 / Esc 取消；中文输入法回车不误发。

## 原理（重要）

DSH 的可见聊天记录由**追加型事件**渲染，直接用「替换型 surface」只影响模型上下文、不会改动
屏幕上已有的旧气泡；内核也没有 truncate/回卷 API。因此本插件用
「在该消息处 fork（等价回卷）+ 用编辑后的文字重发 + 归档原会话」实现「覆盖」：

- fork 原样保留该消息**之前**的全部历史，只丢弃该消息及其之后；
- 所以看起来就是这条消息被替换、后面的内容被重来；
- 原会话放在「归档」里，可恢复（不是永久删除）。

如需**永久删除**原会话，或内核级的「同一条会话原地改写」，需要更深的内核改动。

## 作为 DSH 插件安装

依赖：DeepSeek Harness（桌面版，profile 机制）。

1. 把本仓库放到一个稳定目录，例如 `~/.dsh/plugins/dsh-message-edit`：

   ```bash
   git clone https://github.com/XuYuanDaWang/dsh-message-edit.git ~/.dsh/plugins/dsh-message-edit
   ```

2. 在 DSH 的 profile（默认 `~/.dsh/profiles/desktop/package.json`）里：
   - `dependencies` 增加：`"@local/dsh-message-edit": "link:/绝对路径/.dsh/plugins/dsh-message-edit"`
   - `dsh.profile.bundles` 增加：`"@local/dsh-message-edit"`

3. 安装依赖并重启应用（或「设置 → 插件」重新开关一次）：

   ```bash
   cd ~/.dsh/profiles/desktop && pnpm install
   ```

   然后**完全退出 DeepSeek Harness（⌘Q）并重开**。

> 插件声明的包名是 `@local/dsh-message-edit`；`dsh.profile.bundles` 里要写这个包名。

## 作为 DSH Skill

仓库根目录的 `SKILL.md` 是标准 DSH 技能说明（含 `name` / `description` / `whenToUse`）。
把它（或整个目录）放到 `~/.dsh/skills/` 下，Agent 就能理解这个功能的用途与安装/使用方式。
注意：`SKILL.md` 只是说明；真正让「编辑」按钮出现，仍需要按上面的方式**安装插件**。

## 文件

- `client.js` —— Web 客户端：覆盖用户消息节点、编辑态、复制/编辑动作、回卷替换 + 归档流程。
- `index.js` —— 服务端入口（空实现，仅让 bundle 可加载并下发客户端模块）。
- `cordis.patch.yml` —— 声明把本插件插入 DSH 加载树。
- `locale/{zh,en}.json` —— 插件市场标题/简介。
- `icon.svg` —— 插件图标。
- `SKILL.md` —— 标准 DSH 技能说明。
- `regression.test.cjs` —— 无浏览器逻辑回归：`node regression.test.cjs`。

## 测试

```bash
node regression.test.cjs
```

## License

MIT
