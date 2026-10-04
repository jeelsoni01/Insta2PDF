# README spec

Authoritative rules for the `readme` document type. Template:
`assets/templates/readme.template.md`.

## Input fields

| Field | Required | Default if omitted |
|---|---|---|
| `project_name` | ✅ | — ask |
| `purpose` (1–2 sentences) | ✅ | — ask |
| `language_or_stack` | ✅ | — ask |
| `install_steps` | ⬜ | Infer from the stack, flag every inferred line with `<!-- verify -->` |
| `usage_example` | ⬜ | Generate a plausible one, flag it with `<!-- verify -->` |
| `requirements` | ⬜ | Infer from the stack, flag with `<!-- verify -->` |
| `configuration` | ⬜ | Omit the section |
| `troubleshooting` | ⬜ | Omit the section |
| `contributing` | ⬜ | Omit the section |
| `license` | ⬜ | MIT |

Ask for all missing **required** fields in one batch. Never ask for optional ones.

## Section order

Emit in exactly this order. Required sections always appear; optional sections
are omitted entirely when empty — never emit a bare heading.

| # | Heading | Required | Contains |
|---|---|---|---|
| 1 | `# <Project Name>` | ✅ | H1, the project name verbatim |
| 2 | `## Overview` | ✅ | What it is, what problem it solves, who it is for |
| 3 | `## Requirements` | ✅ | Runtime, versions, OS, external services |
| 4 | `## Installation` | ✅ | Copy-pasteable commands |
| 5 | `## Usage` | ✅ | At least one worked invocation with expected output |
| 6 | `## Configuration` | ⬜ | Table of options: name, type, default, description |
| 7 | `## Troubleshooting` | ⬜ | Table of symptom → cause → fix |
| 8 | `## Contributing` | ⬜ | How to run tests, coding conventions, PR expectations |
| 9 | `## License` | ✅ | Licence name and a pointer to the `LICENSE` file |

## Per-section guidance

**Overview.** Two to four sentences. Lead with what the thing *is* in one
sentence, then the problem it solves. No marketing adjectives ("powerful",
"seamless", "blazing fast"). If the project has a hard scope boundary, state it
here as a "Not for" line — it saves more support time than any other sentence
in the document.

**Requirements.** A table when there is more than one requirement, a list when
there is one. Pin versions the way the project actually pins them: `Python
3.11+` if a floor, `Node 20.x` if a series, `PostgreSQL 16` if exact. If you
inferred a version from the stack rather than being told it, mark it.

**Installation.** Numbered steps, one command per fenced block, in the order a
new user runs them. Cover the common path first; put container, package
manager, and from-source alternatives in sub-headings under it, not
interleaved. Every command gets a language hint on the fence.

**Usage.** At minimum one invocation and what it prints. If the project is a
library, show an import and a call. If it is a CLI, show the command and a
trimmed sample of real output. A usage section with no example is not a usage
section.

**Configuration.** A table with columns: Option, Type, Default, Description.
Environment variables in `UPPER_SNAKE`, config-file keys in the file's own
casing. Note which options are required at startup.

**Troubleshooting.** Three columns: Symptom, Cause, Fix. Only include entries
the user actually reported hitting — do not speculate about failure modes.

**License.** One line. Name the licence and point at the file.

## Worked example

**Input**

```yaml
doc_type: readme
project_name: zpool-watch
purpose: Alerts when a ZFS pool degrades, before the second disk goes.
language_or_stack: Python 3.11 CLI, no external services
```

**Output excerpt**

````markdown
# zpool-watch

## Overview

`zpool-watch` polls `zpool status` on a schedule and raises an alert the moment
a pool leaves the `ONLINE` state. It exists because ZFS will happily run
degraded for weeks in silence, and the second disk failure is the one that costs
you the array.

Not for: pool repair or resilver management. It reports; it does not act.

## Requirements

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | Standard library only <!-- verify: inferred from "no external services" --> |
| ZFS utilities | Any providing `zpool` | Must be on `PATH` |
| Privileges | Read access to `zpool status` | Usually root <!-- verify: inferred --> |

## Installation

```bash
git clone <REPOSITORY_URL> zpool-watch
cd zpool-watch
python3 -m pip install .
```
<!-- verify: install steps inferred from a standard Python CLI layout -->

## Usage

```bash
zpool-watch --pool tank --interval 300
```
<!-- verify: no flags were supplied — `--pool` and `--interval` are inferred -->

```text
2026-08-16 09:14:02  tank  ONLINE   ok
2026-08-16 09:19:02  tank  DEGRADED raidz1-0 / ata-WDC_...  ALERT
```
<!-- verify: example output invented for illustration -->

## License

MIT — see [LICENSE](LICENSE).
````

Note what the example does: every value that came from the user appears
unmarked, and every value that was inferred carries a `<!-- verify -->` comment
naming the inference. The repository URL was not supplied, so it is a
placeholder rather than a guess.
