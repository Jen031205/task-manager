# OWASP API Security Checklist & Negative Testing

Documented according to **Section 9: Test negative behavior and security basics**.

---

## OWASP API Security Top 10 Audit

| Concern | Task Manager Implementation & Check | Test Status |
| :--- | :--- | :--- |
| **Broken Object-Level Authorization (BOLA)** | Every task query (`SELECT`, `UPDATE`, `DELETE`) is scoped to `WHERE id = $1 AND user_id = $authenticated_user`. Stranger queries return `404 Not Found` without disclosing record existence. | **PASS** (`tests/api/tasks.test.js`) |
| **Broken Authentication** | Invalid, malformed, expired, and revoked JWT tokens are rejected with `401 Unauthorized`. Refresh tokens use single-use rotation with automatic revocation of the whole token family upon reuse. | **PASS** (`tests/api/auth.test.js`) |
| **Broken Object Property-Level Authorization** | Clients cannot manipulate `ownerId` or `userId`. Server derives ownership exclusively from the verified JWT payload. Client-sent privileged fields are discarded. | **PASS** (`tests/api/tasks.test.js`) |
| **Unrestricted Resource Consumption** | Express JSON body size is bounded (`10kb`). Request payloads exceeding limits are rejected before parsing. Title length bounded to 120 characters. | **PASS** |
| **Broken Function-Level Authorization** | Protected task routes require valid user identity. Admin/privileged actions are completely gated behind role checks. | **PASS** |
| **Unrestricted Access to Sensitive Business Flows** | Login, register, and refresh routes are guarded with `express-rate-limit` (10 requests per 15-minute window in production). | **PASS** (`backend/src/middleware/rateLimiter.js`) |
| **Server-Side Request Forgery (SSRF)** | The application accepts no user-controlled upstream URLs or outgoing webhook destinations. | **PASS** (Zero external fetch endpoints) |
| **Security Misconfiguration** | `helmet` configured for secure HTTP headers (X-Frame-Options, Content-Security-Policy, HSTS). CORS restricted to explicit origin rules. Sensitive database credentials managed via `.env`. | **PASS** (`backend/src/app.js`) |
| **Improper Inventory Management** | API routes are versioned explicitly (`/api/v1/*`). Deprecated legacy endpoints are not exposed. | **PASS** |
| **Unsafe Consumption of APIs** | Backend communicates with database via parameterized SQL statements, eliminating SQL injection. Client strings rendered as plaintext. | **PASS** |

---

## Negative Testing Scenarios Verified

1. **SQL Injection Payload**:
   - Sent title: `' OR '1'='1`
   - Outcome: Treated as literal characters, inserted into PostgreSQL via parameter `$3`, retrieved intact without SQL execution.
2. **Cross-Site Scripting (XSS) Payload**:
   - Sent title: `<script>alert(1)</script>`
   - Outcome: Stored as plaintext string; rendered into Flutter `Text` widget safely without execution.
3. **Privilege Escalation via `ownerId` Injection (Practice Exercise)**:
   - Sent payload: `{"title": "Updated", "ownerId": "stranger-uuid"}`
   - Outcome: Task remains owned by authenticating user; stranger account receives `404` when attempting lookup.

