export const EVIDENCE_SOURCES = Object.freeze(['LIVE','RECORDED','FIXTURE','SYNTHETIC','NOT_RUN','BLOCKED']);
export const MAIL_STATES = Object.freeze(['DRAFT_RECORD_FOUND','PROCESSING_RECORD_FOUND','SENT_RECORD_FOUND','RECIPIENT_MISMATCH','AMBIGUOUS','UNVERIFIED','UNSUPPORTED']);
export const CLAIM_TYPES = Object.freeze(['sent','draft','processing','delivered','recipient_read']);
export function validateClaim(claim) {
 if (!claim || typeof claim !== 'object' || Array.isArray(claim)) throw new TypeError('Claim must be an object');
 for (const key of ['case_id','mailbox_id']) if(typeof claim[key] !== 'string' || !claim[key].trim()) throw new TypeError(`Missing ${key}`);
 for (const key of ['selected_email_id','expected_recipient']) if(claim[key] !== null && (typeof claim[key] !== 'string' || !claim[key].trim())) throw new TypeError(`Invalid ${key}`);
 if(!CLAIM_TYPES.includes(claim.claim_type)) throw new TypeError('Unsupported claim_type');
 if(!EVIDENCE_SOURCES.includes(claim.evidence_source)) throw new TypeError('Invalid evidence_source');
 return claim;
}
export function replayEvidence(evidence) {
 if(!EVIDENCE_SOURCES.includes(evidence.evidence_source)) throw new TypeError('Invalid evidence_source');
 return {...evidence,evidence_source:evidence.evidence_source==='LIVE'?'RECORDED':evidence.evidence_source};
}
