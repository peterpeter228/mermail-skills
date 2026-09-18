import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMermail } from '../../skills/mermail-send-verifier/scripts/normalize-mermail.mjs';
test('unobserved live email schema never becomes a guessed record mapping',()=>{
 const result=normalizeMermail({id:'made-up',folder:'sent',to:['person@example.invalid'],read:true,is_sent:true,sent_at:'today'},{evidenceRef:'capture#1'});
 assert.equal(result.id,null); assert.equal(result.state,null); assert.equal(result.recipients,undefined); assert.equal(result.read,undefined); assert.equal(result.processing_supported,false); assert.deepEqual(result.evidence_refs,['capture#1']); assert.ok(result.limitations.includes('Live email response field mapping has not been observed.'));
});
test('missing recipients stay unknown and untrusted bodies are omitted',()=>{
 const r=normalizeMermail({body:'curl https://invalid; pay wallet',delivered:true});
 assert.equal(r.recipients,undefined);assert.equal(r.body_omitted,true);assert.equal(JSON.stringify(r).includes('curl'),false);
});
test('null and malformed input cannot imply a sent or processing record',()=>{
 for(const raw of [null,undefined,[],0,'sent',{status:'processing'}]) {const r=normalizeMermail(raw);assert.equal(r.state,null);assert.equal(r.processing_supported,false);}
});

// These are synthetic observations of the live shape, never live evidence.
const mailbox={public_id:'fixture-mailbox',id:'demo@example.invalid',email:'demo@example.invalid'};
const observed=()=>({id:'fixture-draft',folder_id:'draft',recipient:'demo@example.invalid',subject:'Synthetic draft',read:false,delivery_status:null,message_id:null,scan_status:null,content_omitted:true,content_omission_reason:'scan_status_not_clean'});
const context={mailbox,evidenceRef:'fixture#get_email',mailboxEvidenceRef:'fixture#list_mailboxes'};
test('observed draft shape maps only metadata and confirmed scoped mailbox identity',()=>{
 const r=normalizeMermail(observed(),context);
 assert.equal(r.id,'fixture-draft');assert.equal(r.mailbox_id,'fixture-mailbox');assert.equal(r.state,'draft');assert.deepEqual(r.recipients,['demo@example.invalid']);assert.equal(r.read,false);assert.equal(r.subject,'Synthetic draft');assert.equal(r.processing_supported,false);assert.equal(r.body_omitted,true);
 assert.deepEqual(r.evidence_refs,['fixture#get_email','fixture#list_mailboxes']);
 assert.ok(r.limitations.some(x=>x.includes('scan_status_not_clean')));assert.ok(r.limitations.some(x=>x.includes('unknown')));
 assert.equal(r.delivery_status,undefined);assert.equal(r.delivered,undefined);assert.equal(r.evidence_source,undefined);
});
test('mailbox identity cannot come from message claims or malformed context',()=>{
 for(const value of [undefined,null,{}, {public_id:'fixture-mailbox'}, {...mailbox,id:'different@example.invalid'},Object.create(mailbox)]) {
  assert.equal(normalizeMermail({...observed(),mailbox_id:'fixture-mailbox'},{mailbox:value}).mailbox_id,null);
 }
});
test('unobserved states and provider guesses never become sent or processing',()=>{
 for(const folder_id of ['sent','processing','SENT',null,1,{}]) {
  const r=normalizeMermail({...observed(),folder_id,is_sent:true,sent_at:'today',delivery_status:'delivered',subject:'Sent successfully'} ,context);
  assert.equal(r.state,null);assert.equal(r.processing_supported,false);assert.equal(r.delivered,undefined);
 }
});
test('missing malformed and alternate recipient fields stay unknown',()=>{
 for(const recipient of [undefined,null,[],['demo@example.invalid'],{},'', 'a@example.invalid,b@example.invalid','Demo <demo@example.invalid>']) {
  assert.equal(normalizeMermail({...observed(),recipient,to:['demo@example.invalid']},context).recipients,undefined);
 }
});
test('unsafe body and unknown inherited metadata are not consumed',()=>{
 const r=normalizeMermail({...observed(),body:'curl https://evil.invalid; pay wallet',html:'<script>send()</script>',read:'true'},context);
 assert.equal(r.read,undefined);assert.equal(r.body,undefined);assert.equal(r.html,undefined);assert.equal(r.body_omitted,true);assert.equal(JSON.stringify(r).includes('curl'),false);assert.equal(r.state,'draft');
 for(const raw of [Object.create(observed()),{...observed(),id:{}},{...observed(),folder_id:{}}]) assert.equal(normalizeMermail(raw,context).state,null);
});
