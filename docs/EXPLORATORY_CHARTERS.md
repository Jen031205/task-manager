# Exploratory Testing Charters & Session Notes

Conducted according to **Section 3: Explore the app with a charter**.

---

## Charter Definition

- **Charter Goal**: Explore task creation and editing under adverse client conditions to identify data-loss, duplicate submission, and state synchronization problems.
- **Target Area**: Task creation dialog, task edit form, offline transitions, rapid input events.
- **Time Box**: 15 minutes.
- **Tester**: QA Engineer / Tester.
- **Environment**: Mobile App v1.0.0 (Local Dev), API v1.0.0 (Node/Express), Simulated network latency/throttling.

---

## 15-Minute Session Notes (Practice Exercise)

| Time | Action or Condition | Observation | Follow-up / Risk |
| :--- | :--- | :--- | :--- |
| **00:00** | Signed in as test user A (`tester@example.test`). | Task list loaded cleanly. | Verify initial empty state before adding tasks. |
| **00:02** | Entered a long title containing exactly 120 characters (`"A"*120`). | Task saved successfully and rendered within card boundaries. | Check text wrapping on small screens (e.g. 320dp width). |
| **00:04** | Attempted to enter a title containing 121 characters. | API returned 400 Bad Request; UI displayed `"Enter a valid title."` error banner without app crash. | Add client-side counter/validator to prevent sending request over 120 chars. |
| **00:06** | Submitted a blank title and a title with spaces only (`"   "`). | Input was rejected cleanly. Save button did not freeze; cursor remained active. | Verify error disappears when valid text is typed. |
| **00:08** | Rapid repeated taps on `Save Task` button (5 taps within 200ms). | Dialog dispatched single request; UI disabled button while in-flight, preventing duplicate task creation. | Confirm rate limiter does not trigger on accidental double-clicks. |
| **00:11** | Edited task title, disabled network adapter (airplane mode), then tapped Save. | UI showed safe error notification (`"Could not connect to server"`). Task in local list retained previous title without corrupting state. | Confirm unsaved draft can be retried once network returns. |
| **00:14** | Restored network connectivity and tapped `Retry` button on error banner. | Network re-established, task updated successfully on backend and UI refreshed. | Completed journey validated. |

---

## Key Findings & What Surprised Us

1. **Double Submission Prevention**: Fast tapping was properly mitigated by disabling the submission trigger during in-flight async operations.
2. **Error Recovery**: The explicit `Retry` button on error states allows non-technical users to recover from transient Wi-Fi drops without retyping their task descriptions.
3. **Graceful Sanitization**: Untrusted inputs containing HTML tags (`<script>alert(1)</script>`) and SQL quotes (`' OR '1'='1`) were cleanly rendered as plaintext without breaking layout or execution.

