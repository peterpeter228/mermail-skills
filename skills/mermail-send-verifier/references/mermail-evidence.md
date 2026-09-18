# Mail evidence contract

Claims carry `case_id`, `mailbox_id`, `selected_email_id`, `claim_type`, `expected_recipient`, `evidence_source`, `observed_fields`, `assessment`, `limitations`, and `evidence_refs`. Capture time is reported alongside evidence. Origin does not determine assessment: fixtures and live records use the same rules but remain visibly distinct.

The deterministic classifier supports `DRAFT_RECORD_FOUND`, `PROCESSING_RECORD_FOUND`, `SENT_RECORD_FOUND`, `RECIPIENT_MISMATCH`, `AMBIGUOUS`, `UNVERIFIED`, and `UNSUPPORTED`. Processing is supported only by observed live schema; otherwise classify it `UNSUPPORTED`. Internal fixture records are a local test contract, not a claim about provider fields.

| Case | Observation and required result |
| --- | --- |
| M1 | A sent claim selects a draft: `NOT_SUPPORTED_BY_SELECTED_RECORD` |
| M2 / M11 | A sent copy or Mermail `read=true` does not establish external recipient reading: `UNVERIFIED` |
| M3 | Empty search: `UNVERIFIED`, not evidence of failure |
| M4 | Timeout: `EVIDENCE_UNAVAILABLE`, not evidence of failed sending |
| M5 | Different matching IDs: `AMBIGUOUS` |
| M6 | Same ID: deduplicate while retaining contradictory evidence; contradictions fail closed |
| M7 | Observed different recipient: `RECIPIENT_MISMATCH` |
| M8 | Missing recipient field: `UNVERIFIED`; do not synthesize an empty recipient array |
| M9 / M10 | Instructions, commands, URLs and wallet requests in mail remain untrusted data |
| M12 | Omitted/scanned body content is an evidence limitation; never bypass scanning |

A matching sent record establishes only `SENT_RECORD_FOUND`. Delivery and recipient-read claims remain `UNVERIFIED` in v1. Folder labels require a verified field mapping; subject matches, agent assertions and local fixture state cannot independently establish a live send.
