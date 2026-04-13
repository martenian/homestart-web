# HomeStart — codebase summary & Plaid production checklist

Internal reference: grounded in the iOS repo as of documentation authoring. Update when the app changes materially.

---

## Step 1 — Codebase analysis

### Core purpose

HomeStart is a **first-time / early-stage homebuyer preparation** app: savings toward purchase, **cash-to-close planning** (down payment, closing, reserves, moving), **affordability-style signals** (e.g. estimated housing payment, DTI-style ratio from user-entered income/debts), and a **guided roadmap** with milestones and learning—not mortgage underwriting or home listings.

### Target user

People **planning to buy a home** who want structure, education, and a realistic savings picture over time (often first-time buyers).

### Main features & flows (from code)

| Area | Behavior |
|------|----------|
| **Auth** | Firebase Auth; email/password; Google Sign-In; Facebook Login; optional biometric lock (`LocalAuthentication`) after sign-in. |
| **Onboarding** | `PlanningOnboardingView` → `PlanningProfile` before main dashboard. |
| **Dashboard** | `ContentView`: tabs for Roadmap, Numbers snapshot, Plan, Accounts, Guidance/next steps; sheets for full planner and accounts manager. |
| **Planner** | `SavingsPlanConfigurationView` + `HomePlanViewModel`: target price or budget-led mode, down payment %, mortgage rate/term, taxes/insurance, closing cost rate, reserve months, moving budget, income/debt modes, credit/doc readiness, market discovery, PMI estimate when down &lt; 20%. |
| **Accounts** | `LinkedAccountsView` / `LinkedAccountsViewModel`: Plaid-linked institutions + **manual funding sources**; **home fund allocation** (down payment, closing, reserves, general savings, split %). Totals feed `HomePlanViewModel.totalSaved`. |
| **Roadmap** | `HomeBuyingRoadmapView`, `RoadmapStageDetailView`, `RoadmapLessonDetailView`; `RoadmapInputFocus` opens focused planner modules. |
| **Rates context** | `ExploreMortgageRatesView` + `FredMortgageRateService` (optional `FredAPIKey`). |
| **Guidance** | `GuidanceService` schedules local notifications from dashboard snapshot context. |

### How Plaid is integrated

1. User must be **signed in** (Firebase).
2. iOS **`PlaidService`** POSTs to Firebase Cloud Functions (`https://us-central1-homestart-73bf3.cloudfunctions.net`) with **`Authorization: Bearer <Firebase ID token>`**:
   - `createLinkToken` → `linkToken`
   - `exchangePublicToken` with `public_token` after Link success
   - `refreshInstitutionData` with `institutionId` for balance refresh
3. **`PlaidLinkManager`** uses **LinkKit** (`Plaid.create`) with that link token; on success calls exchange and persists data via **`FirestoreDataService`**.
4. **Firestore path:** `users/{userID}/institutions/{connectionId}` with institution metadata and `item_id`; subcollection **`accounts`** with account fields and **`balances`** subcollection (timestamped balance docs).

### How user financial data is handled (code-level)

- **Planning numbers** (income, debts, home assumptions, etc.) → **`SavingsPlan`** in Firestore (`planning/currentPlan` pattern in `FirestoreDataService`).
- **Planning profile** → `planning/profile`.
- **Linked/manual institutions & accounts** → `users/{uid}/institutions/...` as above.
- **Plaid access tokens**: institution doc fields `access_token` / legacy `accessToken` are **read** by `fetchAccessToken` for refresh flows; **confirm where tokens are written** (likely Cloud Function on exchange—not visible in this client repo).
- **Biometrics**: preference in **UserDefaults**; gate in `RootView` when enabled.

### Firebase / backend usage

- **Firebase Auth** (identity).
- **Cloud Firestore** (user, plan, institutions, accounts, balances).
- **Cloud Functions** (Plaid link token, public token exchange, refresh)—base URL embedded in `PlaidService`.

### Terminology & labels (in-app)

- “**Home fund**,” “**Linked home fund**,” “**Link accounts**,” “**Manage home fund**”
- “**Down payment**,” “**Closing**,” “**Reserve**,” “**General**” (allocation filters)
- “**Cash-to-close**,” “**Total cash target**,” “**Institutions**”
- Roadmap stages: foundation, know your numbers, qualification prep, etc. (see `RoadmapModels` / views)
- Plaid UI button legacy text: “**Link Bank Account**” (`PlaidLinkView`)

### Trust / security elements already in app

- Firebase Authentication + optional **biometric lock**.
- Plaid **Link** (standard consumer flow, not custom credential forms in app for bank passwords).
- **Delete institution** / account flows in linked accounts UI.
- User-facing **error messages** from failed loads (`LinkedAccountsViewModel.errorMessage`).
- **No** in-repo public marketing site until `website/` was added.

---

## Step 2 — Plaid production readiness

### Already covered (in product or new site)

| Expectation | Where |
|-------------|--------|
| Legitimate consumer use case (financial planning, not lending) | App + marketing copy |
| Clear explanation of **why** linking exists | `why-link-accounts/`, FAQ |
| Optional linking + manual alternative | App + site |
| Published **Privacy Policy** & **Terms** (drafts) | `website/` |
| **Security** narrative | `security-overview/`, `security-privacy/` |
| **Contact / support** path | `contact/` (after placeholders filled) |
| Technical accuracy (Plaid + Firebase + Firestore) | `CODEBASE_AND_PLAID_REVIEW.md`, `why-link-accounts` |

### Partially covered — finish before / during Plaid review

| Gap | Action |
|-----|--------|
| **Company identity** on site | Replace `site.json` placeholders (legal name, address, domain, email). |
| **Privacy Policy** precision | Counsel review; align Plaid data categories with **actual** Plaid products & webhooks. |
| **Token storage** wording | Confirm Cloud Function + Firestore encryption and document accurately. |
| **Disconnect / item removal** | If not fully implemented, either implement server-side Plaid `/item/remove` + UI or describe honest limitations. |
| **Support SLA** | Real mailbox + response-time commitment on Contact page. |
| **Firestore security rules** | Have rules audited; Plaid may not ask, but supports “security practices.” |
| **App Store listing** | Should mirror site claims (screenshots, description, privacy policy URL). |

### Missing — must add (typical Plaid / compliance expectations)

| Item | Notes |
|------|--------|
| **Live, stable marketing URL** | Deploy `website/` to Cloudflare Pages (or similar) and use custom domain. |
| **Privacy Policy URL** in **App Store Connect** & Plaid dashboard | Must match deployed page. |
| **Legal review** | Privacy Policy, Terms, DPA/sub-processors list (Google, Plaid, Meta, etc.). |
| **Data retention & deletion** | Written policy + engineering workflow (account deletion scrubbing Firestore + Plaid items). |
| **Incident response** | Internal runbook; optional public security contact. |
| **Plaid Link customization** | Ensure `products` and OAuth redirect URIs match Plaid dashboard configuration for production. |

---

## Related files in repo

- iOS (**[homestart-ios](https://github.com/martenian/homestart-ios)**): `HomeStartApp/Services/PlaidService.swift`, `PlaidLinkManager.swift`, `FirestoreDataService.swift`, `AuthService.swift`, `Views/LinkedAccountsViews/`, `ContentView.swift` (paths are under the Xcode target folder `HomeStartApp/`)
- Marketing site: this repo (`src/`)
