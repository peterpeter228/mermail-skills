// Map only metadata observed in get_email. The caller supplies a list_mailboxes
// item after a successful get_email scoped to that item's public_id. The response
// itself has no mailbox identity field. Origin belongs to the caller's evidence.
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => object(value) && Object.hasOwn(value, key) ? value[key] : undefined;
const text = value => typeof value === 'string' && value.length <= 1000 && value.trim() && !/[\u0000-\u001f\u007f]/.test(value) ? value : undefined;
const address = value => text(value) && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(value) ? value : undefined;

export function normalizeMermail(raw, { mailbox, evidenceRef, mailboxEvidenceRef } = {}) {
  const result = {
    id: null,
    mailbox_id: null,
    state: null,
    recipients: undefined,
    read: undefined,
    body_omitted: true,
    processing_supported: false,
    evidence_refs: [...new Set([evidenceRef, mailboxEvidenceRef].filter(value => text(value)))],
    limitations: [],
  };
  const id = text(own(raw, 'id'));
  const folder = text(own(raw, 'folder_id'));
  if (!id || !folder) {
    result.limitations.push('Live email response field mapping has not been observed.');
  } else {
    result.id = id;
    result.state = folder === 'draft' ? 'draft' : null;
    const recipient = address(own(raw, 'recipient'));
    result.recipients = recipient ? [recipient] : undefined;
    const read = own(raw, 'read');
    result.read = typeof read === 'boolean' ? read : undefined;
    const subject = text(own(raw, 'subject'));
    if (subject) result.subject = subject;
    const publicId = text(own(mailbox, 'public_id'));
    const mailboxEmail = address(own(mailbox, 'email'));
    if (publicId && mailboxEmail && own(mailbox, 'id') === mailboxEmail) {
      result.mailbox_id = publicId;
      result.limitations.push('Mailbox identity comes from confirmed list_mailboxes identity and the successful scoped get_email request, not a mailbox field in the email response.');
    } else result.limitations.push('Confirmed scoped mailbox identity is unavailable.');
    if (result.state === null) result.limitations.push('This folder state has no observed live mapping; sent and processing are unsupported.');
  }
  if (own(raw, 'content_omitted') === true && own(raw, 'content_omission_reason') === 'scan_status_not_clean') {
    result.limitations.push('Mermail omitted body content: scan_status_not_clean; scanner was not bypassed.');
  }
  result.limitations.push('Body content is omitted; scanner state and recipient state are unknown.');
  result.limitations.push('Mailbox read state is not external recipient read evidence; delivery is not verified.');
  return result;
}
