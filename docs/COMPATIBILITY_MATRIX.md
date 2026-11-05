# Device & Platform Compatibility Matrix + Accessibility

Documented according to **Section 11 & Section 12**.

---

## Device & Platform Compatibility Matrix

| Platform | Device Profile | OS Range | Primary Checks |
| :--- | :--- | :--- | :--- |
| **Android** | Small screen (e.g. 4.7" 720p) | Android 8.0+ (API 26+) | Login layout, text scaling (200%), keyboard overlapping text fields, offline network banner. |
| **Android** | Current mainstream device (e.g. Pixel 8, 6.2") | Android 14+ (API 34+) | Full task CRUD, pull-to-refresh, backgrounding/resume, token rotation, logout. |
| **iOS** | Small screen (e.g. iPhone SE 3rd gen) | iOS 15+ | Layout density, secure storage keychain access, dynamic type text scaling, accessibility. |
| **iOS** | Current mainstream device (e.g. iPhone 15 Pro) | iOS 17+ | Biometric login readiness, lifecycle interruptions (incoming call), network recovery. |
| **Desktop / Web** | Windows 10/11 x64, Chrome / Edge | Modern browser | Responsive wide layout, keyboard shortcut navigation (Tab/Enter), fast automated smoke checks. |
| **Emulator / Simulator** | Development profile | Current toolchain | Fast automated smoke checks, `flutter test`, `integration_test` user journeys. |

---

## Usability & Accessibility Checklist (Section 11)

- [x] **Color Contrast**: All text and controls satisfy WCAG 2.1 AA minimum contrast (4.5:1 for body text, 3:1 for large text/icons).
- [x] **Accessible Names**: All buttons (`login-button`, `add-task-button`, `save-task-button`, `retry-button`) provide clear labels or tooltips.
- [x] **Screen Reader Order**: Screen readers announce screen title, task items, completion state, and errors in a predictable top-to-bottom sequence.
- [x] **Text Scaling**: App remains usable without clipping or pixel overflow when system text size is increased to 150% and 200%.
- [x] **Touch Target Size**: Interactive tap targets are at least 48x48 logical pixels.
- [x] **Recoverable Error Messages**: Errors explicitly tell the user how to recover (e.g. `"Enter a valid title (1-120 characters)"`, `"Retry"` button).
- [x] **Non-Color Indicators**: Completed tasks use both text indicators (`(Completed)`) and checkbox icons, not color alone.
- [x] **Keyboard Navigation**: Focus moves logically through fields using Tab, and Enter activates primary submission actions.

