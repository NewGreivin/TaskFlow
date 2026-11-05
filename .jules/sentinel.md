## 2026-11-05 - SQL Injection in Backup Restore

**Vulnerability:** In `app/settings/backup.js`, restoring the settings dynamically built an INSERT statement using the keys of the JSON object without validation. A malicious backup file could inject arbitrary SQL commands by providing crafted keys.

**Learning:** Trusting input from imported backup files (even those intended for local SQLite databases) can lead to command execution/injection if dynamic query construction is used without sanitization.

**Prevention:** Always validate and filter the keys used in dynamic SQL queries against a strict allowlist of known columns (e.g. database schema columns).
