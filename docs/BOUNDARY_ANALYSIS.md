# Boundary Value Analysis & Equivalence Partitioning

Documented according to **Section 8: Use boundary values and equivalence partitions**.

---

## 1. Task Title Field (Length: 1 to 120 Characters)

| Partition or Boundary | Example Input | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- |
| **Empty** | `""` | Reject (HTTP 400) | Pass |
| **Whitespace only** | `"   "` | Reject (HTTP 400) | Pass |
| **Minimum valid length** | `"a"` (1 char) | Accept (HTTP 201) | Pass |
| **Typical valid title** | `"Plan tests"` (10 chars) | Accept (HTTP 201) | Pass |
| **Maximum valid length** | 120 characters (`"a" * 120`) | Accept (HTTP 201) | Pass |
| **Just over maximum** | 121 characters (`"a" * 121`) | Reject (HTTP 400) | Pass |
| **Wrong type in API JSON** | `title: 42` or `title: {}` | Reject safely (HTTP 400) | Pass |

---

## 2. Password Field (Length: 8 to 64 Characters)

*Practice Exercise: Apply this approach to the password field. Check empty, minimum length, typical value, maximum length, and over-limit input. Avoid testing with a real password.*

| Partition or Boundary | Character Count | Example Synthetic Input | Expected Result | Security Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Empty** | 0 | `""` | Reject (HTTP 400) | Password cannot be absent. |
| **Whitespace only** | 8 | `"        "` | Reject (HTTP 400) | Prevents accidental non-visible passwords. |
| **Just below minimum** | 7 | `"Ab1#xyz"` | Reject (HTTP 400) | Below required entropy baseline (min 8 chars). |
| **Minimum valid length** | 8 | `"Pass123!"` | Accept (HTTP 201) | Meets minimum policy boundary. |
| **Typical valid password** | 16 | `"local-test-pass1"` | Accept (HTTP 201) | Standard realistic user credential. |
| **Maximum valid length** | 64 | `"A"*64` | Accept (HTTP 201) | Upper boundary supported by hashing function. |
| **Just over maximum** | 65 | `"A"*65` | Reject (HTTP 400) | Prevents bcrypt CPU denial-of-service (72-byte truncation limit). |
| **Wrong type in JSON** | N/A | `password: true` or `password: 12345678` | Reject safely (HTTP 400) | Strict type validation prevents unexpected exceptions. |

