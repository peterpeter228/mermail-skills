# OAuth and empty mailbox result

Observed live: Codex reported Successfully logged in; the native Mermail connection reported connected/oAuth, discovered 85 tools, and list_mailboxes succeeded with structuredContent.items = []. This proves the authenticated read completed; it does not prove that any email record exists or is accessible.

Exa search and page retrieval on 2026-09-18 used official sources:
- https://docs.mermail.app/ai/skills — Codex supports MCP OAuth at https://console.mermail.app/mcp without an API key; skills and authenticated MCP tools are separate.
- https://docs.mermail.app/ — Creating an agent mailbox and connecting the AI are separate setup steps.

Inference limit: the empty list alone cannot establish whether no mailbox has been provisioned or whether workspace/visibility scope excludes existing mailboxes. It is not a 401/403 and is not an OAuth failure. No workspace switch or mailbox creation was performed.

For a browser on Windows and Codex on remote Ubuntu, a 127.0.0.1 callback targets the browser computer. The user supplied the completed callback and it was forwarded to the original Ubuntu loopback listener without persisting its authorization code; the listener returned HTTP 200 and Codex confirmed login.
