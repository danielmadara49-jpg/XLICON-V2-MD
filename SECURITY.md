# Security Policy

## Supported Versions

We provide security updates and patches for the current release version of **XLICON-V2-MD**.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The safety and privacy of our users and their data are paramount. If you discover a security vulnerability in XLICON-V2-MD, please report it responsibly by following these steps:

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email the maintainer directly at **[salmansheikh2500@gmail.com](mailto:salmansheikh2500@gmail.com)** with the subject line `[SECURITY] XLICON-V2-MD Vulnerability Report`.
3. Alternatively, submit a report via GitHub's [Private Vulnerability Reporting](https://github.com/ahmmikun/XLICON-V2-MD/security/advisories/new) if available.

### What to Include in Your Report

To help us triage and resolve the issue quickly, please include:

- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions to reproduce the vulnerability (proof-of-concept code or screenshots if applicable).
- Affected files, functions, or dependencies.
- Any suggested mitigations or patches, if you have identified one.

### Response Timeline

- **Acknowledgment:** Within 48 hours of your report.
- **Triage & Assessment:** We will verify the issue and assess its severity.
- **Fix & Disclosure:** We will work on a fix in a private branch and coordinate a release date before public disclosure.

---

## Security Best Practices for Users

When hosting or running XLICON-V2-MD, please follow these security guidelines:

1. **Protect Your Session Data:**
   - Never share your `SESSION_ID` or the contents of your `session/` directory with anyone. Anyone with your session data can control your WhatsApp account.
   - Never commit `.env` or session files to any public GitHub repository. Ensure `.gitignore` includes `.env` and `session/`.

2. **Keep Dependencies Updated:**
   - Regularly update dependencies using `npm audit` and `npm update` to avoid known vulnerabilities in third-party libraries (e.g., `@whiskeysockets/baileys`, `axios`).

3. **Bot Admin Permissions:**
   - Only grant bot admin privileges in trusted groups to avoid unauthorized execution of administrative commands.
