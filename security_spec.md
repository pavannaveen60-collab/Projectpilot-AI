# Security Specification: ProjectPilot AI

## System Overview
ProjectPilot AI implements Zero-Trust Attribute-Based Access Control (ABAC) and Least-Privilege access patterns. All student data, project proposals, roadmap tasks, and mentoring logs are isolated on a per-user tenancy boundary.

## Core Invariants
1. **Tenancy Isolation**: A student can strictly only read and mutate documents where the root path parameter `{userId}` strictly matches `request.auth.uid`.
2. **Path Sanitization**: All document IDs (`projectId`, `taskId`, `sessionId`, `ideaId`) are bounded to 1-128 alphanumeric characters matching `^[a-zA-Z0-9_-]+$` to prevent ID injection and directory traversal attacks.
3. **Immutability of Provenance**: Ownership identifiers (`userId`), document IDs (`id`), and generation timestamps (`createdAt`) cannot be altered after creation.
4. **Action-Based Partial Updates**: Updates are bounded using `diff().affectedKeys().hasOnly(...)` to prevent shadow field injection (e.g., privilege escalation or status manipulation).
5. **Temporal Integrity**: `createdAt` and `updatedAt` timestamps strictly validate against `request.time`.
6. **API Key Concealment**: Google Gemini API keys are never distributed to or accessible by client browsers. All generation and mentoring calls route through authenticated Express server endpoints with input sanitation and rate throttling.

## Dirty Dozen Payloads (Hardened Penetration Tests)
All 12 adversarial payloads are rejected with `PERMISSION_DENIED` or `INVALID_ARGUMENT`:
1. **Unauthenticated Read**: Anonymous client attempts to read `/users/student_123`. (Rejected: `request.auth == null`)
2. **Cross-Tenant Impersonation**: Authenticated `student_A` attempts to get `/users/student_B`. (Rejected: `request.auth.uid != userId`)
3. **Cross-Tenant Project Hijacking**: `student_A` attempts to write `/users/student_B/projects/proj_1`. (Rejected: `isOwner(userId)` fails)
4. **ID Injection / Path Poisoning**: Client attempts to create doc with ID containing `../admin/secrets`. (Rejected: `isValidId()` regex guard)
5. **Ghost Field Poisoning**: Client creates user profile with unexpected field `{ role: "superadmin" }`. (Rejected: strict schema check)
6. **Ownership Tampering**: User attempts to update `userId` on an existing project doc to transfer it. (Rejected: `incoming().userId == existing().userId`)
7. **Creation Timestamp Spoofing**: Client sends synthetic past timestamp in `createdAt`. (Rejected: `incoming().createdAt == request.time`)
8. **Oversized String Denial-of-Wallet**: Client attempts to submit 5MB string in `careerGoal`. (Rejected: `careerGoal.size() <= 200`)
9. **Invalid Status Transition**: Client attempts to set project status to `unauthorized_admin_mode`. (Rejected: `status in ['active', 'archived', 'completed']`)
10. **Roadmap Task Orphan Write**: Client attempts to write a roadmap task referencing a foreign project ID. (Rejected: `incoming().projectId == projectId`)
11. **Client-Side Secret Exposure Attempt**: Client requests `/api/gemini/...` with mock key in query params. (Rejected: Server uses `process.env.GEMINI_API_KEY` only)
12. **Blanket Query Scraping**: Malicious user runs root collection group query across all student roadmaps. (Rejected: default-deny `/{document=**}` catch-all)
