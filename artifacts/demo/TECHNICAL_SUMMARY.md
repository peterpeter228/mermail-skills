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
