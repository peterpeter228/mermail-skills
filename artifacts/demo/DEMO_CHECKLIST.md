# Demo checklist

- [ ] Use Node 22 or newer and the intended feature checkout.
- [ ] Read `../verification/FINAL_VERIFICATION.md`: check actual test results, capture dates and live blockers.
- [ ] Run `npm run demo:offline`; confirm the report's fixture source labels.
- [ ] Run `npm run demo:serve`; open <http://127.0.0.1:8765/report.html>. Serve only `artifacts/demo/` on localhost.
- [ ] Show the separate Mail Record, Avalanche Execution and Business / Payment Relationship cards.
- [ ] Say “An agent saying ‘done’ is not evidence.” Show the sent claim against the selected draft and its `NOT_SUPPORTED_BY_SELECTED_RECORD` assessment.
- [ ] Distinguish a record from delivery, and delivery from recipient reading.
- [ ] Explain that offline Avalanche data is a fixture. For public live data, display: “PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.”
- [ ] Confirm business state remains `NOT_VERIFIED` regardless of receipt status.
- [ ] Show actual test output from `../verification/feature-tests.txt`; quote only its current count.
- [ ] Close with one real workflow and 2–3 anonymized failure cases for a small read-only pilot.

For an optional live segment, run `npm run demo:live` and inspect both results. Do not treat OAuth configuration as connection proof. Initialization, tool discovery, `list_mailboxes`, and selected-record evidence require their own receipts. Read only an unmistakable test mailbox or a user-selected test mailbox, with bounded searches. If access is blocked, keep that result visible and use the explicitly labeled offline demo.

Before screen sharing, close authentication pages and terminals that could expose credentials. Do not show private captures or mailbox dumps. Do not send mail, create a remote draft, invoke wallet/PayBox tools, sign transactions or publish these drafts. The HTTP server must never expose the repository root or `private-evidence/`.

## Windows Edge over SSH

The demo server binds only to Ubuntu loopback. Add `-L 8765:127.0.0.1:8765` to your usual Windows SSH command, keep that SSH session open, then open `http://127.0.0.1:8765/report.html` in Edge. Do not bind the server to a public interface. The same loopback distinction explains why a browser OAuth callback can need forwarding to the Ubuntu login listener.

## Verified capture for this delivery

Mermail OAuth and catalog discovery succeeded (85 tools); `list_mailboxes` returned zero mailboxes. The live mail-record card is therefore BLOCKED, not an authorization failure. Avalanche mainnet execution was verified and independently reread. Use the offline fixture script to demonstrate draft-versus-sent classification; use the live report to demonstrate honest missing-evidence handling. See `../verification/FINAL_VERIFICATION.md` for counts and capture references.

## Current authorized live draft capture — 2026-09-18

The earlier zero-mailbox/BLOCKED capture is historical and preserved under `../verification/history/pre-live-draft/`. The user subsequently authorized exactly one dedicated hosted demo mailbox and one synthetic self-addressed draft. The setup audit records one mailbox creation, one draft save, zero sends and zero wallet calls. This was a bounded setup exception; demonstration and replay do not authorize creating more drafts or sending mail.

An independent safe metadata-only `get_email` read observed the selected ID, scalar self-recipient and `folder_id: draft`. These are actual hosted LIVE observations of synthetic demo content; replaying their saved receipts is RECORDED. Body content was withheld (`content_omitted: true`, `scan_status: null`, reason `scan_status_not_clean`), with the scanner requirement preserved. No sent record, delivery, external reading, or payment was verified. See `../verification/mermail-field-map.md` and the current-session matrix in `../verification/FINAL_VERIFICATION.md` for the exact evidence and subsequent regression/report checks. The historical 106-test result is a baseline; quote the current saved feature-test output for the latest count.

The current live report observes `DRAFT_RECORD_FOUND` and rejects the sent claim as `NOT_SUPPORTED_BY_SELECTED_RECORD`. Its separate Avalanche card observes public execution success; business remains `NOT_VERIFIED`. `npm run demo:live` uses the local pinned demo identities and performs reads only; it does not repeat setup writes.

Current post-change checks: 123 dedicated tests passed, 0 failed, 0 skipped; repository validator passed (17 skills, 71 business tools). Fresh live report HTTP checks returned 200; private and repository traversal checks returned 403. Receipts are under `../verification/live-draft-setup/`. Independent review status is recorded separately in the current final matrix.
