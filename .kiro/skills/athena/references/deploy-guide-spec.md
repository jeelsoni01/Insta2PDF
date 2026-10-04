# Deploy guide spec

Authoritative rules for the `deploy-guide` document type. Template:
`assets/templates/deploy-guide.template.md`.

## Input fields

| Field | Required | Default if omitted |
|---|---|---|
| `service_name` | ✅ | — ask |
| `target_platform` (OS/version, container, cluster) | ✅ | — ask |
| `prerequisites` | ✅ | — ask |
| `install_steps` | ✅ | — ask |
| `verification_steps` | ✅ | — ask. A deploy guide without verification is not a deploy guide |
| `rollback_steps` | ⬜ | Emit `## Rollback` with a `TODO:` marker. **Never silently omit this section** |
| `configuration` | ⬜ | Omit the section |
| `ports_and_firewall` | ⬜ | Omit the section |
| `troubleshooting` | ⬜ | Omit the section |

Ask for all missing **required** fields in one batch. Never ask for optional ones.

## Section order

| # | Heading | Required | Contains |
|---|---|---|---|
| 1 | `# Deploy <Service Name>` | ✅ | H1 naming the service |
| 2 | `## Overview` | ✅ | What is being deployed, onto what, and the expected end state |
| 3 | `## Prerequisites` | ✅ | Everything true *before* step one |
| 4 | `## Ports and Firewall` | ⬜ | Table: port, protocol, direction, purpose |
| 5 | `## Installation` | ✅ | Numbered, copy-pasteable steps |
| 6 | `## Configuration` | ⬜ | Files touched, keys set, values to change |
| 7 | `## Verification` | ✅ | How to prove it worked, with expected output |
| 8 | `## Rollback` | ✅ | How to get back to the prior state |
| 9 | `## Troubleshooting` | ⬜ | Table: symptom → cause → fix |

## Per-section guidance

**Overview.** Three sentences maximum: what, where, and what "done" looks like.
State the deployment model explicitly (single node, HA pair, container,
Kubernetes) because every later step depends on it. Include a Mermaid diagram
only when the topology has more than two moving parts.

**Prerequisites.** Split into three groups when all three exist: access
(accounts, sudo, keys), infrastructure (host specs, storage, network), and
software (packages, runtimes, dependent services). Each entry is a checkable
statement — "sudo on the target host", not "appropriate permissions". A reader
should be able to tick every line before starting.

**Ports and Firewall.** Table with columns: Port, Protocol, Direction, Source →
Destination, Purpose. Include the firewall command for the target platform
(`firewall-cmd`, `ufw`, security group) as a fenced block underneath.

**Installation.** Numbered steps. One logical action per step. Each step states
what it does before the command, not after. Long-running commands get an
expected duration. Steps that must run as root say so. Never bury a
destructive command mid-block without a preceding warning line.

**Configuration.** Show the file path, then the changed keys — a diff-style or
before/after block, not the whole file. Call out every value that is
environment-specific with a `<ANGLE_BRACKET_CAPS>` placeholder.

**Verification.** The most important section. Every check has three parts: the
command, the expected output, and what it proves. Cover at least: the process
is running, the service answers on its port, and one end-to-end functional
check. "It should work now" is not verification.

**Rollback.** Always present. Ordered steps that reverse the installation,
including data considerations (does rolling back lose writes?) and the point of
no return, if there is one. If the user did not supply rollback steps, emit the
heading with `TODO: rollback procedure not supplied — do not deploy to
production without one.`

**Troubleshooting.** Only failure modes actually reported or actually observed.
No speculative entries.

## Worked example

**Input**

```yaml
doc_type: deploy-guide
service_name: Postgres 16 (containerised)
target_platform: AlmaLinux 9, Podman, systemd unit
prerequisites: root on target host; Podman 4.x installed; /var/lib/pgdata on separate volume
install_steps: pull image, create volume, create systemd unit, enable and start
verification_steps: unit active; psql SELECT 1 over localhost:5432
rollback_steps: disable and remove the unit, remove container and image, leave the data volume in place
```

**Output excerpt**

````markdown
# Deploy Postgres 16 (containerised)

## Overview

Deploys PostgreSQL 16 as a rootful Podman container on AlmaLinux 9, supervised
by a systemd unit so it survives reboot. Data lives on a dedicated volume at
`/var/lib/pgdata`. Done means: the unit is `active`, and `SELECT 1` succeeds on
`localhost:5432`.

## Prerequisites

| Group | Requirement |
|---|---|
| Access | `root` on the target host |
| Infrastructure | Separate volume mounted at `/var/lib/pgdata` |
| Software | AlmaLinux 9; Podman 4.x |

## Installation

1. Pull the image.

   ```bash
   podman pull docker.io/library/postgres:16
   ```

2. Create the data directory with the right ownership.

   ```bash
   install -d -o 26 -g 26 -m 0700 /var/lib/pgdata
   ```
   <!-- verify: uid/gid 26 is the postgres user in the official image; confirm for your image tag -->

## Verification

| # | Command | Expected | Proves |
|---|---|---|---|
| 1 | `systemctl is-active <UNIT_NAME>` | `active` | The unit is up |
| 2 | `ss -lntp \| grep 5432` | A listener on 5432 | The port is bound |
| 3 | `psql -h localhost -U postgres -c 'SELECT 1'` | `?column?` / `1` | End-to-end query path works |

## Rollback

1. Stop and disable the unit.

   ```bash
   systemctl disable --now <UNIT_NAME>
   ```

2. Remove the container and image.

   ```bash
   podman rm -f <CONTAINER_NAME> && podman rmi docker.io/library/postgres:16
   ```

3. **Point of no return:** `/var/lib/pgdata` is left in place deliberately.
   Deleting it destroys the database. Take a dump before you remove it.
````
