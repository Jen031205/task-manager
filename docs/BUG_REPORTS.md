# Bug Reports: Task Manager

Documented according to the guide's **Bug Report Template**.

---

## BUG-101: Task disappears from task list immediately after being marked complete

| Field | Value / Details |
| :--- | :--- |
| **Summary** | Task disappears from task list immediately after being toggled to complete instead of displaying completion styling. |
| **Environment** | Android Emulator (API 34, Android 14), Mobile App Build v1.0.0-dev, API Build `commit-4f92a1c`, Local Node.js v20. |
| **Preconditions** | - Signed in with test user `tester@example.test`.<br>- At least one pending task exists in the user's task list (e.g., `"Review release notes"`). |
| **Steps to Reproduce** | 1. Open the mobile application and log in as `tester@example.test`.<br>2. On the `My Tasks` screen, observe the task `"Review release notes"`.<br>3. Tap the task item or completion checkbox to mark the task as complete.<br>4. Observe the screen update. |
| **Expected Result** | The task remains visible on screen with visual completion feedback (e.g. `(Completed)` label, strike-through, or checked box). The completed state is preserved upon refreshing. |
| **Actual Result** | The task immediately vanishes from the screen. Navigating back or reloading the screen shows an empty state or the list without the completed item. |
| **Evidence** | - App console log: `TaskListScreen: filtered out task because isCompleted == true without UI tab switch`<br>- Redacted API network log: `PUT /api/v1/tasks/task-101 -> 200 OK {"id":"task-101","title":"Review release notes","isCompleted":true}`<br>- Inspection shows frontend state filter was defaulting to `isCompleted == false` instead of displaying all tasks. |
| **Severity** | **High** (Data apparent loss: user perceives that their task was deleted rather than marked done, risking accidental duplicate work or panic). |
| **Priority** | **High** (Core feature defect affecting primary task lifecycle and user feedback). |

---

## Severity vs Priority Distinction (Guide Reference)

- **Severity** describes the **technical impact** of the defect on system integrity, security, or data safety.
- **Priority** describes the **urgency or scheduling** of when the fix must be delivered.

| Scenario | Severity | Priority | Rationale |
| :--- | :--- | :--- | :--- |
| Crash that drops unsaved task data | High | High | Data loss + blocker |
| Minor typo on rarely-visited settings screen | Low | Low | Cosmetic, non-blocking |
| Broken sign-up button before a scheduled press demo | Low/Med (technical) | High (business) | Critical timeline urgency |
| Cross-user task data leakage (BOLA vulnerability) | Critical | Immediate / Highest | Security compromise |

