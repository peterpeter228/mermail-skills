import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const ENDPOINT = 'https://console.mermail.app/mcp';
const REF = 'artifacts/verification/mermail-live.json';

/** Native OAuth stays in Codex's credential store. No LLM turn or external writes. */
export async function createNativeBridge({ timeoutMs = 30000 } = {}) {
  const child = spawn('codex', ['app-server', '--stdio', '-c',
    `mcp_servers={mermail={url="${ENDPOINT}"}}`], { stdio: ['pipe', 'pipe', 'ignore'] });
  const pending = new Map();
  let nextId = 0;
  let ended = false;
  const failAll = () => {
    ended = true;
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error('native_bridge_unavailable'));
    }
    pending.clear();
  };
  child.on('error', failAll);
  child.on('exit', failAll);
  child.stdin.on('error', failAll);
  const lines = createInterface({ input: child.stdout });
  lines.on('line', line => {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id);
    clearTimeout(item.timer);
    // Raw errors may contain credentials or private mailbox data. Never expose them.
    if (message.error) item.reject(new Error('native_bridge_request_failed'));
    else item.resolve(message.result);
  });
  return {
    request(method, params) {
      if (ended) return Promise.reject(new Error('native_bridge_unavailable'));
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error('native_bridge_timeout'));
        }, timeoutMs);
        pending.set(id, { resolve, reject, timer });
        child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
      });
    },
    close() { lines.close(); child.kill(); failAll(); },
  };
}

function contentObject(result) {
  if (result?.isError) throw new Error('mailbox_read_error');
  if (result?.structuredContent) return result.structuredContent;
  const texts = result?.content?.filter(item => item.type === 'text');
  if (texts?.length === 1) {
    try { return JSON.parse(texts[0].text); } catch { /* Unrecognized, not empty. */ }
  }
  return null;
}

/** Connection evidence and selected-record evidence have independent status/origin. */
export async function probeMermail({ createBridge = createNativeBridge } = {}) {
  const captured_at = new Date().toISOString();
  const connection = {
    source: 'BLOCKED', captured_at, endpoint: ENDPOINT, auth_mode: 'native_codex_oauth',
    initialize: 'BLOCKED', catalog: 'BLOCKED', list_mailboxes: 'BLOCKED',
    selected_record: 'BLOCKED', reason_code: 'native_bridge_unavailable',
    call_budget: 1, tool_calls: 0, evidence_refs: [REF],
  };
  const claim = {
    case_id: 'mail-live', mailbox_id: 'unselected', selected_email_id: null,
    claim_type: 'sent', expected_recipient: null, evidence_source: 'BLOCKED',
  };
  const evidence = {
    records: [], captured_at, error: 'EVIDENCE_UNAVAILABLE', evidence_refs: [REF],
    limitations: ['No selected live mail record is available.', 'No live email response field mapping is verified.'],
  };
  let bridge;
  try {
    bridge = await createBridge();
    await bridge.request('initialize', {
      clientInfo: { name: 'mermail-send-verifier', version: '1.0' },
      capabilities: { experimentalApi: true },
    });
    connection.initialize = 'PASS';
    connection.initialize_note = 'Codex app-server initialized; MCP readiness checked separately below.';
    const thread = await bridge.request('thread/start', {
      cwd: process.cwd(), ephemeral: true, model: 'gpt-6-astra',
      approvalPolicy: 'never', sandbox: 'read-only',
    });
    const threadId = thread.thread.id;
    const status = await bridge.request('mcpServerStatus/list', {
      threadId, limit: 100, detail: 'toolsAndAuthOnly',
    });
    const server = status.data?.find(item => item.name === 'mermail');
    if (server?.runtimeStatus !== 'connected' || server.toolsError) {
      connection.reason_code = 'mcp_not_connected';
      return { claim, evidence, connection };
    }
    connection.mcp_initialize = 'PASS';
    connection.runtime_status = 'connected';
    connection.discovered_tool_count = Object.keys(server.tools ?? {}).length;
    const tool = Object.values(server.tools ?? {}).find(item => item.name === 'list_mailboxes');
    if (!tool || tool.annotations?.readOnlyHint !== true || tool.inputSchema?.type !== 'object') {
      connection.reason_code = 'mailbox_read_tool_unavailable';
      return { claim, evidence, connection };
    }
    connection.catalog = 'PASS';
    connection.source = 'LIVE';
    connection.read_tool = tool.name;
    connection.tool_calls += 1;
    const result = await bridge.request('mcpServer/tool/call', {
      threadId, server: server.name, tool: tool.name, arguments: {},
    });
    const data = contentObject(result);
    // Only this exact response envelope has been observed from live list_mailboxes.
    if (!Array.isArray(data?.items)) {
      connection.reason_code = 'unrecognized_mailbox_response';
      return { claim, evidence, connection };
    }
    connection.list_mailboxes = 'PASS';
    connection.mailbox_count = data.items.length;
    connection.reason_code = data.items.length === 0 ? 'no_mailboxes' : 'mailbox_selection_required';
    // No mailbox item schema was observed in the zero-mailbox capture. Do not
    // invent item keys, choose a customer mailbox, or persist mailbox metadata.
    evidence.error = connection.reason_code;
  } catch {
    connection.reason_code = connection.catalog === 'PASS' ? 'mailbox_read_unavailable' : 'native_bridge_unavailable';
  } finally {
    bridge?.close();
  }
  return { claim, evidence, connection };
}
