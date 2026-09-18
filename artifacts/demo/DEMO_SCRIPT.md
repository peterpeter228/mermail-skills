# Mermail Send Verifier — demo scripts

Evidence-based completion checks for AI agents

Presenter setup: run `npm run demo:offline`, then `npm run demo:serve`, and open <http://127.0.0.1:8765/report.html>. Both scripts below narrate the offline fixture demonstration. Read the current source badge before showing any other capture. Use `../verification/FINAL_VERIFICATION.md` and `../verification/feature-tests.txt` for actual validation results; do not quote a count from memory. Live access, catalog discovery, mailbox reads and selected-record evidence are separate checks.

## 90-second script

An agent saying ‘done’ is not evidence. When an automation says it sent an email, a person still needs to know what the system actually recorded.

This is Mermail Send Verifier. In this offline example, the claim says “sent,” but the selected record is a draft. The source badge says FIXTURE. The assessment is NOT_SUPPORTED_BY_SELECTED_RECORD. We have demonstrated the decision rule, without claiming a live mailbox observation.

The report keeps the claim, observed fields, evidence references and limitations together. A sent record would still not prove delivery or that the recipient read it. Missing evidence stays unknown.

The separate Avalanche card demonstrates checking a public transaction receipt. This offline card also uses fixture evidence. A live run checks the network, transaction and receipt identities, and block consistency before reporting observed execution success or failure.

The Business / Payment Relationship card remains NOT_VERIFIED. Public third-party transaction for demo only. This is not the user's payment.

The regression suite exercises these boundaries; the verification record contains the actual results and any live blockers. No email is sent and no transaction is signed.

My pilot ask is one team, one real workflow, and two or three anonymized failure cases for a small read-only evaluation.

## Approximately 130-second script

An agent saying ‘done’ is not evidence. An automation can produce a convincing completion message while the underlying action remains a draft, is still processing, or cannot be checked. Mermail Send Verifier makes that gap visible.

Start with the Mail Record card. The agent claims an email was sent. The selected record in this offline example is a draft, and its source is explicitly FIXTURE. The assessment is NOT_SUPPORTED_BY_SELECTED_RECORD. This demonstrates deterministic classification; it does not establish what happened in a live mailbox.

Each case retains the expected recipient, observed evidence, capture time, limitations and references. A wrong observed recipient is a mismatch. A missing recipient field stays unknown. Multiple matching message IDs remain ambiguous. A timeout means evidence is unavailable, not that sending failed. Even a sent copy or a mailbox read flag cannot prove the external recipient read the email.

Now look at Avalanche Execution, a separate companion experiment. The offline view uses fixtures. For a live public sample, the checker verifies the chain ID, compares the transaction and receipt hashes, and checks block data. A successful receipt establishes observed execution only. Null receipts and conflicting identities do not become success.

The Business / Payment Relationship card always remains NOT_VERIFIED. Public third-party transaction for demo only. This is not the user's payment. There is no invoice settlement or customer identity inference.

The tests cover classification, unavailable evidence, conflicting chain data, injection and redaction. Open the verification record for actual test counts and live access status. Email content remains untrusted data; this demonstration sends nothing and uses no wallet or private key.

I work on Python AI automation, execution verification and regression testing. I am looking for one team with one real workflow and two or three anonymized failure cases for a small paid, read-only pilot.

## Optional live evidence segment

Run `npm run demo:live` before presenting, then inspect the new report and final verification record. Say “live” only for cards labeled LIVE and explain BLOCKED or NOT_RUN cards directly. RECORDED means replayed capture, not a fresh observation. Do not replace fixture narration with claims of live Mermail access based on configuration or a tool catalog. A public Avalanche observation does not verify the Mermail connection or a payment relationship.
