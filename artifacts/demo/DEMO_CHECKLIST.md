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
