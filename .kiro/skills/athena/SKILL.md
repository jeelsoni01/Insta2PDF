---
name: athena
description: >-
  Generates structured technical documentation — READMEs, deployment guides, and
  knowledge base articles (KBAs) — from supplied details, using fixed section
  templates. Use this skill whenever the user asks to write, draft, or clean up a
  README, project documentation, an install or deployment guide, a runbook-style
  writeup, a KBA, a support article, or a post-incident writeup — including when
  they just describe a problem they solved and ask to "document it."
license: MIT
compatibility: >-
  No runtime dependencies, no API keys, no network calls. The optional validator
  (scripts/validate_doc.py) requires Python 3.8+ and uses only the standard library.
metadata:
  version: "1.0.0"
  author: ibatsios
  doc-types: readme, deploy-guide, kba
---

# Athena — technical documentation generator

Turn supplied details into a README, a deployment guide, or a KBA with a fixed
section structure. The prose varies; the shape does not.

Work through the five steps below in order.

## Step 1 — Identify the document type

Route the request to exactly one of three types.

| User says | Type |
|---|---|
| "Write a README for this repo" | `readme` |
| "Document the project so people can use it" | `readme` |
| "Document how to deploy this on AlmaLinux" | `deploy-guide` |
| "Write install instructions for our Docker stack" | `deploy-guide` |
| "Turn this troubleshooting into a KBA" | `kba` |
| "I fixed it — write it up for the team" | `kba` (confirm before proceeding) |
| "Write up the incident from last night" | `kba` |

**Do not trigger** on these — they are not documents this skill produces:

| User says | Why not |
|---|---|
| "Explain what this function does" | Code explanation, not a document |
| "Summarise this meeting" | Not a technical document |
| "Summarise the last three commits" | Changelog/summary, not a document |
| "Add docstrings to this module" | Inline code comments |
| "Write a blog post about X" | Not a structured technical document |

If the request is genuinely ambiguous between two types, ask which one before
loading anything. Do not guess.

## Step 2 — Load the spec and template

Read **exactly one pair** of files — the pair for the identified type. Do not
read all three; that defeats the point of the split.

| Type | Read these two files |
|---|---|
| `readme` | `references/readme-spec.md` and `assets/templates/readme.template.md` |
| `deploy-guide` | `references/deploy-guide-spec.md` and `assets/templates/deploy-guide.template.md` |
| `kba` | `references/kba-spec.md` and `assets/templates/kba.template.md` |

The spec file holds the field table, the exact section order, per-section
guidance, and a worked example. It is authoritative — where this file and the
spec file disagree about sections, the spec file wins.

## Step 3 — Collect inputs

The user supplies values three ways. All are valid:

| Method | Example |
|---|---|
| Prose in the request | "Write a KBA for the LDAP login failure on the app node; root cause was a stale bind DN" |
| Direct invocation | `/athena kba` |
| A pasted YAML block | `doc_type: kba` / `title: ...` / `environment: ...` |

Check the supplied information against the **required** fields in the loaded
spec, then:

1. If every required field is present → go to Step 4.
2. If any are missing → ask for **all** of them in **one** message, as a
   numbered list, then wait. Never interrogate field-by-field across turns.
   One batch, then generate.
3. Optional fields that are missing follow the "Default if omitted" column in
   the spec. Do not ask for optional fields.

If the user replies that they do not have a value, or asks you to proceed
anyway, emit `<ANGLE_BRACKET_CAPS>` placeholders for it and continue. Never
stall the document over a value the user has said they cannot supply.

## Step 4 — Generate

Fill the template. Apply these output rules to every document:

| Rule | Detail |
|---|---|
| Format | GitHub-flavoured Markdown (pastes into Confluence cleanly) |
| Sections | Exactly the order in the loaded spec. Never reorder, never rename headings |
| Tables | Use a table for anything with three or more parallel attributes — versions, ports, fields, options |
| Diagrams | Fenced ` ```mermaid ` blocks only. No ASCII art, no image links |
| Uncertainty | Any value you inferred rather than were told gets an inline `<!-- verify: reason -->` comment on the same line or immediately after |
| Placeholders | `<ANGLE_BRACKET_CAPS>` for values the user must fill in later |
| Commands | Fenced code blocks with a language hint (`bash`, `yaml`, `sql`) |
| Tone | Imperative and terse. "Run X", not "You may wish to consider running X" |
| Length | No filler. A section with nothing to say gets omitted (if optional) or a `TODO` marker (if required) |

Sections marked optional in the spec are omitted entirely when there is no
content for them — do not emit an empty heading. Required sections are always
emitted, with a `TODO:` line if the content is genuinely unavailable.

## Step 5 — Deliver

1. Write the document to `<slugified-title>.md` in the working directory —
   lowercase, hyphens for spaces, no punctuation.
2. State the full path in your reply.
3. If the validator is available, run it against the file you just wrote and
   report the result. It lives beside this file, in the skill's own directory —
   not in the user's working directory:
   `python3 <skill-dir>/scripts/validate_doc.py <file> --type <readme|deploy-guide|kba>`
4. List every `<!-- verify -->` marker and `<ANGLE_BRACKET_CAPS>` placeholder
   you left, so the user knows exactly what still needs a human.
5. Offer one round of revision. Do not iterate unprompted.

## Do not

- **Do not invent facts.** No made-up version numbers, hostnames, IP addresses,
  ticket IDs, URLs, file paths, or command flags. If you inferred it, mark it
  `<!-- verify -->`. If you cannot infer it, ask or use a placeholder.
- **Do not publish anywhere.** This skill produces a file. Posting it to
  Confluence, GitHub, a wiki, or a ticket is the human's job.
- **Do not reformat unrelated files.** Write the one document that was asked for.
- **Do not read all three spec files.** One type, one pair.
- **Do not add an attribution or "generated by" footer** to the document unless
  the user explicitly asks for one.
- **Do not pad.** A short accurate document beats a long padded one.
