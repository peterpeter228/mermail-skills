# Mermail live field map

Capture: 2026-09-18. Codex native OAuth through `codex app-server --stdio`.
Endpoint: `https://console.mermail.app/mcp`. No LLM turn was started.
Evidence: [mermail-live.json](mermail-live.json). The app-server initialized,
Mermail's runtime was `connected`, its live catalog contained 85 tools, and
an actual `list_mailboxes` call returned `{ "items": [] }`.

| Tool / surface | Exact field path | Redacted observed example | Interpretation | Confidence | Unsupported assumptions |
| --- | --- | --- | --- | --- | --- |
| `mcpServerStatus/list` | `data[].name` | `mermail` | Requested configured server identity | Observed | Does not prove a mailbox read |
| `mcpServerStatus/list` | `data[].runtimeStatus` | `connected` | Native MCP runtime completed connection | Observed | Configuration alone is insufficient |
| `mcpServerStatus/list` | `data[].authStatus` | `oAuth` | Native OAuth authentication mode | Observed | No token inspected or retained |
| `mcpServerStatus/list` | `data[].serverInfo.name` | `mermail` | MCP server identifies itself | Observed | No official endorsement implied |
| `mcpServerStatus/list` | `data[].tools.list_mailboxes.name` | `list_mailboxes` | Exact callable read tool name | Observed | No invented host prefix |
| `mcpServerStatus/list` | `data[].tools.list_mailboxes.inputSchema` | object with optional `query`, `body`, `idempotencyKey`; no required keys | `{}` is a valid native argument object | Observed live schema | No stringified query/body |
| `list_mailboxes` | `structuredContent.items` | `[]` | Successful read returned zero mailboxes | Observed response | Not a failed send; no mailbox item fields were observed |
| `search_emails` catalog only | `inputSchema.properties.query.properties` | `folder`, `subject`, `date_start`, `date_end`, `metadata_only`, `agent_safe_content`, `page`, `limit`, `require_scan_status` | Supports bounded safe candidate queries if a test mailbox later exists | Observed live input schema only | Search was NOT_RUN; no response fields verified |
| `get_email` catalog only | `inputSchema.required` | `["mailboxId", "emailId"]` | Requires an already selected message | Observed live input schema only | Read was NOT_RUN; no message fields verified |

## Email normalization remains unverified

No mailbox or email record was returned. There is no evidence-backed mapping
for message ID, mailbox ID, recipient addresses, read state, folder/state,
processing state, scan result, or content-omission flags. The normalizer returns
unknown values and preserves this limitation. It never interprets fixture
fields as live schema. It discards bodies and does not bypass any scanner.

`sent_at`, `delivery_status`, `is_sent`, `delivered`, and `recipient_read` are
not mapped. No recipient is inferred from the email under assessment. No
processing state is supported. A future live message mapping requires an
explicitly selected test mailbox, bounded metadata-only reads, observed field
paths and dedicated tests before classification can use it.

Connection/catalog/list proof is LIVE; selected-record evidence is BLOCKED
with `no_mailboxes`. No remote draft was created and no email, wallet, PayBox,
signing, transaction-submission, or trading tool was invoked.
