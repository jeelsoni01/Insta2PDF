# KBA spec

Authoritative rules for the `kba` (Knowledge Base Article) document type.
Template: `assets/templates/kba.template.md`.

A KBA answers one question for a future engineer: *"I am seeing this — what is
it and how do I fix it?"* Everything that does not serve that question is cut.

## Input fields

| Field | Required | Default if omitted |
|---|---|---|
| `title` | ✅ | — ask |
| `symptom` | ✅ | — ask |
| `environment` (product + version + OS) | ✅ | — ask |
| `root_cause` | ✅ | — ask |
| `resolution` | ✅ | — ask |
| `verification` | ✅ | — ask |
| `diagnostic_steps` | ⬜ | Omit the section |
| `related_articles` / ticket refs | ⬜ | Omit the section |
| `workaround` | ⬜ | Omit the section |

Ask for all missing **required** fields in one batch — one numbered list, one
turn. A user who has just finished troubleshooting will not sit through six
questions asked one at a time.

## Section order

| # | Heading | Required | Contains |
|---|---|---|---|
| 1 | `# <Title>` | ✅ | H1. Symptom-shaped, not cause-shaped (see below) |
| 2 | `## Summary` | ✅ | One or two sentences: symptom → cause → fix |
| 3 | `## Environment` | ✅ | Table of product, version, OS, and anything version-sensitive |
| 4 | `## Symptom` | ✅ | What the user or monitoring actually observes, verbatim where possible |
| 5 | `## Diagnostic Steps` | ⬜ | How the cause was isolated, in order |
| 6 | `## Root Cause` | ✅ | The single mechanism that produced the symptom |
| 7 | `## Workaround` | ⬜ | Temporary mitigation, if one exists |
| 8 | `## Resolution` | ✅ | Numbered steps that fix it permanently |
| 9 | `## Verification` | ✅ | How to confirm the fix held |
| 10 | `## Related Articles` | ⬜ | Ticket refs, vendor KBs, linked internal articles |

`## Summary` is synthesised from the supplied symptom, root cause, and
resolution. It introduces no new information — if you find yourself adding a
fact there that is not in another section, that fact is an invention. Remove it.

## Per-section guidance

**Title.** Write it the way someone will search for it: the symptom, plus the
narrowing detail. "OTDS login fails for a single user while others succeed"
beats "Stale bind DN in directory synchronisation". Cause-shaped titles are
only findable by people who already know the cause — which is nobody who needs
the article.

**Summary.** Two sentences maximum. First: what breaks and for whom. Second:
why, and what fixes it. This is what shows in search results, so it carries the
whole article for readers who never scroll.

**Environment.** A table, always — even for a single row, because the next
engineer will add a row. Columns: Component, Version, Notes. Include every
component whose version could change the answer. Vague entries ("latest",
"current", "prod") are worthless in an article read eighteen months from now;
ask for the specific version rather than writing one down.

**Symptom.** What is observed, not what is wrong. Include the exact error
string in a fenced block if there is one — verbatim error text is the single
highest-value thing in a KBA, because it is what people paste into search.
Include where it appears (UI, which log file, which monitor).

**Diagnostic Steps.** The path from symptom to cause, in the order it was
walked, with the command or check at each step and what it ruled in or out.
This section is what separates a KBA from a ticket comment: it teaches the next
person how to confirm they have *this* problem and not a lookalike. Omit it
only when the cause was immediately obvious.

**Root Cause.** One mechanism, stated plainly, in past tense. If there were
contributing factors, name the mechanism first and the factors after. Do not
list three candidate causes — if it was not narrowed to one, say so explicitly
rather than implying certainty.

**Workaround.** Only if one exists and it differs from the resolution. State
its limits and how long it holds.

**Resolution.** Numbered, imperative, copy-pasteable. Note which steps require
elevated privileges, which require a restart, and which cause an outage. If the
fix is a configuration change, show the before and after values, not the whole
file.

**Verification.** Command, expected result, and what it proves — the same
three-part shape as a deploy guide. Include how to confirm the symptom is gone
from the *user's* perspective, not only from the server's.

**Related Articles.** Ticket IDs and links only. Never invent a ticket ID or a
vendor KB number; if the user did not supply one, omit the section.

## Worked example

**Input**

```yaml
doc_type: kba
title: LDAP login failure for a single user
environment: Directory service 24.4, application server 25.4, AlmaLinux 9
symptom: One user cannot authenticate; all other users succeed
root_cause: Service account password expired, but only the affected user's group used the secondary bind
resolution: Reset the service account password and update the stored bind credential
verification: Affected user logs in; bind test succeeds
```

**Output excerpt**

````markdown
# LDAP login failure for a single user while others succeed

## Summary

One user is refused authentication while every other user signs in normally.
The secondary bind account used by that user's group had an expired password;
resetting it and updating the stored credential restores access.

## Environment

| Component | Version | Notes |
|---|---|---|
| Directory service | 24.4 | Secondary bind configured for one group |
| Application server | 25.4 | — |
| Operating system | AlmaLinux 9 | — |

## Symptom

A single user is rejected at sign-in. All other users authenticate normally, so
the directory is reachable and the integration is not globally broken.

```text
Authentication failed for user <USERNAME>: invalid credentials
```
<!-- verify: error string not supplied — replace with the exact text from the log -->

## Root Cause

The service account used for the secondary bind had an expired password. Only
the affected user's group resolved through that bind, so the failure presented
as a single-user problem rather than an outage.

## Resolution

1. Reset the service account password in the directory.
2. Update the stored bind credential in the application configuration.
3. Restart the directory integration service.
   <!-- verify: restart not supplied in the resolution — confirm the integration
        requires one before including this step -->

## Verification

| # | Check | Expected | Proves |
|---|---|---|---|
| 1 | Affected user signs in through the UI | Login succeeds | The user-facing symptom is gone |
| 2 | Bind test against the directory | Bind succeeds | The stored credential is valid |
````
