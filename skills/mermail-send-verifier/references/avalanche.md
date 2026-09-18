# Separate Avalanche execution companion

The repository companion is `demo/avalanche/avalanche.mjs`; it is not a Mermail tool or a payment skill. It uses Node built-in fetch and official allowlisted endpoints for mainnet (`43114`, `0xa86a`) and Fuji (`43113`, `0xa869`). User-selected network/hash and local allowlists determine requests; email and RPC responses cannot override them.

From the repository root:

```bash
node demo/avalanche/avalanche.mjs sample --network mainnet
node demo/avalanche/avalanche.mjs verify --network mainnet --tx <hash>
```

Sampling obtains `eth_blockNumber` and searches a strictly bounded recent window/call budget for one public sample, saving minimal evidence to excluded `private-evidence/avalanche-live-sample.json`. Independently repeat verification for that hash. An unreachable endpoint means live `BLOCKED`; do not substitute fixture success.

Verify `eth_chainId` first, then `eth_getTransactionByHash`, `eth_getTransactionReceipt` and `eth_getBlockByNumber` when receipt block data exists. Compare requested hash, transaction hash, receipt transactionHash, all available transaction/receipt/block hashes and numbers, sender and target. Preserve large numbers as hex/string or BigInt.

Assessments are `CHAIN_UNVERIFIED`, `NETWORK_MISMATCH`, `TX_NOT_FOUND`, `RECEIPT_NOT_AVAILABLE`, `RECEIPT_SUCCESS_OBSERVED`, `RECEIPT_FAILURE_OBSERVED`, `EVIDENCE_CONFLICT`, `RPC_UNAVAILABLE`, or `UNSUPPORTED`. Null receipt means unavailable. Receipt `0x1`/`0x0` means observed execution success/failure only. HTTP 200 may still carry JSON-RPC errors. Requests have timeouts and limited retries; distinguish 429, 5xx and transport failures.

Business / Payment Relationship is always `NOT_VERIFIED`. Never output `PAID`, `PAYMENT_CONFIRMED` or `INVOICE_SETTLED` from chain data.

PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.

No invoice settlement, customer/wallet identity, token ownership, finality guarantee, bridging, signing or transaction submission is implemented in v1.
