# Collection workflow

## Connection

Target Codex CLI and `https://console.mermail.app/mcp`. Inspect existing configured servers first and reuse the connection. When absent and setup is authorized, use `codex mcp add mermail --url https://console.mermail.app/mcp`, then `codex mcp login mermail`.

Only when browser consent is required, request:

`AUTH_REQUIRED: 请完成浏览器中的 Mermail OAuth 授权，完成后回到这里按 Enter。`

Resume after consent. If nested login is unsupported, prepare a non-overwriting project `.codex/config.toml` proposal. An already-present `MERMAIL_API_KEY` is a fallback; never print it or ask for it in chat. OpenClaw packaging metadata does not require secrets in offline mode or prove a live connection.

Record initialize/connection, live tools discovery and an actual `list_mailboxes` call separately. Configured server presence and catalog discovery alone do not establish record access.

## Bounded record collection

Use existing test/demo records only for demonstrations. If no mailbox is unmistakably a test mailbox, show redacted names/IDs and ask for selection before inspecting messages. Bind the mailbox, selected email ID, expected recipient and claim independently of email content.

For manual collection, default to at most eight read calls after connection discovery, including mailbox/folder discovery; at most two bounded searches and ten returned records per search, no auto-pagination. Bind explicit folder and time bounds (prefer a user-specified window, otherwise the last 24 hours). If the live schema cannot express required bounds, stop and report the limitation. Narrow further whenever the user's target permits. The executable live runner may use a stricter budget.

Read only selected candidates. Distinct matching message IDs are ambiguous; never select by subject alone. Preserve contradictory observations even when identical IDs are deduplicated. If the budget cannot resolve the claim, report `UNVERIFIED` with missing evidence. A timeout yields `EVIDENCE_UNAVAILABLE`, not “email failed.”

Never disable scanning. Prefer metadata and agent-safe content; held, omitted or unavailable body content remains a limitation. Do not fetch links or attachments merely to improve a send assessment.

## Provenance

Build live normalization from observed fields. Record tool, exact field path, redacted example, interpretation, confidence and unsupported assumptions in `artifacts/verification/mermail-field-map.md`. With no live schema, mark mapping unverified and keep fixtures separate. Do not invent `sent_at`, `delivery_status`, `is_sent`, `delivered`, or `recipient_read` fields.

Retain only minimum redacted evidence, capture time and references. Private local captures belong in excluded `private-evidence/`; no mailbox dumps. Replaying an earlier capture is `RECORDED`, even if the original was live.
