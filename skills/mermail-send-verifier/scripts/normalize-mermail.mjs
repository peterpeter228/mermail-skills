/** No live email record has been observed. Do not infer mappings from fixture keys. */
export function normalizeMermail(_raw, { evidenceRef } = {}) {
  return {
    id: null,
    mailbox_id: null,
    state: null,
    recipients: undefined,
    read: undefined,
    body_omitted: true,
    processing_supported: false,
    evidence_refs: evidenceRef ? [evidenceRef] : [],
    limitations: [
      'Live email response field mapping has not been observed.',
      'Body content is omitted; scanner state and recipient state are unknown.',
    ],
  };
}
