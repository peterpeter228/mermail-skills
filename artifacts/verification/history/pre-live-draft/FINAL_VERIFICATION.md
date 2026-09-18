# Mermail Send Verifier — verification

Captured 2026-09-18 in `/root/code/mermail-skills`, branch `feat/mermail-send-verifier-avalanche-demo`, base HEAD `b6b98f3bf3d27373f80b403a84dcba370af8b882`. Node v22.22.0, npm 11.17.0, Git 2.43.0, Codex CLI 0.155.0. Verification was performed before the authorized task commit; Git publication results are reported separately. The pre-existing untracked `AGENTS.md` was preserved.

IMPLEMENTED: deterministic mail classifier, conservative normalizer, native Codex OAuth read adapter, independent Avalanche companion, static report, isolated local server, 4 npm runners, skill registration and six demo documents. Core classifications require no LLM API.

LIVE VERIFIED: Mermail MCP connection, 85-tool catalog, successful `list_mailboxes` returning zero mailboxes; Avalanche mainnet chain ID, transaction, receipt and matching block, followed by an independent repeat. Selected mail record remains BLOCKED. Live normalization is intentionally unverified until a real record is observed.

| Requirement | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Repository baseline | PASS | [upstream-baseline.txt](upstream-baseline.txt), [intake.txt](intake.txt) | Original `npm test` exit 0: 16 skills, 71 business tools. |
| Skill structure | PASS | [skill](../../skills/mermail-send-verifier/SKILL.md), [repo-validator.txt](repo-validator.txt) | 47-line entrypoint; template metadata, hosted MCP dependency, references and scripts. |
| Repo validator | PASS | [repo-validator.txt](repo-validator.txt) | Exit 0: 17 skills, 71 business tools. Existing validator unchanged; tool ownership and upstream scenarios preserved. |
| Mail deterministic tests | PASS | [feature-tests.txt](feature-tests.txt), [mail-tdd.txt](mail-tdd.txt) | M1–M12 plus missing identities, contradictory duplicates, unsupported processing, recipient correlation. |
| Avalanche deterministic tests | PASS | [feature-tests.txt](feature-tests.txt), [avalanche-tdd.txt](avalanche-tdd.txt) | Mainnet/Fuji, conflict and missing evidence, transport/RPC failures, large integers, no payment upgrade, redirects denied. |
| Report security / runner / server tests | PASS | [feature-tests.txt](feature-tests.txt), [report-tdd.txt](report-tdd.txt), [runner-tdd.txt](runner-tdd.txt) | 106 total dedicated tests passed, 0 failed, 0 skipped. Sources, redaction, escaping, mixed failures and server isolation. |
| Mermail native connection / initialize | PASS | [mermail-live.json](mermail-live.json) | App-server initialize and MCP connected readiness recorded separately; native OAuth, no LLM turn. |
| Mermail MCP catalog | PASS | [mermail-live.json](mermail-live.json), [mermail-field-map.md](mermail-field-map.md) | 85 actual discovered tools; only exact read tool invoked. |
| Mermail list_mailboxes LIVE | PASS | [mermail-live.json](mermail-live.json) | One read call per run; response `structuredContent.items=[]`, count 0. OAuth did not fail. |
| Mermail selected record LIVE | BLOCKED | [mermail-live.json](mermail-live.json) | `no_mailboxes`; no mailbox or message selected. No private mail scanned. |
| Mermail search / get_email LIVE | NOT_RUN | [mermail-field-map.md](mermail-field-map.md) | No mailbox exists in returned scope; record input schema discovery does not prove a message read. |
| Mermail live email-field mapping | BLOCKED | [mermail-field-map.md](mermail-field-map.md) | No email response observed. Normalizer returns unknown; no invented state/recipient fields. |
| Avalanche chainId LIVE | PASS | [avalanche-live.json](avalanche-live.json) | Official mainnet RPC observed `0xa86a` (43114). |
| Avalanche transaction LIVE | PASS | [avalanche-live.json](avalanche-live.json), [avalanche-live-attempt.txt](avalanche-live-attempt.txt) | Public recent-block sample; max 5 blocks / 16 RPC calls for discovery. |
| Avalanche receipt and block LIVE | PASS | [avalanche-live.json](avalanche-live.json) | Receipt `0x1`; matching requested/transaction/receipt/block identities. Execution success only. |
| Avalanche independent repeat | PASS | [avalanche-repeat.txt](avalanche-repeat.txt), [live-demo.txt](live-demo.txt) | Standalone verify exit 0 after sample; live runner also independently rereads its sample. |
| Business / payment relationship | NOT_RUN | [report.json](../demo/report.json) | Always NOT_VERIFIED in v1; no settlement or customer/wallet identity implementation. |
| Offline demo | PASS | [runner-tdd.txt](runner-tdd.txt) | `npm run demo:offline` executed, all 3 cards FIXTURE. Dedicated runner test uses no network/credentials. |
| Live demo | PASS | [live-demo.txt](live-demo.txt) | Executed both connections; mail record BLOCKED + Avalanche LIVE, business NOT_VERIFIED. No fallback fixture called live. |
| HTML generated / local server | PASS | [report.html](../demo/report.html), [http-check.json](http-check.json) | HTTP 200 at 127.0.0.1:8765; only artifacts/demo served, traversal/private/repository files denied. |
| Diff / unfinished placeholders / secret scan | PASS | [scoped-checks.txt](scoped-checks.txt), [scoped-safety-scan.json](scoped-safety-scan.json) | No diff whitespace defects, no unfinished placeholders, no credential-pattern findings in scoped outputs. |
| No external mail send or deletion | PASS | [live adapter](../../skills/mermail-send-verifier/scripts/live-mermail.mjs), live receipt | Task used only `list_mailboxes`; no draft/message writes or send calls. |
| No wallet / private key / signing / funds usage | PASS | Source and invocation audit; [Avalanche source](../../demo/avalanche/avalanche.mjs) | Read-only RPC methods; no wallet/PayBox tools invoked or private keys read. |
| No secret leaked | PASS | Scoped scan and publication-boundary tests | OAuth stays in native Codex storage. User callback was forwarded without persisting or printing its code. Pattern scans are scoped evidence, not a general security guarantee. |
| No production trading or other repository changes | PASS | [intake.txt](intake.txt), scoped Git diff | Product edits confined to this repository; user-authorized Mermail MCP registration is the sole external configuration change. |
| No PR / bounty / social publication | PASS | Git/task command audit | Submission and PR documents remain drafts. The user subsequently authorized a scoped commit and push only. |
| Independent final review | PASS | [independent-review.md](independent-review.md), [review-manifest-final.json](review-manifest-final.json) | Three demonstrated defects repaired; same reviewer verified fixes with 14 focused regressions, 0 failed/skipped. 33 final manifest hashes matched. |

PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.

SAFE TO DEMO: YES, as a truthfully labeled fixture or mixed-evidence demonstration. Full live Mermail record verification is not complete. Missing email evidence is not evidence of a failed email.

Reproduce: `npm run demo:offline` (fully local), or `npm run demo:live` (current OAuth and network required), then `npm run demo:serve`. Open `http://127.0.0.1:8765/report.html`. With Windows Edge and SSH to Ubuntu, use an SSH local port forward for port 8765; the service intentionally binds Ubuntu loopback only.
