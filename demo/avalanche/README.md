# Avalanche execution companion

This module checks public C-Chain execution independently of Mermail evidence.
Business state is always `NOT_VERIFIED`.

PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.

```sh
node demo/avalanche/avalanche.mjs sample --network mainnet
node demo/avalanche/avalanche.mjs verify --network mainnet --tx <public-hash>
node --test tests/send-verifier/avalanche.test.mjs
```

Sample discovery examines at most five recent blocks, with a shared ceiling of
16 requests including retries and verification. A selected sample is verified
through a fresh chain ID, transaction, receipt and block lookup. The CLI saves
minimal sample evidence to `private-evidence/avalanche-live-sample.json`; run the
second command independently with its returned `tx_hash` for repeat evidence.
Only two hardcoded official RPC endpoints are reachable. Each request includes
its response-body deadline (default five seconds), at most one retry, and JSON-RPC
envelope validation. Errors return stable reason codes, never provider error text.
CLI exit 0 means an execution success or failure receipt was observed; other
assessments exit 2. Exit 0 does not indicate business acceptance.

`verifyTransaction` accepts `network`, `txHash`, `evidenceSource`, and optional
`fetchImpl`, `timeoutMs`, `retries`. `sampleTransaction` accepts the same options
without `txHash`. A caller replaying stored evidence must pass `RECORDED`;
tests and `fixture.mjs` consumers must pass `FIXTURE`. Mock transport is injectable
only as program code, never through CLI, RPC or email data. Sample discovery is
the explicit bounded exception allowing RPC block results to propose a public
transaction; they cannot choose the network or endpoint.

Amounts, nonces and block numbers stay hex strings, with BigInt comparisons.
A missing receipt is unavailable, a status `0x0` is observed execution failure,
and status `0x1` is observed execution success. None establishes payment identity,
invoice settlement, recipient ownership, finality or token ownership. No signing,
wallet, key, broadcast, transfer, swap, or gas-paying operation exists here.
