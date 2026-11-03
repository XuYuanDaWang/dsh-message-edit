window.__ModuleLoader__.load({
  id: '@local/dsh-message-edit',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'message-edit';
    const EMPTY = [];

    const zh = {
      edit: '编辑消息',
      editUnavailable: '该消息不支持编辑',
      copy: '复制',
      copied: '已复制',
      cancel: '取消',
      send: '发送',
      sending: '发送中…',
      placeholder: '修改这条消息…',
      empty: '消息不能为空',
      noWorkspace: '无法确定当前会话的工作区',
      error: '编辑消息失败，请重试',
      branchNotice: '发送后用修改内容替换这条消息；原会话会归档（可在“归档”中恢复）。',
    };
    const en = {
      edit: 'Edit message',
      editUnavailable: 'This message cannot be edited',
      copy: 'Copy',
      copied: 'Copied',
      cancel: 'Cancel',
      send: 'Send',
      sending: 'Sending…',
      placeholder: 'Edit this message…',
      empty: 'Message cannot be empty',
      noWorkspace: 'Cannot determine the workspace for this conversation',
      error: 'Failed to edit the message. Please try again.',
      branchNotice: 'Resubmitting replaces this message; the original conversation is archived (recoverable).',
    };

    function splitContent(content) {
      const texts = [];
      const attachments = [];
      const rest = [];
      for (const block of content) {
        if (block && block.type === 'text' && typeof block.text === 'string') texts.push(block.text);
        else if (block && block.type === 'image' && block.attachment !== undefined) attachments.push({ type: 'image', image: { attachment: block.attachment } });
        else if (block && block.type === 'file' && block.attachment !== undefined) attachments.push({ type: 'file', file: block.attachment });
        else rest.push(block);
      }
      return { text: texts.join(''), attachments, rest };
    }

    function formatClock(time) {
      if (typeof time !== 'number' || !Number.isFinite(time)) return '';
      try {
        const locale = typeof navigator !== 'undefined' ? navigator.language : undefined;
        return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(time));
      } catch {
        return '';
      }
    }

    function CopyIcon() {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }),
        h('path', { d: 'M5 15V5a2 2 0 0 1 2-2h10' }));
    }

    function CheckIcon() {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'm5 12 4 4L19 6' }));
    }

    function PencilIcon() {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M12 20h9' }),
        h('path', { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z' }));
    }

    const CSS = `
      .mep-row { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 0; }
      .mep-actions { display: flex; align-items: center; gap: 6px; height: calc(28px + var(--dsh-content-font-delta, 0px)); opacity: 0; transition: opacity 80ms; }
      .mep-row:hover .mep-actions, .mep-row:focus-within .mep-actions { opacity: 1; }
      @media (hover: none) { .mep-actions { opacity: 1; } }
      .mep-time { color: var(--dsw-alias-label-tertiary); font-size: var(--dsh-content-font-size-secondary, 13px); line-height: calc(24px + var(--dsh-content-font-delta, 0px)); white-space: nowrap; padding-right: 4px; }
      .mep-action { width: calc(28px + var(--dsh-content-font-delta, 0px)); height: calc(28px + var(--dsh-content-font-delta, 0px)); border-radius: var(--dsw-radius-sm); color: var(--dsw-alias-label-tertiary); cursor: pointer; background: none; border: none; display: inline-flex; align-items: center; justify-content: center; padding: 6px; }
      .mep-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }
      .mep-action svg { width: calc(15px + var(--dsh-content-font-delta, 0px)); height: calc(15px + var(--dsh-content-font-delta, 0px)); }
      .mep-editBox { box-sizing: border-box; width: min(calc(var(--dsh-chat-content-width, 748px) * .702), 82%); display: flex; flex-direction: column; gap: 8px; }
      .mep-input { box-sizing: border-box; width: 100%; min-height: 88px; max-height: 320px; resize: vertical; background: var(--dsw-specific-bubble, var(--dsw-alias-bg-layer-2)); color: var(--dsw-alias-label-primary); border: 1px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-xl, 20px); padding: 10px 16px; font: inherit; font-size: var(--dsh-content-font-size, 14px); line-height: calc(22px + var(--dsh-content-font-delta, 0px)); outline: none; caret-color: var(--dsw-alias-brand-primary); }
      .mep-input:focus-visible { border-color: var(--dsw-alias-brand-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 25%, transparent); }
      .mep-buttons { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
      .mep-btn { height: 30px; border-radius: 999px; padding: 0 14px; font-size: 13px; line-height: 28px; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); }
      .mep-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
      .mep-btn:disabled { cursor: default; opacity: .5; }
      .mep-primary { background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); border-color: transparent; }
      .mep-primary:hover:not(:disabled) { opacity: .9; background: var(--dsw-alias-button-primary-fill); }
      .mep-error { color: var(--dsw-alias-state-error-primary); font-size: var(--dsh-content-font-size-secondary, 13px); line-height: 18px; text-align: right; }
    `;

    function MessageEditNode(props) {
      const { node, sessionId, useSession, useSessions, useWorkspaces, renderFactorySlot, loadImage, t, ctx } = props;
      const data = node && node.data ? node.data : {};
      const content = Array.isArray(data.content) ? data.content : EMPTY;
      const parts = React.useMemo(() => splitContent(content), [content]);
      const subagent = useSession((snapshot) => snapshot.subagent);
      const workspaceId = useWorkspaces((snapshot) => {
        const items = snapshot && Array.isArray(snapshot.items) ? snapshot.items : EMPTY;
        const own = items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId));
        return own ? own.workspaceId : undefined;
      });
      const agentPreset = useSessions((snapshot) => {
        const row = snapshot && snapshot.byId ? snapshot.byId[sessionId] : undefined;
        return row && row.projectionValues ? row.projectionValues.agentPreset : undefined;
      });
      const location = node && node.location;
      const turn = location && (location.kind === 'step' || location.kind === 'turn') ? location.turn : undefined;
      const turnNo = turn && typeof turn.turn === 'number' ? turn.turn : undefined;
      const turnStartSeq = turn && turn.start && typeof turn.start.seq === 'number' ? turn.start.seq : undefined;
      const canEdit = parts.text.trim() !== '' && parts.attachments.length === 0 && parts.rest.length === 0 && (subagent === null || subagent === undefined) && turnNo !== undefined;
      const clock = formatClock(data.time);
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState(null);
      const [copied, setCopied] = React.useState(false);
      const copyTimer = React.useRef(null);
      const operationLocked = React.useRef(false);
      const editTarget = React.useRef(null);
      const requestId = React.useRef(null);
      React.useEffect(() => () => {
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      }, []);

      const prepared = React.useMemo(() => ({
        text: parts.text,
        attachments: parts.attachments,
        extraBlocks: parts.rest,
        ...(Array.isArray(data.referenceLabels) && data.referenceLabels.length > 0 ? { referenceLabels: data.referenceLabels } : {}),
      }), [parts, data.referenceLabels]);
      const facts = React.useMemo(() => ({
        ...(Array.isArray(data.referenceLabels) && data.referenceLabels.length > 0 ? { sessionLabels: data.referenceLabels } : {}),
        ...(Array.isArray(data.skillNames) && data.skillNames.length > 0 ? { skillNames: data.skillNames } : {}),
      }), [data.referenceLabels, data.skillNames]);

      const onCopy = async () => {
        if (copied) return;
        try {
          await navigator.clipboard.writeText(parts.text);
        } catch {
          return;
        }
        setCopied(true);
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => {
          copyTimer.current = null;
          setCopied(false);
        }, 1000);
      };

      const startEdit = async () => {
        if (operationLocked.current) return;
        operationLocked.current = true;
        setDraft(parts.text);
        setError(null);
        setEditing(true);
        setBusy(true);
        editTarget.current = null;
        requestId.current = crypto.randomUUID();
        try {
          const source = ctx.sessions.binding(sessionId);
          if (!source) throw new Error(t('error'));
          if (source.session.getSnapshot().running) {
            const stopped = await source.session.cancel();
            if (!stopped.ok) throw new Error(stopped.error.message);
          }
        } catch (failure) {
          setError(failure && failure.message ? String(failure.message) : t('error'));
        } finally {
          operationLocked.current = false;
          setBusy(false);
        }
      };

      const cancelEdit = () => {
        if (operationLocked.current) return;
        editTarget.current = null;
        requestId.current = null;
        setEditing(false);
        setError(null);
      };

      const saveEdit = async () => {
        const value = draft;
        if (value.trim() === '') {
          setError(t('empty'));
          return;
        }
        if (operationLocked.current) return;
        operationLocked.current = true;
        setBusy(true);
        setError(null);
        try {
          const binding = ctx.sessions.binding(sessionId);
          const live = binding ? binding.session : undefined;
          if (!live) throw new Error(t('error'));
          if (live.getSnapshot().running) {
            const stopped = await live.cancel();
            if (!stopped.ok) throw new Error(stopped.error.message);
          }
          const parentTitle = ctx.sessions.list && typeof ctx.sessions.list.getSnapshot === 'function'
            ? ctx.sessions.list.getSnapshot().byId?.[sessionId]?.title
            : undefined;
          let childId = editTarget.current;
          if (!childId) {
            if (turnNo > 1 && turnStartSeq !== undefined && turnStartSeq > 1) {
              // Rewind to just before the edited message: a fork keeps the identical
              // earlier history and drops this message plus everything after it.
              childId = await ctx.sessions.fork({ sessionId, atSeq: turnStartSeq - 1 });
            } else {
              if (workspaceId === undefined) throw new Error(t('noWorkspace'));
              childId = await ctx.uiWorkspace.connectWorkspace(workspaceId, agentPreset ? { agentPreset } : {});
            }
            // Keep the same conversation title so the rewritten conversation looks
            // like the original one rather than a numbered branch.
            if (typeof parentTitle === 'string' && parentTitle !== '') {
              try {
                await ctx.sessions.using(childId, { source: 'controllerOperation' }, (reference) => reference.binding.session.rename(parentTitle));
              } catch {
                // A rename failure never blocks the edit itself.
              }
            }
            editTarget.current = childId;
          }
          await ctx.sessions.using(childId, { source: 'controllerOperation' }, async (reference) => {
            const result = await reference.binding.session.prompt([{ type: 'text', text: value }], 'queue', undefined, requestId.current);
            if (!result.ok) throw new Error(result.error && result.error.message ? result.error.message : t('error'));
          });
          ctx.uiWorkspace.openSession(childId);
          // Replace the original in the visible list: archive it (recoverable) so the
          // conversation reads as the same thread with the edited message in place.
          try {
            await ctx.uiWorkspace.archiveSession(sessionId, { stopActivity: true });
          } catch {
            // Archiving is best-effort; the edited conversation already opened.
          }
          setEditing(false);
        } catch (failure) {
          setError(failure && failure.message ? String(failure.message) : t('error'));
        } finally {
          operationLocked.current = false;
          setBusy(false);
        }
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelEdit();
          return;
        }
        if (event.key === 'Enter' && !event.shiftKey && !(event.nativeEvent && event.nativeEvent.isComposing)) {
          event.preventDefault();
          if (!busy && draft.trim() !== '') saveEdit();
        }
      };

      if (editing) {
        return h('div', { className: 'mep-row', 'data-dsh-message-edit': true },
          h('div', { className: 'mep-editBox' },
            h('textarea', {
              className: 'mep-input',
              value: draft,
              autoFocus: true,
              disabled: busy,
              'aria-label': t('edit'),
              placeholder: t('placeholder'),
              onChange: (event) => setDraft(event.target.value),
              onKeyDown,
            }),
            h('div', { className: 'mep-time', role: 'note' }, t('branchNotice')),
            error !== null ? h('div', { className: 'mep-error', role: 'alert' }, error) : null,
            h('div', { className: 'mep-buttons' },
              h('button', { type: 'button', className: 'mep-btn', disabled: busy, onClick: cancelEdit }, t('cancel')),
              h('button', { type: 'button', className: 'mep-btn mep-primary', disabled: busy || draft.trim() === '', onClick: saveEdit }, busy ? t('sending') : t('send')))));
      }

      return h('div', { className: 'mep-row', 'data-dsh-message-edit': true },
        renderFactorySlot('conversation.chat.user.content', {
          content: prepared,
          loadImage,
          facts,
          interactive: true,
        }),
        h('div', { className: 'mep-actions', 'data-clock': 'start' },
          clock ? h('span', { className: 'mep-time' }, clock) : null,
          h('button', {
            type: 'button',
            className: 'mep-action',
            'aria-label': copied ? t('copied') : t('copy'),
            title: copied ? t('copied') : t('copy'),
            onClick: onCopy,
          }, copied ? h(CheckIcon) : h(CopyIcon)),
          canEdit ? h('button', {
            type: 'button',
            className: 'mep-action',
            'aria-label': t('edit'),
            title: t('edit'),
            onClick: startEdit,
          }, h(PencilIcon)) : null));
    }

    return {
      inject: ['slots', 'sessions', 'uiWorkspace', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-message-edit: dictionaries');
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = '@local/dsh-message-edit';
          style.dataset.pluginCss = '@local/dsh-message-edit/client.css';
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => {
            style.remove();
          };
        }, 'dsh-message-edit: styles');
        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
          name: 'conversation.chat.node',
          key: 'user',
          priority: -10,
          locale: NS,
        }, (props) => h(MessageEditNode, { ...props, ctx })));
      },
    };
  },
});
