import test from 'node:test';
import assert from 'node:assert/strict';
import {runDemo} from '../../skills/mermail-send-verifier/scripts/run-demo.mjs';
test('offline runner needs no network or credentials and all sources are FIXTURE',async()=>{
 const report=await runDemo('offline',{write:false});
 assert.equal(report.mail.assessment,'NOT_SUPPORTED_BY_SELECTED_RECORD');
 assert.equal(report.chain.assessment,'RECEIPT_SUCCESS_OBSERVED');
 assert.equal(report.business.assessment,'NOT_VERIFIED');
 for(const card of [report.mail,report.chain,report.business])assert.equal(card.evidence_source,'FIXTURE');
});
test('unknown runner mode rejected',async()=>assert.rejects(runDemo('unknown',{write:false}),/mode/));
test('live runner preserves successful chain evidence when mail collection throws',async()=>{
 const fixtureChain=(await runDemo('offline',{write:false})).chain;
 const report=await runDemo('live',{write:false,collectMail:async()=>{throw new Error('not for publication');},collectSample:async()=>({...fixtureChain,tx_hash:null})});
 assert.equal(report.mail.evidence_source,'BLOCKED');
 assert.equal(report.mail.assessment,'EVIDENCE_UNAVAILABLE');
 assert.equal(report.chain.evidence_source,'FIXTURE');
 assert.ok(!JSON.stringify(report).includes('not for publication'));
});
test('live runner preserves mail observation when chain transport throws',async()=>{
 const report=await runDemo('live',{write:false,collectMail:async()=>({claim:{case_id:'empty',mailbox_id:'unselected',selected_email_id:null,claim_type:'sent',expected_recipient:null,evidence_source:'LIVE'},evidence:{records:[]},connection:{list_mailboxes:true}}),collectSample:async()=>{throw new Error('transport');}});
 assert.equal(report.mail.evidence_source,'LIVE');
 assert.equal(report.mail.assessment,'UNVERIFIED');
 assert.equal(report.chain.evidence_source,'BLOCKED');
 assert.equal(report.chain.assessment,'RPC_UNAVAILABLE');
});
test('live runner passes pinned target identity to fresh read collector, never a saved response',async()=>{
 const selection={mailbox_id:'fixture-mailbox',selected_email_id:'fixture-message',expected_recipient:'self@example.invalid'};
 let supplied;
 const fixtureChain=(await runDemo('offline',{write:false})).chain;
 await runDemo('live',{write:false,mailSelection:selection,collectMail:async input=>{supplied=input;return {claim:{case_id:'read',...selection,claim_type:'sent',evidence_source:'BLOCKED'},evidence:{records:[],error:'blocked'},connection:{selected_record:'BLOCKED'}};},collectSample:async()=>({...fixtureChain,tx_hash:null})});
 assert.deepEqual(supplied,{selection});
});
