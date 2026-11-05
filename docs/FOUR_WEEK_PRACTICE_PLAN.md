# Four-Week Practice Plan & Common Mistakes Reference

Documented according to **Four-week practice plan** (Page 20).

---

## Four-Week Practice Plan

| Week | Focus Area | Required Practice Outcomes | Status in this Project |
| :---: | :--- | :--- | :---: |
| **1** | **Mindset, Plans, Test Cases, Exploratory Testing** | - A structured test plan (`docs/TEST_PLAN.md`)<br>- Three formal test cases (`docs/TEST_CASES.md`)<br>- One time-boxed exploratory testing report (`docs/EXPLORATORY_CHARTERS.md`) | **Complete** |
| **2** | **Unit, Widget, API, and Integration Tests** | - Backend Jest tests for title validation (`backend/tests/unit/validation.test.js`)<br>- Flutter model and widget state tests (`mobile/test/`)<br>- Supertest API security & ownership boundary tests (`backend/tests/api/`) | **Complete** |
| **3** | **End-to-End, Boundaries, Security, Accessibility** | - Complete Flutter E2E journey (`mobile/integration_test/app_test.dart`)<br>- Title & password boundary value analysis (`docs/BOUNDARY_ANALYSIS.md`)<br>- OWASP API security verification (`docs/OWASP_SECURITY_CHECKLIST.md`)<br>- Usability & accessibility evaluation (`docs/COMPATIBILITY_MATRIX.md`) | **Complete** |
| **4** | **Performance, Compatibility, Regression, CI** | - Local k6 performance & health check script (`k6/health-test.js`)<br>- Device & platform compatibility matrix (`docs/COMPATIBILITY_MATRIX.md`)<br>- Regression checklist & smoke suite (`docs/REGRESSION_CHECKLIST.md`)<br>- Automated GitHub Actions CI workflow (`.github/workflows/tests.yml`) | **Complete** |

---

## Common Testing Mistakes & How They Are Addressed

1. **Testing only the happy path**:
   - *Mitigation*: Comprehensive negative tests implemented for empty titles, strings over 120 chars, invalid types, invalid IDs, and missing tokens.
2. **Writing vague expected results such as "works correctly"**:
   - *Mitigation*: All test cases and acceptance criteria describe observable, specific behaviors (e.g. "HTTP 400 with error message 'Enter a valid title.'").
3. **Treating a passing test as proof that the feature is secure**:
   - *Mitigation*: Multi-layered security verification (rate limiting, parameterized queries, strict ownership scoping, token reuse detection).
4. **Using real user data or credentials in test environments**:
   - *Mitigation*: Strictly synthetic disposable data (`tester@example.test`, `local-test-password`).
5. **Testing ownership with only one account**:
   - *Mitigation*: Cross-user tests always instantiate two distinct synthetic users (User A / Owner and User B / Stranger) to verify authorization boundaries.
6. **Including tokens, passwords, or private data in screenshots and logs**:
   - *Mitigation*: Redacted test evidence policies, sanitized error handlers, and excluded secrets in terminal logs.
7. **Writing end-to-end tests for every detail instead of reserving them for important workflows**:
   - *Mitigation*: Strict testing pyramid adherence: units for validation, widgets for component states, Supertest for API contracts, and E2E solely for the core user journey.

