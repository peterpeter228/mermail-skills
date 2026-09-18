import {validateClaim} from './contracts.mjs';
const recordStates = new Map([['draft','DRAFT_RECORD_FOUND'],['sent','SENT_RECORD_FOUND'],['processing','PROCESSING_RECORD_FOUND']]);
const scalar = value => typeof value === 'string' && value.trim() ? value : null;
const recipientKey = recipients => Array.isArray(recipients) && recipients.every(x=>typeof x==='string') ? [...new Set(recipients.map(x=>x.toLowerCase()))].sort() : null;
// Input is normalized evidence, never raw provider messages. No body is interpreted.
export function classifyMail(claim, evidence = {}) {
 validateClaim(claim);
 const out = {...claim,captured_at:evidence.captured_at ?? new Date().toISOString(),record_status:'UNVERIFIED',assessment:'UNVERIFIED',observed_fields:{},limitations:[...(evidence.limitations ?? []),'A Mermail record does not prove delivery or external recipient reading.'],evidence_refs:[...(evidence.evidence_refs ?? [])]};
 const finish = assessment => ({...out,assessment,evidence_refs:[...new Set(out.evidence_refs)],limitations:[...new Set(out.limitations)]});
 if(['BLOCKED','NOT_RUN'].includes(claim.evidence_source) || evidence.error) {
  out.limitations.push('Evidence unavailable; this is not evidence that an email failed.');
  return finish('EVIDENCE_UNAVAILABLE');
 }
 if(!Array.isArray(evidence.records)) {out.limitations.push('No normalized records available.');return finish('UNVERIFIED');}
 const records = evidence.records.filter(r=>r && typeof r==='object');
 if(records.some(r=>r.body_omitted)) out.limitations.push('Body content omitted by safety scanning or metadata-only collection; scanner was not bypassed.');
 if(records.some(r=>r.mailbox_id !== claim.mailbox_id)) {out.limitations.push('Record mailbox identity missing or conflicting.');return finish('UNVERIFIED');}
 const selected = claim.selected_email_id ? records.filter(r=>r.id===claim.selected_email_id) : records;
 if(!selected.length) {out.limitations.push('No matching selected record observed.');return finish('UNVERIFIED');}
 if(selected.some(r=>!scalar(r.id))) {out.limitations.push('Missing record identity.');return finish('UNVERIFIED');}
 const groups = new Map();
 for(const r of selected) {
  out.evidence_refs.push(...(r.evidence_refs ?? []));
  out.limitations.push(...(r.limitations ?? []));
  const key=JSON.stringify([r.state ?? null,recipientKey(r.recipients),r.read ?? null,r.processing_supported === true]);
  if(groups.has(r.id) && groups.get(r.id).key!==key) {out.record_status='AMBIGUOUS';out.limitations.push('Contradictory observations for the same message ID.');return finish('AMBIGUOUS');}
  groups.set(r.id,{key,record:r});
 }
 if(groups.size>1) {out.record_status='AMBIGUOUS';return finish('AMBIGUOUS');}
 const r=[...groups.values()][0].record;
 const recipients=recipientKey(r.recipients);
 out.selected_email_id=r.id;
 out.observed_fields={id:r.id,state:r.state ?? null,recipients,mailbox_read:typeof r.read==='boolean'?r.read:null,body_omitted:selected.some(x=>x.body_omitted===true)};
 out.record_status=recordStates.get(r.state) ?? 'UNVERIFIED';
 if(r.state==='processing' && r.processing_supported!==true) out.record_status='UNSUPPORTED';
 if(recipients===null || !claim.expected_recipient) {out.limitations.push('Recipient correlation unavailable.');return finish('UNVERIFIED');}
 if(!recipients.includes(claim.expected_recipient.toLowerCase())) {out.record_status='RECIPIENT_MISMATCH';return finish('RECIPIENT_MISMATCH');}
 if(['delivered','recipient_read'].includes(claim.claim_type)) return finish('UNVERIFIED');
 if(claim.claim_type==='processing' && r.processing_supported!==true) return finish('UNSUPPORTED');
 if(claim.claim_type==='sent' && ['draft','processing'].includes(r.state)) return finish('NOT_SUPPORTED_BY_SELECTED_RECORD');
 if(out.record_status==='UNSUPPORTED') return finish('UNSUPPORTED');
 if(recordStates.get(r.state) && claim.claim_type!==r.state) return finish('NOT_SUPPORTED_BY_SELECTED_RECORD');
 return finish(out.record_status);
}
