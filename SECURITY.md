# Security Policy

## Supported version

Security fixes are applied to the latest commit on `main`.

## Reporting a vulnerability

Use the repository's **Security > Advisories > Report a vulnerability** flow. Do not open a public issue containing credentials, tokens, client identifiers, private account data, or exploit details.

Include the affected tool or file, impact, reproduction steps, and a minimal proof of concept with all secrets removed. You should receive an initial response within seven days.

## Credential handling

- Keep OAuth client secrets, refresh tokens, API keys, developer tokens, Clarity tokens, and account mappings in ignored local files only.
- Never paste production credentials into issues, pull requests, Actions logs, examples, fixtures, or screenshots.
- If a secret is committed, revoke or rotate it immediately; deleting the Git commit is not sufficient.
- Keep mutation allowlists empty until write access is intentionally required for a specific account.

## Repository controls

The `main` branch rejects force pushes and deletion, requires the repository CI check, and uses read-only GitHub Actions permissions. Dependabot and GitHub vulnerability alerts monitor supported package dependencies.
