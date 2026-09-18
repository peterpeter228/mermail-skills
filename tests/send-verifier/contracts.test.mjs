import test from 'node:test';
import assert from 'node:assert/strict';
import {replayEvidence,validateClaim} from '../../skills/mermail-send-verifier/scripts/contracts.mjs';
test('replayed LIVE observation becomes RECORDED',()=>assert.equal(replayEvidence({evidence_source:'LIVE'}).evidence_source,'RECORDED'));
test('replay never promotes fixture or blocked origins',()=>{for(const origin of ['FIXTURE','SYNTHETIC','BLOCKED','NOT_RUN','RECORDED'])assert.equal(replayEvidence({evidence_source:origin}).evidence_source,origin);});
test('strict claim requires explicit nullable identities',()=>assert.throws(()=>validateClaim({case_id:'x',mailbox_id:'y',claim_type:'sent',evidence_source:'LIVE'}),/selected_email_id/));
