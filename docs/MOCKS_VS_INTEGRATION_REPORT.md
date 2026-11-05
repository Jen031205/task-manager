# Mocks vs. Integration Testing Comparative Analysis

Documented according to **Section 15: Choose mocks carefully and manage flaky tests**.

---

## Comparison Matrix

| Evaluation Dimension | Mocked API-Client Test (e.g. Unit Test with Mock HTTP) | API Integration Test (e.g. Supertest + Test PostgreSQL) |
| :--- | :--- | :--- |
| **Execution Speed** | Extremely fast (milliseconds). Can run thousands in seconds. | Moderate (hundreds of milliseconds to a few seconds). |
| **Dependencies** | Zero external dependencies; self-contained in memory. | Requires database engine (or in-memory SQL runner) and network/socket layer. |
| **Flakiness Risk** | Virtually zero flakiness. Deterministic behavior. | Potential flakiness if state is shared or ports conflict between runs. |

---

## What Each Test Type Catches and Cannot Catch (Practice Exercise)

### 1. Mocked API-Client Test
- **What it catches**:
  - UI state mapping (loading indicators, empty states, error display).
  - Client-side data serialization/deserialization logic (`Task.fromJson`).
  - Correct HTTP verb and endpoint path sent by the client.
  - Callback invocations (e.g. retry button triggering handler once).
- **What it CANNOT catch**:
  - Database schema mismatches (e.g. column renamed in PostgreSQL but not in code).
  - Foreign key and unique constraint violations (e.g. duplicate email on register).
  - Real database transaction rollbacks or locking issues.
  - Actual authorization vulnerabilities: **Never mock the authorization boundary!** A mock that returns 403 because you told it to return 403 proves nothing about backend authorization security.

### 2. API Integration Test with Database
- **What it catches**:
  - Broken Object-Level Authorization (BOLA): Confirms that SQL query strictly filters by `user_id = $authenticated_user`.
  - Token rotation & reuse detection: Confirms database state records revocation and revokes entire token family upon reuse.
  - SQL syntax and query execution errors.
  - Real middleware execution: Authentication extraction, helmet security headers, rate limiting.
- **What it CANNOT catch**:
  - Client UI rendering glitches, layout overflow, or touch target responsiveness.
  - Client platform-specific issues (e.g. mobile keychain or secure storage exceptions).
  - Flakiness in mobile platform lifecycle events.

---

## Best Practice Recommendation
Maintain the testing pyramid:
1. Use **mocks** for fast, deterministic Flutter widget state tests and client parsing checks.
2. Use **real/isolated database integration tests** for all authentication, authorization boundaries, and persistence logic.
3. Keep a **lean suite of end-to-end tests** for critical user journeys.

