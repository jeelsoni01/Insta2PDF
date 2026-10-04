# Deploy <SERVICE_NAME>

<!--
  Section order is fixed by references/deploy-guide-spec.md.
  Required: Overview, Prerequisites, Installation, Verification, Rollback.
  Optional: Ports and Firewall, Configuration, Troubleshooting — delete the
  whole section if it has no content.
  Rollback is REQUIRED. If no procedure was supplied, keep the heading and
  leave the TODO line in place. Never delete this section.
  Delete every HTML comment in this template before delivering the document.
-->

## Overview

<What is being deployed, onto what platform, in what topology. Then what "done"
looks like — the observable end state.>

## Prerequisites

| Group | Requirement |
|---|---|
| Access | <ACCOUNTS_SUDO_KEYS> |
| Infrastructure | <HOST_STORAGE_NETWORK> |
| Software | <PACKAGES_RUNTIMES_DEPENDENT_SERVICES> |

## Ports and Firewall

<!-- Optional section — delete if the deployment opens no ports. -->

| Port | Protocol | Direction | Source → Destination | Purpose |
|---|---|---|---|---|
| <PORT> | <TCP_UDP> | <INBOUND_OUTBOUND> | <SRC> → <DST> | <WHY> |

```bash
<FIREWALL_COMMAND>
```

## Installation

1. <What this step does. Note if it needs root, and how long it takes.>

   ```bash
   <COMMAND>
   ```

2. <What this step does.>

   ```bash
   <COMMAND>
   ```

## Configuration

<!-- Optional section — delete if nothing is configured post-install. -->

File: `<CONFIG_FILE_PATH>`

```diff
- <OLD_VALUE>
+ <NEW_VALUE>
```

## Verification

| # | Command | Expected | Proves |
|---|---|---|---|
| 1 | `<COMMAND>` | `<EXPECTED_OUTPUT>` | <WHAT_IT_PROVES> |
| 2 | `<COMMAND>` | `<EXPECTED_OUTPUT>` | <WHAT_IT_PROVES> |
| 3 | `<END_TO_END_CHECK>` | `<EXPECTED_OUTPUT>` | <WHAT_IT_PROVES> |

## Rollback

<!-- REQUIRED. If no rollback was supplied, keep the marker line below. -->

TODO: rollback procedure not supplied — do not deploy to production without one.

1. <Step that reverses the installation.>

   ```bash
   <COMMAND>
   ```

2. **Point of no return:** <the step after which data is unrecoverable, and how
   to take a backup before reaching it. Delete this line if there is no such step.>

## Troubleshooting

<!-- Optional section — only failure modes actually observed. Delete if none. -->

| Symptom | Cause | Fix |
|---|---|---|
| <WHAT_YOU_SEE> | <WHY> | <WHAT_TO_DO> |
