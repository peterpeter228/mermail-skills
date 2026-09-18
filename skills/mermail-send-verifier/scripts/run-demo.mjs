import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {classifyMail} from './classify-mail.mjs';
import {buildReport,redact} from './build-report.mjs';
import {renderReport} from './render-report.mjs';
import {verifyTransaction,sampleTransaction} from '../../../demo/avalanche/avalanche.mjs';
import {FIXTURE_TX_HASH,fixtureFetch} from '../../../demo/avalanche/fixture.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const save=async(name,data,privateFile=false)=>{const file=path.join(root,name);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,typeof data==='string'?data:JSON.stringify(redact(data),null,2)+'\n',{mode:privateFile?0o600:0o644});};
export async function runDemo(mode,{write=true,collectMail,collectSample=sampleTransaction,verifyChain=verifyTransaction,mailSelection}={}) {
 if(!['offline','live'].includes(mode))throw new TypeError('Invalid demo mode');
 let mail,chain;
 if(mode==='offline') {
  mail=classifyMail({case_id:'M1-demo',mailbox_id:'fixture-demo-mailbox',selected_email_id:'fixture-draft-1',claim_type:'sent',expected_recipient:'guest@example.invalid',evidence_source:'FIXTURE'},{records:[{id:'fixture-draft-1',mailbox_id:'fixture-demo-mailbox',state:'draft',recipients:['guest@example.invalid'],body_omitted:true,evidence_refs:['fixture:M1:selected-draft']}],limitations:['Local fixture demonstrates the rule; no Mermail connection or message is represented.']});
  chain=await verifyTransaction({network:'mainnet',txHash:FIXTURE_TX_HASH,evidenceSource:'FIXTURE',fetchImpl:fixtureFetch});
 } else {
  collectMail ??= (await import('./live-mermail.mjs')).probeMermail;
  // Only target identity is persisted. The collector must fetch a fresh record.
  if(mailSelection === undefined) {
   try {mailSelection=JSON.parse(await readFile(path.join(root,'private-evidence/mermail-demo-target.json'),'utf8'));}
   catch(error) {if(error.code==='ENOENT')mailSelection=null;else throw new Error('Invalid local demo selection');}
  }
  const [mailResult,chainResult]=await Promise.allSettled([Promise.resolve().then(()=>collectMail({selection:mailSelection})),Promise.resolve().then(()=>collectSample({network:'mainnet'}))]);
  const captured_at=new Date().toISOString();
  const probe=mailResult.status==='fulfilled'?mailResult.value:{claim:{case_id:'mail-live-unavailable',mailbox_id:'unselected',selected_email_id:null,claim_type:'sent',expected_recipient:null,evidence_source:'BLOCKED'},evidence:{records:[],error:'TRANSPORT_UNAVAILABLE',captured_at,limitations:['Mail evidence collection unavailable.'],evidence_refs:[]},connection:{source:'BLOCKED',initialize:false,catalog:false,list_mailboxes:false,selected_record:false,reason_code:'TRANSPORT_UNAVAILABLE',captured_at}};
  const sample=chainResult.status==='fulfilled'?chainResult.value:{case_id:'chain-live-unavailable',claim_type:'transaction_execution',network:'mainnet',tx_hash:null,evidence_source:'BLOCKED',assessment:'RPC_UNAVAILABLE',captured_at,observed_fields:{},limitations:['RPC collection unavailable.'],evidence_refs:[],business_state:'NOT_VERIFIED'};
  mail=classifyMail(probe.claim,probe.evidence);
  if(write) {await save('artifacts/verification/mermail-live.json',probe.connection);await save('private-evidence/avalanche-live-sample.json',sample,true);}
  chain=sample;
  if(sample.tx_hash && ['RECEIPT_SUCCESS_OBSERVED','RECEIPT_FAILURE_OBSERVED'].includes(sample.assessment)) {
   chain=await verifyChain({network:'mainnet',txHash:sample.tx_hash});
   chain.limitations.push('Public sample independently reread after bounded discovery.');
  }
  if(chain.assessment==='RPC_UNAVAILABLE')chain.evidence_source='BLOCKED';
  if(write)await save('artifacts/verification/avalanche-live.json',chain);
 }
 const report=buildReport({mail,chain,mode});
 if(write){await save('artifacts/demo/report.json',report);await save('artifacts/demo/report.html',renderReport(report));}
 return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 runDemo(process.argv[2]).then(report=>console.log(JSON.stringify({mode:report.mode,mail:{source:report.mail.evidence_source,assessment:report.mail.assessment},avalanche:{source:report.chain.evidence_source,assessment:report.chain.assessment},business:report.business.assessment,report:'artifacts/demo/report.html'}))).catch(()=>{console.error('Demo could not complete; inspect local configuration and verification evidence.');process.exitCode=1;});
}
