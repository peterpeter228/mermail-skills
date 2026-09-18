const ORIGINS = new Set(['LIVE', 'RECORDED', 'FIXTURE', 'SYNTHETIC', 'NOT_RUN', 'BLOCKED']);
export const DEMO_WARNING = "PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY. THIS IS NOT THE USER'S PAYMENT.";
const SECRET_KEY = /authorization|cookie|password|secret|api.?key|access.?token|refresh.?token|private.?key|seed.?phrase|mnemonic/i;
const BODY_KEY = /^(body|html|text_body|html_body|body_text|body_html|raw|raw_message|content)$/i;
/** Publication boundary: never copy raw message content or credential fields. */
export function redact(value) {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'string') return value
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[REDACTED]')
    .replace(/\b(?:authorization|api[ _-]?key|private[ _-]?key|seed[ _-]?phrase|mnemonic|password|access[ _-]?token|refresh[ _-]?token)\s*[:=]\s*[^\n]+/gi, '[REDACTED]')
    .replace(/\bBearer\s+[^\s"'<>]+/gi, 'Bearer [REDACTED]')
    .replace(/\b(?:sk-|mm_key_)[A-Za-z0-9_-]{12,}/g, '[REDACTED]');
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [redact(key), SECRET_KEY.test(key) ? '[REDACTED]' : BODY_KEY.test(key) ? '[BODY OMITTED]' : redact(item)]));
  return value;
}
function project(record, kind) {
  if (!record || !ORIGINS.has(record.evidence_source)) throw new TypeError(`${kind}: invalid evidence origin`);
  const keys = ['case_id', 'claim_type', 'assessment', 'evidence_source', 'captured_at', 'observed_fields', 'limitations', 'evidence_refs', ...(kind === 'mail' ? ['mailbox_id', 'selected_email_id', 'expected_recipient', 'record_status'] : ['network', 'tx_hash'])];
  const projected = Object.fromEntries(keys.map(key => [key, record[key] ?? null]));
  if (kind === 'chain') projected.business_state = 'NOT_VERIFIED';
  return redact(projected);
}
export function buildReport({mail, chain, mode = 'offline', capturedAt = new Date().toISOString()}) {
  if (!['offline', 'live'].includes(mode)) throw new TypeError('Invalid report mode');
  const mailCard = project(mail, 'mail'); const chainCard = project(chain, 'chain');
  if (mode === 'offline' && [mailCard, chainCard].some(card => ['LIVE', 'RECORDED'].includes(card.evidence_source))) throw new TypeError('Offline report requires fixture, synthetic, or unavailable evidence');
  return {title:'Mermail Send Verifier', subtitle:'Evidence-based completion checks for AI agents', mode, captured_at:redact(capturedAt), mail:mailCard, chain:chainCard,
    business:{case_id:'business-relationship',claim_type:'Payment or invoice relationship',assessment:'NOT_VERIFIED',evidence_source:mode === 'offline' ? 'FIXTURE' : 'NOT_RUN',captured_at:null,observed_fields:null,limitations:['No invoice settlement, customer or wallet identity, token ownership, finality guarantee, bridging, signing, or transaction submission is implemented in v1.'],evidence_refs:[],warning:DEMO_WARNING}};
}
