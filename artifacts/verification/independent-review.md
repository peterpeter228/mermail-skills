# Independent final review

Result: **PASS after focused repair verification — R1, R2 and R3 are fixed.** The original findings below are retained as review history; no demonstrated finding remains open in the reviewed scope.

Reviewer did not implement this change. Read-only review except this receipt. Smoke confirmed `/root/code/mermail-skills`, HEAD `b6b98f3bf3d27373f80b403a84dcba370af8b882`, and ripgrep 15.2.0. All 33 entries in `review-manifest.json` matched their current SHA-256 values during review. Scope includes the verifier skill/scripts/references, Avalanche companion, dedicated tests, six tracked integration edits, demo material and verification receipts. The Windows forwarding and current-live-status additions to the checklist were included.

## Original findings — all resolved

### R1 — P2: discovery block identities are not bound to the recent-block request

Location: `demo/avalanche/avalanche.mjs:103-106`, `sampleTransaction`.

The sampler accepts any `transactions` array from the discovery block response without validating that block's number/hash against the requested number or the later verified transaction block. A stale or inconsistent RPC discovery result can therefore produce successful evidence outside the advertised five-block recent window. This also drops a conflicting block observation instead of failing closed.

Reproduced without network using injected RPC responses: `eth_blockNumber` returns `0x64`; the requested discovery block `0x64` returns `{number:'0x1', hash:B, transactions:[H]}`; transaction, receipt and final block consistently return block `0x1`. Actual result: `RECEIPT_SUCCESS_OBSERVED`, observed block `0x1`, `discovery.recent_block_window:5`, seven calls. Expected: reject the conflicting discovery identity. Also bind an otherwise valid discovery block's hash/number to the selected transaction's verification result, so a transaction from another block cannot silently pass. Add targeted regression coverage while preserving the shared call ceiling.

### R2 — P2: direct chain CLI reports LIVE when the endpoint is unreachable

Location: `demo/avalanche/avalanche.mjs:87`, `109`, and CLI serialization at `119-124`.

Both exported collection functions retain their initial `evidence_source:'LIVE'` when RPC transport fails before any observation. The documented direct `sample` and `verify` commands serialize that result unchanged. `run-demo.mjs` changes its own RPC-unavailable result to BLOCKED, but that does not cover these actual consumers or the sample persisted before the adjustment.

Reproduced without network: call `verifyTransaction` with a valid mainnet hash, default LIVE origin, `retries:0`, and `fetchImpl` throwing a transport error. Actual output: `assessment:'RPC_UNAVAILABLE'`, `evidence_source:'LIVE'`, `reason_code:'TRANSPORT_ERROR'`. Expected for an unreachable live endpoint: BLOCKED origin, keeping the unavailable assessment and reason. Apply this at the shared collection boundary, preserving FIXTURE/RECORDED origins in injected/replay tests, and cover both sample and verify.

### R3 — P2: inherited object keys become recognized mail states

Location: `skills/mermail-send-verifier/scripts/classify-mail.mjs:2`, `34`, `42`.

`recordStates` is a normal object and lookups do not require own keys. A normalized record with an unknown state such as `constructor` or `__proto__` therefore reads an inherited property as a recognized status. With a valid sent claim and matching mailbox, selected ID and recipient, both inputs return `NOT_SUPPORTED_BY_SELECTED_RECORD`; their `record_status` values are respectively a function and an object. A regular unknown state returns UNVERIFIED.

Expected: unknown states remain UNVERIFIED and statuses remain supported strings. Use an own-key check or a map with no inherited keys, and add regressions for these observed counterexamples. This is an internal normalized-input defect; no live email mapping currently reaches it because the deliberately conservative live normalizer returns unknown fields.

## Completed scope and evidence

- Read the repository requirements, source, tests, integration diff and existing verification receipts before forming findings. Used the code-review skill; no implementation or extra reviewer delegation.
- Confirmed no diff to the upstream validator. Skill/infrastructure registration preserves tool owners; sends and deletion retain their original routing, and payment requests do not grant verifier payment authority.
- Inspected mail M1–M12 paths, duplicates, missing data, scanner/body omission, unavailable evidence, state upgrades and origins. No additional supported defect beyond R3 found. Live normalizer does not guess provider fields; the empty live mailbox result leaves selected-record evidence BLOCKED.
- Inspected mainnet/Fuji allowlists, chain-first ordering, transaction/receipt/block identity comparisons, null receipts, success/failure separation, BigInt/hex values, HTTP/JSON-RPC errors, bounded timeouts/retries and sample call limits. R1 and R2 are the demonstrated gaps.
- Inspected report projection, recursive redaction, HTML escaping, inert content, three separate cards, fixed business NOT_VERIFIED, public-third-party warning, and loopback server isolation. No demonstrated send, wallet, key, signing, broadcast, trading or page network execution path found in the reviewed product code.
- Reused receipts rather than repeating passed suites: upstream baseline 16 skills/71 tools; final validator 17 skills/71 tools; feature tests 92 passed, zero failed/skipped. Reviewed scoped placeholder/secret scan and HTTP isolation receipts. These receipts do not cover the three new counterexamples above.
- Reviewed live receipts: Mermail connection/catalog/list_mailboxes succeeded with zero mailboxes; no selected mail record was observed. Avalanche report contains matching mainnet transaction/receipt/block data and independent repeat evidence. No external live calls were performed by this reviewer.
- Demo and draft documents disclose fixture/live distinctions, unknown business state, blocked mail records and absence of official acceptance. Current report correctly shows mail BLOCKED, Avalanche LIVE and business NOT_RUN/NOT_VERIFIED.

Review limits: scoped static review plus three deterministic counterexamples; existing live/test/scan/server receipts were inspected, not independently regenerated. No general security guarantee or complete live Mermail verification is asserted. Keep this review cursor for focused repair verification; do not restart unrelated review or checks.

## Focused repair verification

Kept the same review cursor and inspected only the two changed source files, corresponding mail/Avalanche regressions and updated evidence. All 33 entries in `review-manifest-final.json` matched current files. Manifest SHA-256: `c26f30338d6b3c2eebbeedab6a7e703711e40425f3f27447e30bb6ab18d7a586`.

| Finding | Final status | Evidence |
| --- | --- | --- |
| R1: discovery identity binding | FIXED | Discovery validates hash/number and requested height, then binds available transaction/receipt/block identity back to discovery. Original latest `0x64` / block `0x1` repro now returns EVIDENCE_CONFLICT / DISCOVERY_BLOCK_NUMBER_MISMATCH. Regressions also cover missing discovery identity and independently verified block hash/height mismatches. |
| R2: unreachable live origin | FIXED | Shared `rpcFailure` changes LIVE to BLOCKED in both verify and sample, retains unavailable reason and partial observations, and preserves non-live origins. Independently reran both functions with LIVE, RECORDED and FIXTURE origins; all matched the required result. Direct CLI regression confirms BLOCKED serialization and exit 2. |
| R3: inherited state keys | FIXED | Record statuses use Map lookup. Independently repeated constructor and __proto__ repros; both assessment and record_status are UNVERIFIED. Regression coverage also includes toString and hasOwnProperty. |

Reviewer ran the focused command `node --test --test-name-pattern='discovery|another block|different height|unreachable|partial live|inherited-property' tests/send-verifier/avalanche.test.mjs tests/send-verifier/mail.test.mjs`: **14 passed, 0 failed, 0 skipped**, exit 0. The reviewer also reran the three original counterexamples with assertions; all fixes held. Inspected updated full-suite receipt: **106 passed, 0 failed, 0 skipped**, exit 0. Post-fix Avalanche receipt is captured at `2026-09-18T05:20:14.363Z`, LIVE / RECEIPT_SUCCESS_OBSERVED. No additional live calls were made by the reviewer.

The PASS applies to reviewed implementation and the resolved findings, not to full live Mermail message verification, which remains blocked by zero returned mailboxes. Commit/push authorization and destination permissions are outside this review; no Git mutation or publication was performed by the reviewer.
