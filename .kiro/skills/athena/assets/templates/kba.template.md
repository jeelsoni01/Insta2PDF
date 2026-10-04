# <SYMPTOM_SHAPED_TITLE>

<!--
  Section order is fixed by references/kba-spec.md.
  Required: Summary, Environment, Symptom, Root Cause, Resolution, Verification.
  Optional: Diagnostic Steps, Workaround, Related Articles — delete the whole
  section if it has no content.
  Title is symptom-shaped, not cause-shaped: write it the way someone who does
  not yet know the cause would search for it.
  Delete every HTML comment in this template before delivering the document.
-->

## Summary

<One sentence: what breaks and for whom. One sentence: why, and what fixes it.
Introduces no fact that does not appear in a section below.>

## Environment

| Component | Version | Notes |
|---|---|---|
| <PRODUCT> | <VERSION> | <NOTE> |
| <OPERATING_SYSTEM> | <VERSION> | <NOTE> |

## Symptom

<What is observed — by the user, in the UI, or in monitoring. Not what is wrong.>

```text
<EXACT_ERROR_STRING>
```

Appears in: <UI_SCREEN_OR_LOG_FILE_PATH>

## Diagnostic Steps

<!-- Optional section — delete if the cause was immediately obvious. -->

| # | Check | Result | Ruled out / in |
|---|---|---|---|
| 1 | `<COMMAND_OR_CHECK>` | <WHAT_CAME_BACK> | <WHAT_IT_ELIMINATED> |

## Root Cause

<One mechanism, past tense, plainly stated. Contributing factors after, if any.>

## Workaround

<!-- Optional section — delete if there is no workaround, or if it is the same
     as the resolution. State its limits and how long it holds. -->

<TEMPORARY_MITIGATION>

## Resolution

1. <Imperative step. Note if it needs elevated privileges, a restart, or causes
   an outage.>

   ```bash
   <COMMAND>
   ```

2. <Imperative step.>

## Verification

| # | Check | Expected | Proves |
|---|---|---|---|
| 1 | <USER_FACING_CHECK> | <EXPECTED> | The reported symptom is gone |
| 2 | <SERVER_SIDE_CHECK> | <EXPECTED> | <WHAT_IT_PROVES> |

## Related Articles

<!-- Optional section — real references only. Never invent a ticket ID or a
     vendor KB number. Delete the section if none were supplied. -->

- <TICKET_ID_OR_LINK>
