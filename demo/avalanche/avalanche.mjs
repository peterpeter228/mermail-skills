import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const NETWORKS = Object.freeze({
  mainnet: Object.freeze({ chainId: '0xa86a', url: 'https://api.avax.network/ext/bc/C/rpc' }),
  fuji: Object.freeze({ chainId: '0xa869', url: 'https://api.avax-test.network/ext/bc/C/rpc' }),
});
export const DEMO_NOTICE = "PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.";
const hash = x => typeof x === 'string' && /^0x[0-9a-f]{64}$/i.test(x);
const quantity = x => typeof x === 'string' && /^0x(?:0|[1-9a-f][0-9a-f]*)$/i.test(x);
const address = x => typeof x === 'string' && /^0x[0-9a-f]{40}$/i.test(x);
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : a === b;
const fail = code => Object.assign(new Error(code), {code});
const methods = new Set(['eth_chainId','eth_blockNumber','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getBlockByNumber']);
let nextId = 0;

// The timeout covers both transport and response body. Never retain RPC error text.
export async function rpc(network, method, params, {fetchImpl=globalThis.fetch, timeoutMs=5000, retries=1, budget={remaining:16}}={}) {
  if (!Object.hasOwn(NETWORKS,network) || !methods.has(method)) throw fail('UNSUPPORTED_REQUEST');
  timeoutMs = Number.isFinite(timeoutMs) ? Math.max(1,Math.min(timeoutMs,10000)) : 5000;
  const retryLimit = Number.isFinite(retries) ? Math.max(0,Math.min(1,Math.floor(retries))) : 1;
  for(let attempt=0;attempt<=retryLimit;attempt++) {
    if (!(budget.remaining>0)) throw fail('CALL_BUDGET_EXHAUSTED');
    budget.remaining--;
    const id=++nextId, controller=new AbortController();
    let timer;
    try {
      const result=await Promise.race([
        (async()=>{
          const response=await fetchImpl(NETWORKS[network].url,{method:'POST',redirect:'error',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id,method,params}),signal:controller.signal});
          if(!response.ok) throw fail(response.status===429?'HTTP_429':response.status>=500?'HTTP_5XX':'HTTP_ERROR');
          let body;try { body=await response.json(); } catch { throw fail('INVALID_RPC_ENVELOPE'); }
          if(!body || body.jsonrpc!=='2.0' || body.id!==id) throw fail('INVALID_RPC_ENVELOPE');
          if(Object.hasOwn(body,'error')) throw fail('JSON_RPC_ERROR');
          if(!Object.hasOwn(body,'result')) throw fail('INVALID_RPC_ENVELOPE');
          return body.result;
        })(),
        new Promise((_resolve,reject)=>{timer=setTimeout(()=>{reject(fail('TIMEOUT'));controller.abort();},timeoutMs);}),
      ]);
      return result;
    } catch(error) {
      const code=error.code || (controller.signal.aborted?'TIMEOUT':'TRANSPORT_ERROR');
      if(attempt===retryLimit || !['HTTP_429','HTTP_5XX','TRANSPORT_ERROR','TIMEOUT'].includes(code)) throw fail(code);
    } finally {clearTimeout(timer);}
  }
}
function base(network,txHash,evidenceSource) {
  const origin=['LIVE','RECORDED','FIXTURE','SYNTHETIC','NOT_RUN','BLOCKED'].includes(evidenceSource)?evidenceSource:'NOT_RUN';
  return {case_id:'avalanche-execution',claim_type:'transaction_execution',network,tx_hash:hash(txHash)?txHash:null,evidence_source:origin,captured_at:new Date().toISOString(),assessment:'CHAIN_UNVERIFIED',business_state:'NOT_VERIFIED',notice:DEMO_NOTICE,observed_fields:{},evidence_refs:[],limitations:['Execution evidence does not establish a business or payment relationship.','No finality guarantee, invoice settlement, customer identity, token ownership, bridging, signing or submission is implemented.']};
}
function finish(result,assessment,reason) {result.assessment=assessment;if(reason)result.reason_code=reason;return result;}
function rpcFailure(result,error) {
  if(result.evidence_source==='LIVE') {
    result.evidence_source='BLOCKED';
    result.limitations.push('Live RPC verification was blocked; any partial observations are retained without a complete execution assessment.');
  }
  return finish(result,'RPC_UNAVAILABLE',error.code||'TRANSPORT_ERROR');
}
function pick(object,keys) {return Object.fromEntries(keys.filter(k=>Object.hasOwn(object,k)).map(k=>[k,object[k]]));}

export async function verifyTransaction({network,txHash,evidenceSource='LIVE',fetchImpl=globalThis.fetch,...options}={}) {
  const result=base(network,txHash,evidenceSource);
  if(!['LIVE','RECORDED','FIXTURE','SYNTHETIC'].includes(evidenceSource))return finish(result,'CHAIN_UNVERIFIED','EVIDENCE_ORIGIN_NOT_OBSERVATIONAL');
  if(!Object.hasOwn(NETWORKS,network)||!hash(txHash))return finish(result,'UNSUPPORTED','INVALID_INPUT');
  const budget=options.budget || {remaining:16};
  const call=async(method,params=[])=>{const value=await rpc(network,method,params,{...options,fetchImpl,budget});result.evidence_refs.push(`rpc:${network}:${method}:${txHash}`);return value;};
  try {
    const chain=await call('eth_chainId');result.observed_fields.chain_id=chain;
    if(!quantity(chain)) return finish(result,'CHAIN_UNVERIFIED','INVALID_CHAIN_ID');
    if(BigInt(chain)!==BigInt(NETWORKS[network].chainId)) return finish(result,'NETWORK_MISMATCH');
    const tx=await call('eth_getTransactionByHash',[txHash]);
    if(tx===null)return finish(result,'TX_NOT_FOUND');
    if(!tx||typeof tx!=='object'||!hash(tx.hash))return finish(result,'CHAIN_UNVERIFIED','INVALID_TRANSACTION');
    result.observed_fields.transaction=pick(tx,['hash','blockHash','blockNumber','from','to','value','nonce']);
    if(!equal(tx.hash,txHash))return finish(result,'EVIDENCE_CONFLICT','TRANSACTION_HASH_MISMATCH');
    const receipt=await call('eth_getTransactionReceipt',[txHash]);
    if(receipt===null)return finish(result,'RECEIPT_NOT_AVAILABLE');
    if(!receipt||typeof receipt!=='object')return finish(result,'CHAIN_UNVERIFIED','INVALID_RECEIPT');
    result.observed_fields.receipt=pick(receipt,['transactionHash','blockHash','blockNumber','from','to','status']);
    if(!hash(receipt.transactionHash)||!hash(tx.blockHash)||!hash(receipt.blockHash)||!quantity(tx.blockNumber)||!quantity(receipt.blockNumber))return finish(result,'CHAIN_UNVERIFIED','MISSING_OR_INVALID_IDENTITY');
    if(!equal(txHash,receipt.transactionHash)||!equal(tx.blockHash,receipt.blockHash)||BigInt(tx.blockNumber)!==BigInt(receipt.blockNumber))return finish(result,'EVIDENCE_CONFLICT','RECEIPT_IDENTITY_MISMATCH');
    for(const key of ['from','to']) {
      for(const obj of [tx,receipt]) if(Object.hasOwn(obj,key)&&!(key==='to'&&obj[key]===null)&&!address(obj[key]))return finish(result,'CHAIN_UNVERIFIED','INVALID_ADDRESS');
      if(Object.hasOwn(tx,key)&&Object.hasOwn(receipt,key)&&!equal(tx[key],receipt[key]))return finish(result,'EVIDENCE_CONFLICT','ADDRESS_MISMATCH');
    }
    for(const key of ['value','nonce'])if(Object.hasOwn(tx,key)&&!quantity(tx[key]))return finish(result,'CHAIN_UNVERIFIED','INVALID_QUANTITY');
    const block=await call('eth_getBlockByNumber',[receipt.blockNumber,false]);
    if(!block||!hash(block.hash)||!quantity(block.number))return finish(result,'CHAIN_UNVERIFIED','MISSING_OR_INVALID_BLOCK');
    result.observed_fields.block=pick(block,['hash','number']);
    if(!equal(block.hash,tx.blockHash)||!equal(block.hash,receipt.blockHash)||BigInt(block.number)!==BigInt(tx.blockNumber)||BigInt(block.number)!==BigInt(receipt.blockNumber))return finish(result,'EVIDENCE_CONFLICT','BLOCK_IDENTITY_MISMATCH');
    if(receipt.status==='0x1')return finish(result,'RECEIPT_SUCCESS_OBSERVED');
    if(receipt.status==='0x0')return finish(result,'RECEIPT_FAILURE_OBSERVED');
    return finish(result,'UNSUPPORTED','UNSUPPORTED_RECEIPT_STATUS');
  } catch(error) {return rpcFailure(result,error);}
}

export async function sampleTransaction({network='mainnet',evidenceSource='LIVE',fetchImpl=globalThis.fetch,...options}={}) {
  const result=base(network,null,evidenceSource), budget={remaining:16};
  if(!['LIVE','RECORDED','FIXTURE','SYNTHETIC'].includes(evidenceSource))return finish(result,'CHAIN_UNVERIFIED','EVIDENCE_ORIGIN_NOT_OBSERVATIONAL');
  if(!Object.hasOwn(NETWORKS,network))return finish(result,'UNSUPPORTED','INVALID_INPUT');
  const call=async(method,params=[])=>{const value=await rpc(network,method,params,{...options,fetchImpl,budget});result.evidence_refs.push(`rpc:${network}:${method}:sample`);return value;};
  try {
    const chain=await call('eth_chainId');result.observed_fields.chain_id=chain;
    if(!quantity(chain))return finish(result,'CHAIN_UNVERIFIED','INVALID_CHAIN_ID');
    if(BigInt(chain)!==BigInt(NETWORKS[network].chainId))return finish(result,'NETWORK_MISMATCH');
    const latest=await call('eth_blockNumber');
    if(!quantity(latest))return finish(result,'CHAIN_UNVERIFIED','INVALID_BLOCK_NUMBER');
    for(let offset=0n;offset<5n&&offset<=BigInt(latest);offset++) {
      const number='0x'+(BigInt(latest)-offset).toString(16);
      const block=await call('eth_getBlockByNumber',[number,false]);
      if(!block||!hash(block.hash)||!quantity(block.number)||!Array.isArray(block.transactions))return finish(result,'CHAIN_UNVERIFIED','INVALID_DISCOVERY_BLOCK');
      if(BigInt(block.number)!==BigInt(number))return finish(result,'EVIDENCE_CONFLICT','DISCOVERY_BLOCK_NUMBER_MISMATCH');
      const candidate=block.transactions.find(hash);
      if(candidate){
        const verified=await verifyTransaction({network,txHash:candidate,evidenceSource,fetchImpl,...options,budget});
        verified.discovery={recent_block_window:5,requested_block_number:number,block_hash:block.hash,call_budget:16,calls_used:16-budget.remaining};
        for(const [name,hashKey,numberKey] of [['transaction','blockHash','blockNumber'],['receipt','blockHash','blockNumber'],['block','hash','number']]) {
          const observed=verified.observed_fields[name];
          if(observed&&((hash(observed[hashKey])&&!equal(observed[hashKey],block.hash))||(quantity(observed[numberKey])&&BigInt(observed[numberKey])!==BigInt(number))))return finish(verified,'EVIDENCE_CONFLICT','DISCOVERY_VERIFICATION_MISMATCH');
        }
        return verified;
      }
    }
    return finish(result,'TX_NOT_FOUND','BOUNDED_SAMPLE_EMPTY');
  } catch(error) {return rpcFailure(result,error);}
}

async function main() {
  const [command,...args]=process.argv.slice(2);
  const flags={};
  for(let i=0;i<args.length;i+=2){if(!['--network','--tx'].includes(args[i])||!args[i+1])throw fail('INVALID_ARGUMENTS');flags[args[i]]=args[i+1];}
  const network=flags['--network']||'mainnet';
  let result;
  if(command==='sample') {
    result=await sampleTransaction({network});
    await mkdir('private-evidence',{recursive:true});
    await writeFile('private-evidence/avalanche-live-sample.json',JSON.stringify(result,null,2)+'\n',{mode:0o600});
  } else if(command==='verify')result=await verifyTransaction({network,txHash:flags['--tx']});
  else throw fail('USAGE_SAMPLE_OR_VERIFY');
  console.log(JSON.stringify(result,null,2));
  if(!['RECEIPT_SUCCESS_OBSERVED','RECEIPT_FAILURE_OBSERVED'].includes(result.assessment))process.exitCode=2;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('Avalanche command failed: invalid arguments or local evidence write unavailable.');process.exitCode=2;});
