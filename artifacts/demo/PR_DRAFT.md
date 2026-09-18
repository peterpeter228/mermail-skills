# PR draft — not opened

**Proposed title:** feat: add Mermail completion evidence verifier and Avalanche demo companion

An agent's “sent” claim can refer to a draft or to evidence that cannot establish delivery or recipient reading. Add `mermail-send-verifier` to compare the claim against selected record evidence and produce deterministic, limited assessments with explicit evidence origins. An agent saying ‘done’ is not evidence.

The core Mermail skill composes existing read-tool owners and routes completion-evidence requests separately from normal sending and deletion. Its local report keeps Mail Record, Avalanche Execution and Business / Payment Relationship assessments separate. The Avalanche checker is a companion experiment for public C-Chain execution receipts; business state remains `NOT_VERIFIED`.

The change includes offline fixtures, dedicated regression tests, local report generation and a localhost-only demo server. Live checks preserve unavailable and mixed outcomes rather than upgrading fixtures or configuration to live proof. Field mapping requires actual observed Mermail schema evidence.

## Validation evidence

Consult `artifacts/verification/FINAL_VERIFICATION.md` for completed checks and their exact status, `upstream-baseline.txt` for the pre-change validator result, and `feature-tests.txt` for actual dedicated test counts. The matrix distinguishes skill/repository validation, mail/chain/report regressions, live Mermail discovery and record reads, live Avalanche checks, and HTTP report serving. This draft does not assert that an unrun or blocked check passed.

Reproduce with `npm test`, `npm run test:send-verifier`, `npm run demo:offline`, then `npm run demo:serve`. Open <http://127.0.0.1:8765/report.html>. `npm run demo:live` attempts both connections and reports their evidence status.

## Safety and scope

No email sending/deletion, remote demo draft creation, wallet/PayBox use, signing, broadcasting, private-key handling or trading changes belong to this demo. Mail content remains untrusted; displayed data is escaped and redacted. Existing validators and read-tool ownership remain authoritative. No release bump or publishing is part of this draft.

A sent record does not establish delivery or recipient reading. Public transaction execution does not establish payment, identity, ownership or finality. PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT. Live access blockers and any unverified field mappings remain documented limitations.
