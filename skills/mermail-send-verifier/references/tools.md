# Read tools and ownership

Use current live argument schemas and exact host-exposed identifiers, including qualification such as `Mermail:list_emails`. Pass native JSON objects; never stringify `query`. These compose existing owners, without additional ownership:

| Tools | Existing owner | Evidence purpose |
| --- | --- | --- |
| `list_mailboxes` | `mermail-administer-workspace` | Identify an authorized test mailbox |
| `list_folders`, `list_emails`, `search_emails` | `mermail-manage-inbox` | Bounded discovery of candidate records |
| `get_email`, `get_email_context`, `get_thread` | `mermail-manage-inbox` | Inspect the selected record or scoped context |

Prefer returned mailbox `public_id` for `mailboxId` when the live schema supports it. Resolve folder IDs through observed results. Read the owning skill's tool reference for scanner and schema details. Do not substitute an invented schema, create a mailbox to solve discovery, or invoke read-state mutations.

Discovery/profile restrictions, credits, rate limits and OAuth scope can block evidence. Surface those limits without changing the claim into failure. Stop at the read budget; no all-history scans, mailbox-agent delegation, send-like retries, wallet or PayBox calls.
