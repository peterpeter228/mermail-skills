import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { normalizeMermail } from './normalize-mermail.mjs';

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
export async function probeMermail({ createBridge = createNativeBridge, selection = null } = {}) {
  const captured_at = new Date().toISOString();
  const connection = {
    source: 'BLOCKED', captured_at, endpoint: ENDPOINT, auth_mode: 'native_codex_oauth',
    initialize: 'BLOCKED', catalog: 'BLOCKED', list_mailboxes: 'BLOCKED',
    selected_record: 'BLOCKED', reason_code: 'native_bridge_unavailable',
    call_budget: selection === null ? 1 : 2, tool_calls: 0, evidence_refs: [REF],
  };
  const claim = {
    case_id: 'mail-live', mailbox_id: 'unselected', selected_email_id: null,
    claim_type: 'sent', expected_recipient: null, evidence_source: 'BLOCKED',
  };
  const evidence = {
    records: [], captured_at, error: 'EVIDENCE_UNAVAILABLE', evidence_refs: [REF],
    limitations: ['No selected live mail record is available.', 'No live email response field mapping is verified.'],
  };
  if (selection !== null) {
    if (!selection || !['mailbox_id', 'selected_email_id', 'expected_recipient'].every(key =>
      typeof selection[key] === 'string' && selection[key].trim() && selection[key].length <= 500)) {
      connection.reason_code = 'invalid_selection';
      return { claim, evidence, connection };
    }
    Object.assign(claim, { mailbox_id: selection.mailbox_id,
      selected_email_id: selection.selected_email_id, expected_recipient: selection.expected_recipient });
  }
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
    evidence.error = connection.reason_code;
    if (selection === null) return { claim, evidence, connection };
    const matches = data.items.filter(item => item?.public_id === selection.mailbox_id);
    if (matches.length !== 1 || matches[0].email !== selection.expected_recipient) {
      connection.reason_code = 'pinned_mailbox_not_verified';
      return { claim, evidence, connection };
    }
    const get = Object.values(server.tools ?? {}).find(item => item.name === 'get_email');
    const schema = get?.inputSchema;
    const properties = schema?.properties;
    const query = properties?.query;
    const permits = (spec, type, value) => spec &&
      (!spec.enum || spec.enum.includes(value)) && (!Object.hasOwn(spec, 'const') || spec.const === value) &&
      (spec.type === type || spec.anyOf?.some(item => item.type === type));
    if (get?.annotations?.readOnlyHint !== true || schema?.type !== 'object' ||
      properties?.mailboxId?.type !== 'string' || properties?.emailId?.type !== 'string' ||
      !['mailboxId', 'emailId'].every(key => schema.required?.includes(key)) ||
      schema.required.some(key => !['mailboxId', 'emailId', 'query'].includes(key)) ||
      query?.type !== 'object' ||
      (query.required ?? []).some(key => !['metadata_only', 'agent_safe_content', 'require_scan_status'].includes(key)) ||
      !permits(query.properties?.metadata_only, 'boolean', true) ||
      !permits(query.properties?.agent_safe_content, 'boolean', true) ||
      !permits(query.properties?.require_scan_status, 'string', 'clean')) {
      connection.reason_code = 'selected_read_tool_unavailable';
      return { claim, evidence, connection };
    }
    connection.selected_read_tool = get.name;
    connection.tool_calls += 1;
    const selected = contentObject(await bridge.request('mcpServer/tool/call', {
      threadId, server: server.name, tool: get.name,
      arguments: { mailboxId: selection.mailbox_id, emailId: selection.selected_email_id,
        query: { metadata_only: true, agent_safe_content: true, require_scan_status: 'clean' } },
    }));
    const record = normalizeMermail(selected, { mailbox: matches[0], evidenceRef: REF });
    if (record.id !== selection.selected_email_id || record.mailbox_id !== selection.mailbox_id) {
      connection.reason_code = 'selected_record_identity_unverified';
      return { claim, evidence, connection };
    }
    connection.selected_record = 'PASS';
    connection.reason_code = 'selected_record_observed';
    claim.evidence_source = 'LIVE';
    evidence.records = [record];
    evidence.limitations = [...(record.limitations ?? [])];
    delete evidence.error;
  } catch {
    connection.reason_code = connection.tool_calls === 2 ? 'selected_read_unavailable' : connection.catalog === 'PASS' ? 'mailbox_read_unavailable' : 'native_bridge_unavailable';
  } finally {
    bridge?.close();
  }
  return { claim, evidence, connection };
}
