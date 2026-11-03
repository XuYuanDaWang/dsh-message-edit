---
name: dsh-message-edit
description: 在 DeepSeek Harness 中编辑已发送的用户消息并用新内容替换它（以该消息为界回卷、重发、归档原会话）；本仓库同时是可安装的 DSH 插件与技能说明。
whenToUse: 当用户希望修改一条已经发送出去的用户消息（而不是再发一条新消息），或需要安装、启用、排查这个「消息编辑」插件时使用。
metadata:
  version: "1"
---

# 消息编辑（dsh-message-edit）

## 这是什么

一个 DeepSeek Harness（DSH）插件。它让用户把**已经发送出去**的用户消息直接改成可编辑：
点消息上的「编辑」→ 就地改文字 → 「发送」，就会用新内容**替换**这条消息并重新生成，
而不是再发一条新消息。

## 使用方式（面向用户）

1. 鼠标悬停在任意一条已发送的**用户**消息上，气泡下方出现「复制」「编辑」。
2. 点「编辑」，原气泡变为输入框（带原文）。
3. 改完点「发送」或按 Enter：先停掉正在进行的回复（如有），以这条消息为界回卷，丢弃这条
   消息及其之后的内容，用修改后的文字重新生成；原会话转入「归档」（可恢复）。
4. 「取消」或 Esc 放弃。

## 安装（面向 Agent / 维护者）

本插件是 DSH 的 bundle 插件，需要安装到 profile 并启用：

1. 将仓库克隆到稳定目录，例如 `~/.dsh/plugins/dsh-message-edit`。
2. 编辑 profile（默认 `~/.dsh/profiles/desktop/package.json`）：
   - `dependencies["@local/dsh-message-edit"] = "link:<绝对路径>"`
   - `dsh.profile.bundles` 追加 `"@local/dsh-message-edit"`
3. 在 profile 目录执行 `pnpm install`，然后完全退出并重开 DeepSeek Harness，
   或在「设置 → 插件」里重新开关一次。

## 实现与限制

- DSH 可见聊天记录按追加型事件渲染，替换型 surface 只改模型上下文、不改已显示气泡；
  内核没有 truncate/回卷 API。
- 因此用「在该消息处 fork（等价回卷）+ 重发编辑后的文字 + 归档原会话」实现覆盖：
  保留该消息之前的全部历史，只丢弃该消息及其之后；原会话归档可恢复。
- 若要永久删除原会话，或同一条会话原地改写，需要更深的内核改动。

## 目录

`client.js`（客户端逻辑）、`index.js`（服务端空入口）、`cordis.patch.yml`（加载声明）、
`locale/`（文案）、`icon.svg`、`README.md`、`regression.test.cjs`（回归测试）。
