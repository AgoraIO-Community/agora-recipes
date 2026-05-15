# Telehealth Voice Intake

A pre-visit voice agent for telehealth that runs the intake interview,
generates a SOAP note, and posts it to the EHR.

## Compliance

- All audio is processed inside the customer's VPC.
- BAA available; PHI never leaves your AWS account.
- Audit log of every model prompt and tool invocation.

## Conversation outline

1. Identity verification.
2. Chief complaint.
3. History of present illness (HPI).
4. Allergies, medications, relevant history.
5. Confirmation and clinician hand-off.

The agent yields the channel to the clinician and stays on as a silent
scribe for the rest of the visit.
