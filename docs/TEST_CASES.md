# Test Cases: Task Manager

Documented according to the guide's **Test Case Template**.

---

### TC-01: User Registration with Valid Credentials
- **ID and Title**: TC-01 - User Registration with Valid Credentials
- **Preconditions**: Backend API running, database clean, user email not already registered.
- **Steps**:
  1. Send `POST /api/v1/auth/register` with synthetic email and password.
  2. Inspect response status code and body.
- **Test Data**:
  ```json
  {
    "email": "tester@example.test",
    "password": "local-test-password"
  }
  ```
- **Expected Result**: HTTP `201 Created` returned. Body contains user object (with UUID and normalized email), `accessToken` (JWT), and `refreshToken` (JWT). Password hash is not returned.
- **Actual Result**: Passed (HTTP 201, valid JWT pair returned).
- **Environment**: Node.js v20.20.0, Jest + Supertest, In-memory PostgreSQL engine.

---

### TC-02: Task Creation with Valid Title
- **ID and Title**: TC-02 - Task Creation with Valid Title
- **Preconditions**: Authenticated user with valid Bearer access token.
- **Steps**:
  1. Send `POST /api/v1/tasks` with `Authorization: Bearer <token>`.
  2. Provide a valid task title string.
  3. Send `GET /api/v1/tasks` to verify presence in task list.
- **Test Data**:
  ```json
  {
    "title": "Check release flow"
  }
  ```
- **Expected Result**: HTTP `201 Created` returned with task ID, trimmed title, `isCompleted: false`, and timestamp. Task appears in list returned by `GET /api/v1/tasks`.
- **Actual Result**: Passed (Task created and visible in task list).
- **Environment**: Node.js v20, Supertest / Flutter integration test.

---

### TC-03: Task Creation Rejected with Whitespace-Only Title
- **ID and Title**: TC-03 - Task Creation Rejected with Whitespace-Only Title
- **Preconditions**: Authenticated user.
- **Steps**:
  1. Send `POST /api/v1/tasks` with whitespace-only title: `"   "`.
  2. Inspect HTTP status code and response body.
- **Test Data**:
  ```json
  {
    "title": "   "
  }
  ```
- **Expected Result**: HTTP `400 Bad Request` returned with `{ "error": "Enter a valid title." }`. No record is created in the database.
- **Actual Result**: Passed (HTTP 400 returned with exact error message).
- **Environment**: Node.js v20, Supertest.

---

### TC-04: Cross-User Task Access Denied (BOLA Boundary)
- **ID and Title**: TC-04 - Cross-User Task Access Denied (BOLA Boundary)
- **Preconditions**: Two synthetic accounts created: User A (Owner) and User B (Stranger). User A has created a private task with ID `taskId_A`.
- **Steps**:
  1. Send `GET /api/v1/tasks/<taskId_A>` using User B's access token in the `Authorization` header.
  2. Inspect response status code and payload.
- **Test Data**: User B token, `taskId = taskId_A`.
- **Expected Result**: Request is rejected with HTTP `404 Not Found` (or `403 Forbidden`). Response does not disclose task existence or data.
- **Actual Result**: Passed (HTTP 404 returned consistently).
- **Environment**: Node.js v20, Supertest API Security Suite.

---

### TC-05: Client-Supplied `ownerId` Injection Prevention
- **ID and Title**: TC-05 - Client-Supplied `ownerId` Injection Prevention
- **Preconditions**: User A owns a task. User B exists in the system.
- **Steps**:
  1. Send `PUT /api/v1/tasks/<taskId_A>` using User A's token.
  2. Include `ownerId: "<user_B_id>"` and `userId: "<user_B_id>"` in the request body.
  3. Verify whether User B can now read or access the task.
- **Test Data**:
  ```json
  {
    "title": "Updated Title",
    "ownerId": "attacker-id-attempt",
    "userId": "attacker-id-attempt"
  }
  ```
- **Expected Result**: Server derives ownership exclusively from the authenticated JWT session. The task remains strictly owned by User A; User B receives `404 Not Found`.
- **Actual Result**: Passed (Ownership preserved, unauthorized reassignment ignored).
- **Environment**: Node.js v20, Jest / Supertest.

---

### TC-06: Refresh Token Rotation & Token Reuse Invalidation
- **ID and Title**: TC-06 - Refresh Token Rotation & Token Reuse Invalidation
- **Preconditions**: User is logged in and possesses `refreshToken_1`.
- **Steps**:
  1. Send `POST /api/v1/auth/refresh` with `refreshToken_1`.
  2. Verify that new `refreshToken_2` is issued and `refreshToken_1` is marked revoked.
  3. Attempt to call `POST /api/v1/auth/refresh` again with the old `refreshToken_1` (simulating replay/theft).
  4. Attempt to use `refreshToken_2`.
- **Test Data**: Synthetic user tokens.
- **Expected Result**: Step 1 succeeds with HTTP 200. Step 3 fails with HTTP `403 Forbidden` ("Token reuse detected"). Step 4 fails with HTTP `403` because the entire token family was revoked.
- **Actual Result**: Passed (Complete token family invalidated upon reuse attempt).
- **Environment**: Node.js v20, Supertest.

