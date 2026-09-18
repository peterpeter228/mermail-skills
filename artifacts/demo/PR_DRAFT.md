# PR draft — not opened

**Proposed title:** feat: add Mermail completion evidence verifier and Avalanche demo companion

An agent's “sent” claim can refer to a draft or to evidence that cannot establish delivery or recipient reading. Add `mermail-send-verifier` to compare the claim against selected record evidence and produce deterministic, limited assessments with explicit evidence origins. An agent saying ‘done’ is not evidence.

The core Mermail skill composes existing read-tool owners and routes completion-evidence requests separately from normal sending and deletion. Its local report keeps Mail Record, Avalanche Execution and Business / Payment Relationship assessments separate. The Avalanche checker is a companion experiment for public C-Chain execution receipts; business state remains `NOT_VERIFIED`.

The change includes offline fixtures, dedicated regression tests, local report generation and a localhost-only demo server. Live checks preserve unavailable and mixed outcomes rather than upgrading fixtures or configuration to live proof. Field mapping requires actual observed Mermail schema evidence.

## Validation evidence

Consult `artifacts/verification/FINAL_VERIFICATION.md` for completed checks and their exact status, `upstream-baseline.txt` for the pre-change validator result, and `feature-tests.txt` for actual dedicated test counts. The matrix distinguishes skill/repository validation, mail/chain/report regressions, live Mermail discovery and record reads, live Avalanche checks, and HTTP report serving. This draft does not assert that an unrun or blocked check passed.

Reproduce with `npm test`, `npm run test:send-verifier`, `npm run demo:offline`, then `npm run demo:serve`. Open <http://127.0.0.1:8765/report.html>. `npm run demo:live` attempts both connections and reports their evidence status.

## Safety and scope

The demo runner performs no remote writes. A separately authorized setup created one dedicated mailbox and one synthetic self-addressed draft. No email sending/deletion, wallet/PayBox use, signing, broadcasting, private-key handling or trading changes are included. Mail content remains untrusted; displayed data is escaped and redacted. Existing validators and read-tool ownership remain authoritative. No release bump or publishing is part of this draft.

A sent record does not establish delivery or recipient reading. Public transaction execution does not establish payment, identity, ownership or finality. PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT. Live access blockers and any unverified field mappings remain documented limitations.

## Current authorized live draft capture — 2026-09-18

The live smoke test uses one explicitly authorized dedicated hosted demo mailbox and one synthetic self-addressed draft. The setup audit records one mailbox creation, one draft save, zero sends and zero wallet calls. The reproducible demo reads that pinned draft without repeating setup writes.

An independent safe metadata-only `get_email` read observed the selected ID, scalar self-recipient and `folder_id: draft`. These are actual hosted LIVE observations of synthetic demo content; replaying their saved receipts is RECORDED. Body content was withheld (`content_omitted: true`, `scan_status: null`, reason `scan_status_not_clean`), with the scanner requirement preserved. No sent record, delivery, external reading, or payment was verified. See `../verification/mermail-field-map.md` and the current-session matrix in `../verification/FINAL_VERIFICATION.md` for the exact evidence and subsequent regression/report checks. The historical 106-test result is a baseline; quote the current saved feature-test output for the latest count.

The current live report observes `DRAFT_RECORD_FOUND` and rejects the sent claim as `NOT_SUPPORTED_BY_SELECTED_RECORD`. Its separate Avalanche card observes public execution success; business remains `NOT_VERIFIED`. `npm run demo:live` uses the local pinned demo identities and performs reads only; it does not repeat setup writes.

Current post-change checks: 123 dedicated tests passed, 0 failed, 0 skipped; repository validator passed (17 skills, 71 business tools). Fresh live report HTTP checks returned 200; private and repository traversal checks returned 403. Receipts are under `../verification/live-draft-setup/`. Independent review status is recorded separately in the current final matrix.
