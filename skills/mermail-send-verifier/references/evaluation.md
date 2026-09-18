# Local evaluation and outputs

Node 22+ is required. From the repository root:

```bash
npm test
npm run test:send-verifier
npm run demo:offline
npm run demo:live
npm run demo:serve
```

Offline mode requires no credentials or network. Fixtures remain `FIXTURE`; local invented observations remain `SYNTHETIC`. Live mode attempts both Mermail and Avalanche and preserves mixed or blocked results. Replayed evidence is `RECORDED`. Do not claim live success from configuration or test success.

Open `http://127.0.0.1:8765/report.html`. `artifacts/demo/report.json` and `report.html` show Mail Record, Avalanche Execution and Business / Payment Relationship separately, including claim, observations, assessment, origin, capture time, limitations and evidence references. No global paid/success verdict.

Core code lives in this skill's `scripts/`: `contracts.mjs`, `classify-mail.mjs`, `normalize-mermail.mjs`, `build-report.mjs`, `render-report.mjs`, `run-demo.mjs`, `live-mermail.mjs` and `serve-demo.mjs`. The Avalanche code remains in its separate companion directory. See current executable exports for internal fixture schemas; do not treat them as a live Mermail schema.

Dedicated feature tests cover M1–M12; mainnet/Fuji/mismatch; absent transaction/receipt; receipt success/failure; JSON-RPC, 429, 5xx and timeout errors; hash/block conflicts; large integers; business `NOT_VERIFIED`; injection, redaction, origins and evidence references. Scenario catalog entries document intended routing and do not alone prove client behavior.

Retain upstream baseline output in `artifacts/verification/upstream-baseline.txt`, actual feature output in `feature-tests.txt`, and requirement-level PASS/FAIL/BLOCKED/NOT_RUN evidence in `FINAL_VERIFICATION.md`. Missing live access is a blocker, not a test failure or permission to fabricate evidence.
