# AGENTS.md

## Project Architecture Rules

This project uses a strict Feature-Based Architecture.

Agents MUST follow this architecture and MUST NOT create new top-level folders unless explicitly requested by a human.

---

## Allowed Top-Level Structure

```text
src/
├── app/
├── features/
├── shared/
├── services/
└── assets/
```

No additional top-level folders are allowed.

Forbidden examples:

```text
src/components
src/pages
src/hooks
src/utils
src/helpers
src/common
src/modules
src/screens
src/views
src/layouts
```

---

# Folder Responsibilities

## app/

Application-level configuration.

Allowed:

```text
app/
├── router/
├── providers/
├── layouts/
└── store/
```

Examples:

* React Router setup
* Query Client Provider
* Theme Provider
* Global Zustand stores
* Root layouts

Do NOT place business logic here.

---

## features/

Contains all business domains.

Each business domain must live inside a feature.

Example:

```text
features/
├── auth/
├── employee/
├── attendance/
├── leave/
├── payroll/
├── recruitment/
├── performance/
├── training/
├── organization/
└── dashboard/
```

Never place business code outside a feature.

---

# Feature Structure

Every feature should follow:

```text
feature-name/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Example:

```text
attendance/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
└── index.ts
```

---

## shared/

Contains reusable code shared by multiple features.

Allowed:

```text
shared/
├── components/
├── hooks/
├── lib/
├── utils/
├── constants/
└── types/
```

Rule:

If code is used by only one feature, it must stay inside that feature.

Only move code to shared after it is reused by at least two features.

---

## shared/components/ui

Reserved for shadcn/ui components.

Examples:

```text
shared/components/ui/button.tsx
shared/components/ui/dialog.tsx
shared/components/ui/input.tsx
```

Do not place business components here.

Forbidden:

```text
shared/components/ui/employee-table.tsx
shared/components/ui/payroll-form.tsx
```

These belong to their feature.

---

## services/

Reserved for external integrations.

Example:

```text
services/
└── api/
```

Allowed:

* Axios instance
* API client
* Request interceptors
* Authentication headers

Forbidden:

* Business logic
* Feature-specific API calls

Example:

Wrong:

```text
services/api/getEmployees.ts
```

Correct:

```text
features/employee/api/getEmployees.ts
```

---

# Import Rules

Allowed:

```ts
import { Button } from "@/shared/components/ui/button";
```

```ts
import { EmployeeTable } from "@/features/employee/components/employee-table";
```

Avoid deep relative imports.

Forbidden:

```ts
../../../components/button
```

Always prefer aliases.

---

# Component Rules

Business components stay inside their feature.

Example:

```text
features/employee/components/employee-form.tsx
```

Do not move them into shared unless reused by multiple features.

---

# State Management

Global state:

```text
app/store/
```

Examples:

* auth-store
* ui-store
* notification-store

Feature state should remain inside the feature whenever possible.

---

# API Rules

Feature APIs belong inside:

```text
features/*/api
```

Example:

```text
features/employee/api/get-employees.ts
features/employee/api/create-employee.ts
```

Do not create giant API files.

Maximum responsibility: one endpoint per file.

---

# Before Creating Any File

Agent must ask:

1. Is this business-specific?
   → Place inside feature.

2. Is this reused by multiple features?
   → Place inside shared.

3. Is this application infrastructure?
   → Place inside app.

4. Is this external integration?
   → Place inside services.

If none apply, do NOT create a new folder.
Use an existing folder.

---

# Forbidden Actions

* Creating new top-level folders.
* Creating "common", "helpers", "misc", "global", "general", or similar dumping-ground folders.
* Creating duplicate folder purposes.
* Moving files across architectural boundaries without explicit instruction.
* Storing feature logic inside shared.
* Storing business logic inside app.
* Storing feature APIs inside services.

When uncertain, prefer existing folders over creating new ones.
