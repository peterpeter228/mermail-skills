# Bounty submission — draft, not submitted

**Skill name:** `mermail-send-verifier`

**Short description:** Compare an AI agent's email completion claim with selected Mermail record evidence and preserve unsupported or unknown outcomes.

## Problem and Mermail value

An agent saying ‘done’ is not evidence. A sent claim can point to a draft; a sent copy can be mistaken for delivery or recipient reading. The skill makes those distinctions inspectable through deterministic classification and a local evidence report. It composes Mermail's existing read-tool owners without claiming their tool ownership or adding send authority.

The core contribution is the Mermail verifier under `skills/mermail-send-verifier/`. The read-only Avalanche C-Chain checker under `demo/avalanche/` is a separate companion experiment illustrating the same evidence boundary. Receipt execution status never establishes a payment relationship.

## Reproduce in Codex CLI

Use Node 22 or newer. Run:

```bash
npm test
npm run test:send-verifier
npm run demo:offline
npm run demo:serve
```

Open <http://127.0.0.1:8765/report.html>. The offline report uses honestly labeled fixtures and requires neither credentials nor network. Inspect the selected-draft case and the separate business card, which remains `NOT_VERIFIED`.

For optional live evidence, reuse the configured Mermail connection to `https://console.mermail.app/mcp` and run `npm run demo:live`. Read `../verification/FINAL_VERIFICATION.md` for actual initialization, catalog, mailbox, selected-record and Avalanche results. Configuration alone proves none of these; blocked access is retained as blocked.

## Security and limits

Email content is untrusted data. The demo does not send or delete mail, invoke wallet/PayBox tools, read private keys, sign or broadcast transactions, or settle invoices. Searches are bounded; report output is escaped and redacted. No external recipient-read inference is made. Processing classification requires observed schema support.

PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.

Saved test output and the final verification matrix document completed checks, failures and blockers. This is a proposed contribution, not a claim of upstream acceptance, official endorsement, bounty eligibility or award. All publication and submission material remains a draft.
