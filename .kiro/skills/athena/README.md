# Athena

An Agent Skill that turns supplied details into structured technical
documentation — READMEs, deployment guides, and knowledge base articles — using
fixed section templates.

The prose varies. The shape does not.

## What it produces

| Type | Trigger examples | Required sections |
|---|---|---|
| **README** | "Write a README for this repo" | Overview, Requirements, Installation, Usage, License |
| **Deploy guide** | "Document how to deploy this on AlmaLinux" | Overview, Prerequisites, Installation, Verification, Rollback |
| **KBA** | "Turn this troubleshooting into a KBA", "I fixed it — write it up" | Summary, Environment, Symptom, Root Cause, Resolution, Verification |

## Folder layout

```
athena/
├── SKILL.md                        # routing + output rules (the skill itself)
├── README.md                       # this file
├── references/
│   ├── readme-spec.md
│   ├── deploy-guide-spec.md
│   └── kba-spec.md
├── assets/templates/
│   ├── readme.template.md
│   ├── deploy-guide.template.md
│   └── kba.template.md
└── scripts/
    └── validate_doc.py             # section validator, stdlib only
```

## Validate a generated document

```bash
python3 scripts/validate_doc.py my-kba.md --type kba
```

Exit codes: `0` valid, `1` missing/misordered sections, `2` usage error.
Python 3.8+, standard library only.

## License

MIT — source: https://github.com/IBatsios/agent-skills
