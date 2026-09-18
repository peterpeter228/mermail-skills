// Deliberately artificial identifiers: deterministic evidence, never live RPC.
export const FIXTURE_TX_HASH = '0x' + 'a'.repeat(64);
const blockHash = '0x' + 'b'.repeat(64);
const from = '0x' + '1'.repeat(40);
const to = '0x' + '2'.repeat(40);
export function fixtureFetch(_url, options) {
  const request = JSON.parse(options.body);
  const responses = {
    eth_chainId: '0xa86a',
    eth_getTransactionByHash: { hash: FIXTURE_TX_HASH, blockHash, blockNumber: '0x20000000000001', from, to, value: '0x20000000000001', nonce: '0x20000000000001' },
    eth_getTransactionReceipt: { transactionHash: FIXTURE_TX_HASH, blockHash, blockNumber: '0x20000000000001', from, to, status: '0x1' },
    eth_getBlockByNumber: { hash: blockHash, number: '0x20000000000001', transactions: [FIXTURE_TX_HASH] },
  };
  return Promise.resolve({ ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: request.id, result: responses[request.method] }) });
}
