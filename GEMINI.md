# Moyabe Work: System Architecture & Development Context

> **[META INSTRUCTIONS FOR AI CONTEXT]**
> This file (`GEMINI.md`) is the primary context vector for AI assistants working on this repository. 
> 1. **Primary Audience:** AI Agents. Write clearly, structurally, and concisely. Use deterministic technical language over conversational phrasing. Maintain human-readability as a secondary goal.
> 2. **Context Efficiency:** Prevent context bloat. Document *contracts*, *architectural patterns*, and *strategic intent* rather than duplicating code or low-level implementation details easily found by reading the source. 
> 3. **Strategic Hierarchy:** `work-app` is the core product. All other projects (`work-api`, `work-auth`, `work-db`) exist *solely* as mock environments/development tools to support `work-app`.
> 4. **Update Protocol:** When making architectural changes, modifying API contracts, or changing data flows, this file MUST be updated to reflect the new state. Maintain a complete high-level mental model here so the AI does not need to crawl the entire codebase to understand the system.
> 5. **Context Maintenance** Whenever work is done on the projects in this repository by an AI agent that has a meaningful impact on overall architecture or any of the topics listed within this context file, be sure to add a step to update this context file to the work.

## Strategic Vision
Moyabe Work prototypes a dynamic, data-driven application system designed to modernize legacy systems rapidly. 
- **Core Loop:** Developers build a proxy API over legacy data that outputs standardized JSON. `work-app` consumes this JSON via a configuration file and dynamically renders a modern UI without custom frontend coding.
- **Success Criteria:** Seamless demonstrations of legacy-to-modern UI conversion during pitch meetings.

---

## 1. Core Product: `work-app` (`./work-app`)

**Role:** The primary application. A data-driven UI engine.
**Tech Stack:** Angular v21 (TypeScript), Bootstrap 5, Vite build system, Vitest.
**Key Patterns:**
- **Data-Driven UI:** UI is dynamically generated from JSON schemas using `@ngx-formly/core` and `@ngx-formly/bootstrap`.
- **Configuration-Driven Bootstrapping:** App behavior is defined by `WorkAppConfig` (injected via `WORK_APP_CONFIG` token), loaded before the app initializes.
- **Loose Coupling:** The app is completely agnostic to backend implementations. It only expects a REST API conforming to its JSON schemas and standard OAuth/OIDC JWT authentication.
- **Authentication & Auto-Renewal:** Auth is handled by `angular-auth-oidc-client`. The application initializes auth immediately upon load (`checkAuth()`) to handle active sessions and clear expired tokens. Providers are configured to support silent background renewal using `silentRenew` and `renewTimeBeforeTokenExpiresInSeconds` settings from the application config.


---

## 2. Development Support: `work-api` (`./work-api`)

**Role:** Mock backend to emulate production APIs and serve dynamic JSON schemas/data to `work-app`.
**Tech Stack:** Node.js, Express, HTTPS, JWT.
**Contracts & Data Flow:**
- **Auth Interception:** Validates `Authorization: Bearer <token>`.
- **Validation Mechanics:** Decodes JWT to find `provider`. Loads corresponding public key directly from `work-auth` directory. Verifies signature and validates `issuer` matches `https://localhost:4000/{provider}`.
- **State:** Assigns `{ sub, provider }` to `req.user`.

---

## 3. Development Support: `work-auth` (`./work-auth`)

**Role:** Faux OIDC authentication provider to simulate enterprise SSO environments (OAuth/OIDC flows).
**Tech Stack:** Node.js, Express, HTTPS, RS256 JWT generation.
**Contracts & Capabilities:**
- Simulates distinct providers (e.g., `red`, `blue`, `green`), each with isolated RS256 key pairs.
- Implements standard OIDC endpoints per provider:
  - Discovery: `GET /{provider}/.well-known/openid-configuration`
  - JWKS: `GET /{provider}/.well-known/jwks.json`
  - Authorize: `GET /{provider}/authorize` (Supports `redirect_uri`, `state`, `nonce`)
  - Login/Token: `POST /{provider}/login` -> `POST /{provider}/token`
- **Output:** JWTs with `issuer: https://localhost:4000/{provider}`.

---

## 4. Future Integration: `work-db` (`./work-db`)

**Role:** Placeholder for legacy database integration (e.g., AdventureWorks).
**Strategic Intent:** Will be used in late-stage development to practice full-stack data ingestion and prove the platform's viability against real-world legacy schemas.

---

## Development Standards
- **HTTPS Enforcement:** Both `work-api` and `work-auth` enforce HTTPS locally to mirror enterprise deployment constraints. Ensure local certs are trusted.
- **Modularity:** Strict separation of concerns. `work-app` must never reference mock logic; it must operate purely on network contracts.
- **RxJS Standards [HIGH PRIORITY]:** Strict reactive unidirectional data flow. All data manipulation must occur within RxJS streams. The UI consumes data exclusively via Angular Signals generated using `toSignal()`. Manual `.subscribe()` is strictly forbidden unless triggering a one-off side effect with `.pipe(take(1))`. (See `work-app/GEMINI.md` for detailed rules).