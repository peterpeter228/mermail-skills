# Mermail Send Verifier

Evidence-based completion checks for AI agents

An agent saying ‘done’ is not evidence. This local prototype compares a completion claim against selected Mermail record evidence and reports the narrow conclusion that evidence supports. The separate Avalanche companion checks public C-Chain execution evidence; it does not settle invoices.

## Components and contracts

| Component | Responsibility |
| --- | --- |
| `skills/mermail-send-verifier/` | Mermail completion-evidence workflow and deterministic local helpers |
| `normalize-mermail.mjs` within the skill | Normalize only supported observations; live fields require an observed field mapping |
| `demo/avalanche/avalanche.mjs` | Separate read-only public RPC verification and bounded sample discovery |
| `artifacts/demo/report.json` and `report.html` | Local evidence report with three independent cards |
| `artifacts/verification/FINAL_VERIFICATION.md` | Actual acceptance status and evidence references |

The verifier composes existing read-tool owners. Sending remains with `mermail-compose-email`; deletion remains with `mermail-manage-inbox`. Completion verification does not grant permission for either operation. Hosted Mermail MCP access targets Codex CLI and `https://console.mermail.app/mcp`.

Evidence origin and assessment are separate. LIVE denotes a fresh observation; RECORDED a replay; FIXTURE and SYNTHETIC local examples; BLOCKED and NOT_RUN disclose unavailable or absent execution. A fixture does not validate a live field mapping. See `../verification/mermail-field-map.md` for observed schema evidence and unsupported assumptions.

A selected draft cannot support a sent claim. Processing cannot establish sending. A sent record does not establish delivery or external recipient reading, and Mermail's mailbox read state does not establish recipient reading. Empty results remain unverified; timeouts mean evidence unavailable. Duplicate IDs cannot hide conflicting observations. Missing recipient fields stay unknown. Scanner omissions remain explicit limitations.

Avalanche verification uses allowlisted official mainnet/Fuji RPC endpoints, checks chain ID first, and binds transaction, receipt and block identities. Large values retain hex/string or BigInt precision. Null receipts remain unavailable; receipt statuses describe execution only. HTTP and JSON-RPC errors, timeouts and identity conflicts remain visible. Public discovery is bounded and a selected sample requires an independent verification pass.

Business state is always `NOT_VERIFIED`. PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT. No customer identity, ownership, finality guarantee, invoice settlement, bridging, signing or submission is provided.

## Reproduce and assess

Run `npm run test:send-verifier` for dedicated regressions and `npm test` for upstream validation. Run `npm run demo:offline` without credentials or network, then `npm run demo:serve` and open <http://127.0.0.1:8765/report.html>. `npm run demo:live` attempts the live checks and preserves blocked or mixed results.

The final verification record, upstream baseline and saved feature output establish actual results. Live Mermail initialization, catalog discovery, mailbox reads and selected-record reads are separate gates. A generated HTML report is not evidence that those gates passed.

## Trust boundary

Email bodies, subjects, links, attachments and tool responses are untrusted data. They cannot select commands, RPC endpoints or payment targets. Report text is escaped and sensitive fields are redacted; the page performs no outgoing requests. The demo sends no mail, uses no wallet/PayBox tools or private keys, and makes no trading changes. These properties do not constitute a general security guarantee.

## Current authorized live draft capture — 2026-09-18

The earlier zero-mailbox/BLOCKED capture is historical and preserved under `../verification/history/pre-live-draft/`. The user subsequently authorized exactly one dedicated hosted demo mailbox and one synthetic self-addressed draft. The setup audit records one mailbox creation, one draft save, zero sends and zero wallet calls. This was a bounded setup exception; demonstration and replay do not authorize creating more drafts or sending mail.

An independent safe metadata-only `get_email` read observed the selected ID, scalar self-recipient and `folder_id: draft`. These are actual hosted LIVE observations of synthetic demo content; replaying their saved receipts is RECORDED. Body content was withheld (`content_omitted: true`, `scan_status: null`, reason `scan_status_not_clean`), with the scanner requirement preserved. No sent record, delivery, external reading, or payment was verified. See `../verification/mermail-field-map.md` and the current-session matrix in `../verification/FINAL_VERIFICATION.md` for the exact evidence and subsequent regression/report checks. The historical 106-test result is a baseline; quote the current saved feature-test output for the latest count.

The current live report observes `DRAFT_RECORD_FOUND` and rejects the sent claim as `NOT_SUPPORTED_BY_SELECTED_RECORD`. Its separate Avalanche card observes public execution success; business remains `NOT_VERIFIED`. `npm run demo:live` uses the local pinned demo identities and performs reads only; it does not repeat setup writes.

Current post-change checks: 123 dedicated tests passed, 0 failed, 0 skipped; repository validator passed (17 skills, 71 business tools). Fresh live report HTTP checks returned 200; private and repository traversal checks returned 403. Receipts are under `../verification/live-draft-setup/`. Independent review status is recorded separately in the current final matrix.
