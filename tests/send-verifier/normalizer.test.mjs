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
