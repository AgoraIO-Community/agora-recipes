# AI Customer Support Line

Replace your IVR with a natural-sounding agent that answers from your docs
and hands off to humans without a transfer.

## Capabilities

- Caller authentication via voice + one-time code.
- RAG over your knowledge base, refreshed every hour.
- **Warm handoff**: the human joins the same Agora channel and sees the full
  transcript before saying hello.
- Sentiment-aware escalation.

## Knowledge base

Point the agent at an HTTPS source, and it indexes nightly:

```yaml
sources:
  - https://docs.example.com/sitemap.xml
  - https://help.example.com/api.json
```
