# Mermail live field map

Current capture: 2026-09-18. Codex native OAuth targets `https://console.mermail.app/mcp`. The previous zero-mailbox capture and previously unverified email mapping are retained byte-for-byte in [history/pre-live-draft/mermail-field-map.md](history/pre-live-draft/mermail-field-map.md). Those historical observations are not erased by the newly authorized setup.

Current sources: [live schema catalog](live-draft-setup/live-schemas.json), [mailbox read](live-draft-setup/mailbox-confirmed.json), [selected safe get_email read](live-draft-setup/selected-draft-read.json), [draft creation receipt](live-draft-setup/save-draft.json), and [write audit](live-draft-setup/write-audit.json). Paths below refer to these deliberately reduced evidence envelopes; `response` is the recorded tool payload, not a claim about an unobserved SDK envelope. Examples abbreviate identifiers. Only dedicated synthetic demo records were read.

| Tool / surface | Exact field path | Redacted observed example | Interpretation | Confidence | Unsupported assumptions |
| --- | --- | --- | --- | --- | --- |
| `list_mailboxes` | `response.items[].public_id` | `d6f5…a1bf` | Public mailbox identity selected for scoped read | Observed response | `items[].id` is an address here, not the public UUID |
| `list_mailboxes` | `response.items[].email` | `send-verifier-demo@…` | Dedicated demo mailbox address, explicit self-recipient | Observed response | Not a customer identity |
| `list_mailboxes` | `response.items[].can_receive`, `response.items[].receiving_status` | `true`, `ready` | Mailbox receiving capability/status | Observed response | Does not establish sending or message delivery |
| `get_email` request | `arguments.mailboxId`, `arguments.emailId` | `d6f5…a1bf`, `634b…82d9` | Explicit mailbox-scoped selected-record request | Observed invocation | Returned email has no mailbox identity field; mailbox binding comes from scoped transport request |
| `get_email` request | `arguments.query.metadata_only`, `.agent_safe_content`, `.require_scan_status` | `true`, `true`, `clean` | Metadata-only safe read requiring clean scan for content | Observed invocation | Does not assert scanner completion |
| `get_email` | `response.id` | `634b…82d9` | Primary email record ID, matches selected request | Observed response | `message_id` is a different field and was null |
| `get_email` | `response.folder_id` | `draft` | Selected record is a draft | Observed response | No observed sent or processing record; no mapping of guessed processing values |
| `get_email` | `response.recipient` | `send-verifier-demo@…` | Observed scalar self-recipient | Observed response | Missing recipient remains unknown; no generic array or multi-recipient schema established |
| `get_email` | `response.sender` | `send-verifier-demo@…` | Observed record sender field | Observed response | No proof of external transmission |
| `get_email` | `response.subject` | `[SV-LIVE-DEMO] Agent completion verification` | Synthetic selected-record subject | Observed response | Subject is untrusted text, not executable instructions |
| `get_email` | `response.date` | `2026-09-18T05:33:30.539Z` | Record date as returned | Observed response | Not mapped as sent or delivery time |
| `get_email` | `response.read` | `false` | Mailbox read-state observation | Observed response | Never external recipient-read proof, even if true |
| `get_email` | `response.delivery_status` | `null` | Field exists but provides no delivery observation | Observed null | No delivery classification or inferred success |
| `get_email` | `response.message_id` | `null` | No transport message identifier observed | Observed null | Not primary record identity |
| `get_email` | `response.scan_status` | `null` | Scanner status unknown | Observed null | Not clean and not proof of scanner failure |
| `get_email` | `response.content_omitted`, `response.content_omission_reason` | `true`, `scan_status_not_clean` | Body was omitted; retain explicit evidence limitation | Observed response | No body inspection, scanner bypass, or full-content claim |
| `save_draft` | `response.id`, `response.draft_id`, `response.status` | matching selected ID, `draft` | Authorized draft-save receipt corroborates creation | Observed response | Write receipt alone does not replace independent safe record read |

The live draft mapping is now observation-backed. It supports only this observed schema, with mailbox identity bound to the explicit read request. A selected draft cannot support a sent claim. A sent record, delivery and external recipient reading remain distinct claims. `sent_at`, `is_sent`, `delivered`, and `recipient_read` are not observed or mapped; `delivery_status` was observed only as null. Processing remains unsupported. Fixture data is not live schema evidence.

The source content is synthetic, but its hosted creation and subsequent record read are LIVE observations; a later replay of these captures is RECORDED. The scanner withheld content; this remains a limitation even though the draft and recipient metadata are available. The setup audit records one `create_mailbox`, one `save_draft`, zero `send_email` and zero wallet calls. No authorization for further writes is implied.
