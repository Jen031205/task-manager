# Regression Checklist & Smoke Test Suite

Documented according to **Section 13: Run smoke tests, regression tests, and manage test data**.

---

## 1. Fast Smoke Suite (Critical Path)

*Executed after every build / deployment before starting extended testing.*

- [x] **Smoke 1 - App Launch**: Mobile app boots to initial screen without blank screen or crash.
- [x] **Smoke 2 - User Login**: User enters valid credentials, receives JWT token, and navigates to `My Tasks`.
- [x] **Smoke 3 - Task List Loading**: Existing tasks load and render in `TaskListPanel`.
- [x] **Smoke 4 - Task Creation**: Tapping `+`, entering `"Smoke test task"`, and saving adds task to list immediately.
- [x] **Smoke 5 - Session Termination (Logout)**: Tapping logout revokes current session and returns to login screen.

---

## 2. Comprehensive Regression Checklist (Practice Exercise)

*Executed prior to release or after modifying core backend or mobile modules.*

### A. Task Creation
- [ ] Valid task title (1 to 120 characters) saves and returns HTTP 201.
- [ ] Leading and trailing whitespaces are automatically trimmed before saving.
- [ ] Blank or empty title generates instant validation error without server crash.
- [ ] Non-string JSON types (numbers, objects, booleans) return HTTP 400 safely.
- [ ] Title with exactly 120 characters is accepted; title with 121 characters is rejected.
- [ ] Task is associated with authenticated user ID only; client `ownerId` is discarded.

### B. Task Editing
- [ ] Editing existing task title persists changes to PostgreSQL database.
- [ ] Invalid title on edit displays validation feedback and preserves existing title.
- [ ] Task `updated_at` timestamp advances upon update.
- [ ] Offline edit attempt notifies user and preserves local draft state.

### C. Task Completion
- [ ] Tapping task toggles completion status between `false` and `true`.
- [ ] Completed task renders distinct visual state (`(Completed)`).
- [ ] Refreshing task list maintains completion state.
- [ ] Toggling completion does not remove the task from the list view.

### D. Task Deletion
- [ ] Deleting a task removes it from database and UI immediately.
- [ ] Deletion of non-existent or foreign task ID returns HTTP 404.
- [ ] Deleting last task transitions view to empty state (`"No tasks yet."`).

### E. Cross-User Access & Authorization Boundary
- [ ] User A cannot read User B's task by navigating to or requesting `/api/v1/tasks/:id` (returns HTTP 404).
- [ ] User A cannot update User B's task (returns HTTP 404).
- [ ] User A cannot delete User B's task (returns HTTP 404).
- [ ] User A's task list query only returns tasks belonging to User A.
- [ ] Using expired or tampered access token immediately redirects to login screen.

