# Trokaí Monorepo

Unified [Nx](https://nx.dev) workspace for the Trokaí frontend, merging the two
previously separate repositories into one:

| App | Was | Now | Type |
|-----|-----|-----|------|
| **Web** (`apps/web`) | `trokai-web` | Angular 21 + SSR (Express) | Server-Side Rendered site (SEO) |
| **Mobile** (`apps/app`) | `trokai-mobile` | Angular 21 + Ionic 8 + Capacitor 7 | Static SPA wrapped natively (iOS/Android) |

Shared code lives in `libs/shared/*` and is consumed by **both** apps.

---

## Why this migration

The web and mobile apps had independently re-implemented the same domain models,
services, and UI (often with drifting styles and duplicated components). They were
also on **different Angular majors** (web 21, app 18). Unifying them into one Nx
workspace lets us:

- run a single Angular version (21) and one dependency tree,
- share models, services, navigation logic, and UI components once,
- standardize on a single **design-token + Angular Material 3** styling system,
- keep **routing and platform concerns strictly separate** while sharing business logic.

---

## What changed in the migration

- **Single Angular 21 workspace.** The mobile app was upgraded **18 → 21**; the web
  was already on 21. Both build under Nx with the `@angular/build:application` executor.
- **Both apps are 100% standalone** — zero `NgModule`s. The web's `MaterialModule`
  barrel was replaced by **per-component Material imports**; the app's `MaskModule`
  was dropped (its directive was already standalone).
- **Shared design system** in `libs/shared/styles`: an **Angular Material 3 (M3)**
  theme generated from the brand colors, plus semantic CSS **design tokens**
  (`--color-*`, `--space-*`, …) that bridge to Material's `--mat-sys-*` system vars
  with brand-hex fallbacks. Native **Flexbox/Grid** utilities replace Bootstrap.
- **Shared UI** in `libs/shared/ui`: pilot component **`tk-status-pill`** (token-driven,
  no hardcoded hex) now powers product-status and seller-status pills in **both** apps,
  eliminating duplicated `.product-bullet-status` styles (and a `#6b6b6b` color drift).
- **Shared core** in `libs/shared/core`: an agnostic **`NavigationManager`** abstract
  class with platform implementations — `WebNavigationManager` (Angular Router) and
  `MobileNavigationManager` (Ionic `NavController` + Capacitor hardware back). Business
  logic injects `NavigationManager` and never touches `Router`/`NavController` directly.
- **Native configs preserved.** The mobile app's `android/` and `ios/` projects were
  carried over verbatim (versions, `applicationId`, signing, `google-services.json`,
  `GoogleService-Info.plist`, icons, splash, `Info.plist`, `AndroidManifest.xml`) —
  only regenerable build artifacts (`.gradle`, `build/`, `Pods/`) were excluded.

---

## Workspace structure

```
trokai-frontend/
├── apps/
│   ├── web/                      # Angular 21 SSR site
│   │   ├── src/                  # app code (prefix: app-)
│   │   ├── server.ts             # Express + CommonEngine SSR entry
│   │   └── src/app/core/         # WebNavigationManager
│   └── app/                      # Ionic + Capacitor SPA
│       ├── src/                  # app code (prefix: app-)
│       ├── src/app/core/         # MobileNavigationManager
│       ├── android/ • ios/       # native projects (configs preserved)
│       └── capacitor.config.json # webDir -> ../../dist/apps/app/browser
└── libs/shared/
    ├── styles/                   # @trokai/shared-styles — M3 theme + design tokens (SCSS)
    ├── ui/                       # @trokai/shared-ui — shared components (tk-status-pill, …)
    ├── core/                     # @trokai/shared-core — NavigationManager, StorageService/MediaService/FeedbackService ports, models (items-map/home-payload), format utils, APP_CONFIG (auth TBD)
    └── data-access/              # @trokai/shared-data-access — HTTP/state services (bank, notifications, favorites, messages, orders, product, catalog)
```

Import paths: `@trokai/shared-ui`, `@trokai/shared-core`, `@trokai/shared-data-access`.
SCSS is resolved via `stylePreprocessorOptions.includePaths: ["libs/shared/styles"]`,
so `@use 'tokens'` / `@use 'theme'` work from either app.

---

## Prerequisites

- **Node 22+** and **npm 11+**
- `npm install` at the repo root (single dependency tree)
- For native mobile builds: **Xcode** (iOS) and/or **Android Studio**, plus the
  Capacitor CLI (`npx cap …`)

```bash
npm install
```

---

## Running locally (development)

```bash
# Web (SSR dev server) — http://localhost:4200
npx nx serve web

# Mobile app (SPA dev server in the browser) — http://localhost:4200
npx nx serve app
```

> Run one at a time, or pass `--port` to run both. Use `nx run-many -t serve -p web app` to start both.

---

## Building

```bash
npx nx build web      # production SSR build  -> dist/apps/web/{browser,server}
npx nx build app      # production SPA build  -> dist/apps/app/browser
```

Dev/un-optimized builds: append `--configuration=development`.

---

## Web — run SSR & deploy

The web build emits a Node SSR server at `dist/apps/web/server/server.mjs`
(Express + Angular `CommonEngine`).

```bash
npx nx build web
PORT=4000 node dist/apps/web/server/server.mjs
```

> **Note:** the SSR server restricts `allowedHosts` to the production domains
> (`trokai.com.br`, `www.trokai.com.br`, …) in `apps/web/server.ts`. A request with a
> `localhost` Host returns 500 by design — test locally with
> `curl -H "Host: www.trokai.com.br" http://localhost:4000/` or add `localhost` to the
> `allowedHosts` list while developing.

**Deploy** (same model as before — Docker image run on EC2/k8s, built in CI):

```dockerfile
# Dockerfile (build context = repo root after `nx build web`)
FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY dist/apps/web ./dist/apps/web
EXPOSE 4000
CMD ["node", "./dist/apps/web/server/server.mjs"]
```

The k8s manifest / `docker-compose` from the old `trokai-web` repo still apply — only
the server path changes from `dist/trokai-web/server/server.mjs` to
`dist/apps/web/server/server.mjs`.

---

## Mobile app — build & deploy (Capacitor)

```bash
# 1. Build the web assets
npx nx build app

# 2. Sync them into the native projects (webDir already points at dist/apps/app/browser)
cd apps/app
npx cap sync            # or: npx cap copy

# 3. Open the native IDE and archive/run as usual
npx cap open ios        # Xcode
npx cap open android    # Android Studio
```

App identity is preserved in the native projects:
`applicationId com.trokai.mobile`, `versionName 2.10.5` / `versionCode 100`
(`apps/app/android/app/build.gradle` + `apps/app/ios/App/App/Info.plist`).
Bump versions there before release. Firebase/Google configs and all icons/splash
assets are already in place.

> If a native project ever needs regenerating, **do not** delete `android/`/`ios/`
> blindly — they hold signing and config. Prefer `npx cap sync`.

---

## Shared libraries — how to use

**Design tokens** (any component, no import needed — they're global CSS custom props):

```scss
.thing { color: var(--color-primary); padding: var(--space-16); }
```

**Status pill** (`@trokai/shared-ui`):

```ts
import { StatusPillComponent } from '@trokai/shared-ui';
// @Component({ imports: [StatusPillComponent] })
```
```html
<tk-status-pill variant="success" label="Vendido" position="overlay" />
<tk-status-pill variant="accent" [outline]="true" label="Armário de férias" />
```

**Navigation** (`@trokai/shared-core`) — inject the abstraction, not `Router`/`NavController`:

```ts
constructor(private nav: NavigationManager) {}
go() { this.nav.forward(['/items', id]); }
```

---

## Model Architecture & Type System

Domain models live in `@trokai/shared-core`; request/response models specific to data services live in `@trokai/shared-data-access`. Apps never define their own domain types.

```
@trokai/shared-core      ← enums, domain classes (Clothes, User, Order, Collection, …)
@trokai/shared-data-access ← service-level models (Message, Chat, CheckoutResponse, …)
apps/web, apps/app       ← consume both; define nothing domain-specific
```

### Instantiating from API responses

All domain classes accept `Partial<T>` in their constructor via `Object.assign`, so you instantiate directly from the raw HTTP response:

```ts
// service
const data = await this.http.get<Partial<Order>>(`/payments/orders/${id}`).toPromise();
return new Order(data);

// component receives a typed Order, not a plain object
const order: Order = await this.ordersService.fetchOrder(id);
```

Same pattern for `Clothes`, `Collection`, `Message`:

```ts
new Clothes(apiResponse)
new Collection(apiResponse)
new Message(apiResponse)
```

### Enum-based status checks

Never compare raw numbers — use the named enum:

```ts
import { ClothesStatus, OrderStatus } from '@trokai/shared-core';

// ✅
if (clothes.status === ClothesStatus.PUBLISHED) { ... }
if (order.status === OrderStatus.WAITING_SHIPMENT) { ... }

// ❌ — fragile, unreadable
if (clothes.status === 1) { ... }
```

### Getter pattern — logic in models, not components

Models expose computed display values as getters. Components call the getter; they never re-implement the logic:

```ts
// Clothes
clothes.statusFormatted   // 'Em análise' | 'Vendido' | 'Reservado' | …
clothes.published         // boolean
clothes.mainImage         // first image md URL
clothes.thumbnailUrl      // first image sm URL

// Order
order.shippingStatus      // 'Aguardando envio' | 'Em transporte' | 'Entregue' | …
order.postageLabelStatus  // PostageLabelStatus enum value
order.isShipping          // boolean
order.deliveryEstimate    // Date | undefined

// User
user.displayAvatar        // avatar ?? googleAvatar ?? undefined
user.displayName          // storeName || name
user.isSeller()           // boolean
user.accountCompletion()  // { address, personalInfo, sellerInfo, … }

// Message (shared-data-access)
message.timeFormatted     // 'HH:MM'
message.dayLabel          // 'Hoje' | 'Ontem' | 'Segunda-Feira' | 'DD/MM/YYYY'
```

**Before** (logic duplicated in component):
```ts
// ❌ component method operating on any
getMessageTime(item: any): string {
  const time = new Date(item.createdAt);
  return `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}`;
}
```

**After** (getter on the model, component is a one-liner):
```ts
// ✅ model carries the logic
getMessageTime(item: Message): string {
  return item.timeFormatted;
}
```

### `ChatEntry` — typed union for chat bubbles

The chat thread renders two kinds of entries: message bubbles and day-dividers. Both are covered by the `ChatEntry` union exported from `@trokai/shared-data-access`:

```ts
import { ChatEntry, ChatTimeDivider, Message } from '@trokai/shared-data-access';

messages: ChatEntry[] = [];

// type-narrow before rendering
function isTimeDivider(e: ChatEntry): e is ChatTimeDivider {
  return (e as ChatTimeDivider).timeDiff === true;
}
```

### `UserReview` and `Collection`

```ts
import { UserReview, Collection } from '@trokai/shared-core';

// User.reviews is UserReview[] — no more any[]
const reviews: UserReview[] = user.reviews ?? [];

// Collection wraps a Clothes[] with slug/name
const col = new Collection(apiResponse);
col.clothes.forEach(c => console.log(c.mainImage));
```

---

## Conventions

- **Standalone everywhere** — no `NgModule`s. Import only what a component uses
  (Material modules included — no barrel modules).
- **Style via tokens** — use `var(--color-*)` / `var(--space-*)`, never hardcoded hex.
  Layout via the native Flexbox/Grid utilities in `libs/shared/styles`.
- **Routing stays per-platform**; only imperative navigation is shared via
  `NavigationManager`. Before: `this.router.navigate(...)` / `this.navCtrl.navigateForward(...)`;
  after (both apps): `this.nav.forward([...])`.
- **Persistent storage via `StorageService`** (`@trokai/shared-core`) — one async `get/set/remove/clear`
  (+ `getObject`/`setObject`/`has`) abstraction; impls `{ provide: StorageService, useClass: WebStorageService
  | MobileStorageService }` (web = SSR-safe `localStorage` via BrowserRef, app = Capacitor `Preferences`).
  Components/services never touch `localStorage`/`Preferences` directly. Replaced the old per-feature
  `BuyingStorage`/`PhoneVerifyPlatform`. Sync-only web exceptions (async contract can't cover them): the HTTP
  interceptor/guard session check (`AuthService.checkStorageSession`), the GTM consent getter, the debug `logger`.
- **Shared-symbol imports**: extracted **models / enums / utils** are imported **directly**
  from `@trokai/shared-core` by every consumer — never re-exported through an app file (no
  `export { X } from '@trokai/shared-core'` passthrough). Exception: data-access **service
  classes** keep a thin local re-export (`export { BankService } from '@trokai/shared-data-access'`)
  so the service stays importable at its original app path with zero consumer churn.
- **Module boundaries**: shared libs must not import from `apps/*` (enforce via
  `nx lint` tags as the libs grow).

---

## Roadmap (incremental, intentionally not big-bang)

These are deferred on purpose — each is best done per-page with visual QA rather than
in one risky sweep:

- [x] **Remove Bootstrap from web** — done. The `bootstrap` dependency + `@import` are gone;
      `libs/shared/styles/_bootstrap-compat.scss` reimplements the grid (`container/row/col-*`)
      and the utility class names the templates actually use (`d-flex`, `justify-content-*`,
      spacing, `w-*`, …) as native Flexbox/Grid — zero per-template churn. New code should prefer
      the cleaner `_layout.scss`/`_spacing.scss` utilities; migrate templates off the shim over time.
- [x] **Switch web Material from M2 → M3** — done. `styles/trokai-material.scss` now does
      `@use 'theme'; html { @include theme.trokai-theme(); }` (shared M3 theme from brand palettes),
      replacing the legacy M2 `m2-define-*` palettes; component overrides (mdc-button/dialog/checkbox)
      retained. Visually QA the Material-heavy screens (forms, dialogs, buttons).
- [x] **Status-pill rollout** — done. `.product-bullet-status` / `.bullet-product` / `bullet-paused`
      eliminated across product page, product card, wardrobe, and `item-viewer`; attribute chips
      now render via `tk-status-pill` + the `itemName` pipe. Only the dead global `.bullet-product`
      SCSS rule remains (safe to delete).
- [x] **Extract shared services** into `libs/shared/data-access` — bank, notifications, favorites,
      messages, orders, product, catalog, user unified (web-canonical Promise contracts); both apps'
      local service files are thin re-exports. `itemsMap` name lookups centralized in `CatalogService`
      + `ItemNamePipe`; identity/auth coupling routed through `NavigationManager`
      (`ensureAuthenticated`/`isAuthenticated`/`currentUserId`).
      `UserService` holds **user-resource HTTP only** (getUserInfo/updateUser/uploadAvatar/userHasPassword/
      emailRegistered/phoneRegistered/register/deleteAccount/getUserReviews/verifyEmail/unsubscribeEmailMarketing,
      no state). Each app's **AuthService** keeps credentials/OAuth/native/session and only retains the
      user-data methods that **orchestrate session state** — `register`/`updateUser`/`uploadAvatar`/`deleteAccount`
      (session write-back via `syncUserData`/`syncAvatar`/`setUserSession`) and `userHasPassword` (memoizes on
      `auth.hasPassword`, reset on logout). **Pure forwarders were dropped** — consumers inject `UserService`
      and call it directly (emailRegistered, phoneRegistered, verifyEmail, getUserReviews, getUserInfo,
      unsubscribeEmailMarketing). App auth methods moved Observable→Promise (canonical); consumers dropped
      their `.toPromise()`. Auth services' own HTTP is now just login/google/apple/sync. (Fixed a latent app
      bug: `AuthResponseData.token` was typed as a JWT string literal → `string`.)
- [x] **Extract shared UI services** into `libs/shared/ui` — `LoadingService` + `AlertService`
      unified (web Material canonical; app Ionic `LoadingController`/`ModalController` dropped).
      Their rendered dialogs moved to shared-ui as `tk-dialog-loading` / `tk-dialog-alert`; app's
      Ionic `AskQuestionComponent`/`SuccessModalComponent` deleted (their methods — `showAlert`/
      `showPromisedAlert`/`askQuestion`/`showSuccess` — redone on `AlertService` over `DialogAlert`).
      Both apps' local `loading.service.ts`/`alert.service.ts` deleted; **consumers import from
      `@trokai/shared-ui` directly** (no re-export passthrough). App `main.ts` gained
      `provideAnimationsAsync()` (Material dialogs/snackbar need it; was Ionic-only).
      Deferred: `DialogService` (web-only) → shared-ui. Now UNBLOCKED on buying (done below), but its 10
      rendered dialogs still pull a web-only cascade: `UserAvatarComponent` (app-wide), `MarketingService`,
      `GlobalService`, `BrowserRef`, plus leaf `CostPipe`/`ReviewStarsStars`/`ShortDatePipe`/
      `HideLoadingImageDirective`. Move those (UI primitives → shared-ui, services → shared with
      abstractions like the buying layer) first, then relocate the dialogs + `DialogService`.
      (`CompletingInformationService` + `phone-verify-dialog` already shared — see below.)
- [x] **Unify `BuyingService` + checkout models** into `libs/shared/data-access` (`buying/`), web-canonical.
      Models (`UserFee`/`Installment`/`CheckoutLocal`/`CheckoutValues`/`CheckoutResponse`/`Coupon`/`Basket`/
      `BuyingPayload`/`Pix`/enums) lifted web-canonical: dropped app's unused `Installment.buyerFinalCost`
      (→ `buyerCost`), app's `CheckoutLocal` PIX-default + `shippingAddress`; `Coupon.sellerUser` kept.
      Service platform-coupling inverted behind injected abstractions: `CheckoutNavigator` (web Router
      multi-step / app single `/buying/checkout` page), `BuyingStorage` (web localStorage via `BrowserRef`
      / app Capacitor `Preferences`, async), `CheckoutAnalytics` (web GTM / app no-op), and
      `NavigationManager` gained `currentUser()`/`syncUserData()`. `SearchService.getUserInfo(id)` →
      `UserService.getUserById`; `GlobalService.joinWithCommasAnd` → shared-core util; alert/loading via
      `@trokai/shared-ui`. Both apps' `buying.service.ts` deleted; **consumers import from
      `@trokai/shared-data-access` directly**. App call sites fixed: `buy(payload)` → `buy()` (payload built
      in-service), `createCard/deleteCard().toPromise()` → `await` (Promise canonical). BREAKING (QA the
      money path): app checkout now uses web's multi-step `navigateCheckout` flow (mapped to its single
      page) and persists `last_checkout`.
- [x] **Unify `CompletingInformationService`** into `libs/shared/data-access` (`completing/`), same model as
      buying. Orchestration shared (action state, `StorageService` persistence + `restoreAction`, purchase/sell
      dispatch, `next`/`reset`, `verifyUserStatus`/`sendVerifyEmail`/`openSellerAccount` HTTP); auth via
      `NavigationManager.ensureAuthenticated`, loading via `@trokai/shared-ui`, purchase via shared
      `BuyingService.openCheckout`. **Only navigation specialized** behind injected `CompletingNavigator`
      (`gate(action)` runs the platform completion gates + redirects + feedback, `toSellRegister`,
      `resetSellDraft`) — `WebCompletingNavigator` (Router routes + `?completing` query params, Material alerts,
      `minClothesToSell` PENDING_REVIEW gate) / `MobileCompletingNavigator` (app routes, toasts, Ionic register
      + tutorial). Status source unified web-canonical on `User.accountCompletion()`. Both apps'
      `completing-information.service.ts` are thin re-exports (consumers unchanged); each app provides the
      navigator in `app.config`/`main.ts`. Dropped dead `mayQuestionOrAnswer` (app, no callers). BREAKING (app):
      status now client-derived (`accountCompletion()`) not server `verify-status`; gates now run
      `ensureAuthenticated` (may prompt login) + persist/reset the action.
- [x] **Extract remaining shared models** into `libs/shared/core` (reconcile app/web `user`,
      `clothes`, `order`, … into one canonical type). Done: `items-map`, `home-payload`, format utils,
      `search-filters` (`Filters` unified web-canonical superset; `notNullOrEmpty`/`parseMultipleChoiceParam`
      moved to shared-core `utils/params`), `geolocation` (`RespostaCep`/`SearchLocation` — identical),
      `completing-information` enums (`NegotiationType`/`ShoppingFrom`/`PhoneOtpMethod` — identical),
      `FaqData`, `PictureTip`, `NotificationDisplay` (all identical).
      Consumers import these from `@trokai/shared-core` directly — no app-level re-export passthrough.
      `PictureSlot` deferred (depends on `CropState`/`SafeUrl`).
      Done: checkout/payment models — unified web-canonical into `shared-data-access` `buying/` (see the
      BuyingService item above). `CompletingType` now identical app/web (BRECHO removed) → shared-core.
- [x] **No models inside service files** — swept every model out of `*.service.ts` into dedicated files,
      all shared, grouped by domain. **data-access**: each inline model → sibling `<domain>.models.ts`
      (`bank`/`messages`/`user`/`product`/`orders`/`notifications`/`buying`); barrel re-exports both, so
      consumers (who import from `@trokai/shared-data-access`) don't churn. **shared-core** `models/`: lifted
      web/app service-embedded models web-canonical — `auth` (`AppleResponse`/`AuthResponseData`(+`isRegister?`
      superset)/`AuthSessionData`), `search` (`SearchResponse`/`UserSearchResponse`/`CollectionResponse`),
      `gtm` (`GtmProductData`), `marketing` (`GenericDataRefs`), `global-params` (`GlobalParams` web superset),
      `upload-picture` (`UploadPictureItem`), `navbar` (`NavbarItem` web-canonical superset, optional fields
      cover app subset; web `navbar/navbar-item.ts` deleted), `product-question` (`Question`), `CompletingType`
      → existing `completing-information`. App's duplicate `BasicModel` dropped (already in shared-core
      `basic`). All consumers import from `@trokai/shared-core` directly (no app re-export passthrough).
- [x] **Shared base auth/HTTP interceptor** — done. `BaseAuthInterceptor` (`@trokai/shared-core`,
      `http/base-auth.interceptor.ts`) owns the common pipeline: Authorization header (skip
      viacep/googleapis, per-app `authScheme` — web `Bearer `, app raw token), known error-code
      dispatch (`banned`/`token_expired`/`apple_deleted`/`apple_token`) via abstract `onErrorCode`,
      and `showError`. Both apps' interceptors now `extends BaseAuthInterceptor`. Web overrides
      `shortCircuit` (storage-session logout + in-memory GET cache), `prepare` (SSR `X-Forwarded-For`
      + `resolveImages`), `onResponse` (cache store); app adds `update_app`/`banned` Ionic routing +
      Capacitor `Network`/Toast `showError`. DI registration unchanged (`HTTP_INTERCEPTORS` useClass).
- [x] **Pending product removals** — done.
      - [x] **plans/subscriptions feature (web)** — deleted `apps/web/src/app/plans/*`,
            `services/plans.service.ts`, `models/plan.ts`; dropped the (already dead, `return;`-first)
            `DialogService.openPlansDialog()` + its `PlanDialogComponent` import, and the commented-out
            `checkPlans()` flow in `product-register` (with its `SubscriptionPlans`/`dayjs` imports).
            `User.subscription` stays loosely typed in shared-core (already decoupled).
      - [x] **verified badge + `BrechoStatus`** — removed across both apps. Dropped the
            `brechoStatus === ACCEPTED` verified-badge blocks (wardrobe, product, carts, navbar,
            user-card, reviews-dialog, profile-tab, users-list-item) + their `brechoStatus = BrechoStatus`
            fields/imports, web `AuthService.requestBrecho`, the `BrechoStatus` enum and
            `brechoStatus`/`brechoRequest` fields from shared-core `User`, the now-dead `.icon-verified`
            SCSS + `assets/icons/verified.svg`. With BrechoStatus gone, the local `CompletingType` is no
            longer pinned — pruned its `BRECHO` value, `mayRegisterBrecho()`, and the dead `brecho` branches.
- [x] **Shared UI component dedup** — lift duplicated forms, atoms, pipes & directives from both
      app trees into `libs/shared/ui/[domain]`, dropping Bootstrap/Ionic layout for native Flexbox/Grid.
      Forms standardize on **Reactive Forms + Material M3** (`mat-form-field`, `@if`-driven
      `<mat-error>`) over the shared **`TrokaiErrorStateMatcher`** (`libs/shared/ui/src/lib/forms/`,
      `providedIn:'root'`, errors on touch/dirty/submit — already landed, exported from `@trokai/shared-ui`).
      Rule: UI imports from `@trokai/shared-ui` directly; lift = bind shared component into **both** shell
      pages → verify build → delete legacy from both trees → check the box. Platform side-effects (routing,
      Capacitor, session) stay in thin per-app shell wrappers; shared form components stay dumb
      (`@Output() submitted` + `@Input() loading/serverError`). Domains (web source / app source → dest):
  - [x] **auth** *(pilot)* → `libs/shared/ui/auth` — **`login-form` ✅ lifted** (`tk-login-form`: dumb
        Reactive+M3, `@Output() submitted`/`forgotPassword`/`register`, `@Input() loading`/`serverError`,
        social buttons via `<ng-content>`; both shell pages render it — web routes, app `IonNav` push;
        loading overlay via shared `LoadingService` (web-canon, replaces app's Ionic `LoadingController`)).
        **`register-form` ✅ lifted** (`tk-register-form`: name/email/password/confirm, web-canon validators —
        name pattern + 2-word `fullName`, `passwordsMismatch` group validator; `@Input() loading/emailRegistered`,
        `@Output() submitted/emailBlur/login`; shell runs `UserService.emailRegistered` on `emailBlur` + shared
        `LoadingService`; both pages render it).
        **`recovery-email-form` / `recovery-code-form` / `new-password-form` ✅ lifted** (`tk-recovery-email-form`
        email→`submitted(email)`; `tk-recovery-code-form` 4-digit code, `@Input() autoSubmit` for mobile
        auto-verify; `tk-new-password-form` `@Input() forgot` hides current-password, `passwordsMismatch` +
        `newEqualCurrent` group validators, emits `{currentPassword?, password}`). Shells: web `password-recovery`
        drives all three via `@if` (email→code→`app-password`); web `account/password` now wraps `tk-new-password-form`
        (still reused in account settings + forgot flow); app `forgot-password-email`/`forgot-password-code`/
        `new-password` pages keep their `IonNav` + `PasswordService` orchestration.
        **`phone-verify-dialog` ✅ lifted** (`tk-phone-verify-dialog`: Material dialog, OTP send/verify +
        60s resend ticker). Injects the shared `StorageService` (resend timestamp) + `UserService`
        (`sendPhoneOtp`/`verifyPhoneOtp` — moved into data-access `UserService` as plain user HTTP, dropped
        from both apps' `CompletingInformationService`); `{phone, smsAvailable, whatsappAvailable}` passed via
        `MAT_DIALOG_DATA` from the opener; feedback via shared `AlertService`/`LoadingService`. **No per-feature
        platform abstraction** — the old `PhoneVerifyPlatform` is gone. **App now opens it via `MatDialog`**
        (was Ionic `ModalController`); both legacy dialog components deleted.
        **`google-btn` ✅ lifted** (`tk-google-btn`: dumb Material stroked button, inline multicolor Google "G"
        SVG — no asset dep; hides itself inside the Instagram in-app browser via SSR-safe `PLATFORM_ID` UA check;
        `@Output() googleClick` — OAuth stays in the shell: web `login`/`register` wire `(googleClick)` →
        `AuthService.startGoogle()`. Web-only consumer for now (app uses native Google), but lives in shared-ui;
        web `auth/google-btn` deleted).
  - [x] **billing** → `libs/shared/ui/billing` — **`payment-icon` ✅ lifted** (`tk-payment-icon`; `PaymentBrands` enum
        + `getCreditCardBrand()` moved to `@trokai/shared-core`); **`fees-calculator` ✅ lifted** (`tk-fees-calculator`:
        Material dialog, `@Inject(MAT_DIALOG_DATA)` data `{sellerFees,productCost,declaredValue}`; app swapped
        `ModalController` → `MatDialog`); **`coupon-form` ✅ lifted** (`tk-coupon-form`: web-canonical inline form,
        app checkout swapped `<app-coupon>` → `<tk-coupon-form>`); **`bank-account-form` ✅ lifted**
        (`tk-bank-account-form`: Material M3 + `MatAutocomplete` over `getBanksList()` from shared-core,
        `@Output() saved`; bank list removed from both `GlobalService`); **`withdraw` ✅ lifted** (`tk-withdraw`:
        `@Input() gatewayWithdrawFee`, `@Output() done`; embeds `tk-bank-account-form`; both app shells handle
        navigation on `(done)`); **`card-form` ✅ lifted** (`tk-card-form`: dumb Material new-card form + inline
        address form, `@Output() saved`; app `new-card.page.ts` is thin shell). Pending (dependencies not yet
        lifted): `cards-list` (no standalone component exists yet), `payment-options` (depends on
        `CheckoutTotalComponent` → `DialogService`, both pending).
  - [x] **address** → `libs/shared/ui/address` — **`tk-address-form` ✅ lifted** (Material M3 form, `HttpClient`
        ViaCEP lookup, no GeolocationService dep; `@Input() address`, `@Output() addressSave`, `validateForm()`
        public method; web `form-address` + `account/address` shell + app `address.page` all replaced);
        **`tk-shipping-address` ✅ lifted** (injects `UserService`, `NavigationManager`, `BuyingService`;
        `equalAddresses` via shared-core; web `buying/checkout/shipping-address` re-export; app shell kept
        per-app for Ionic nav); **`tk-zipcode-shipping-fee` ✅ lifted** (injects abstract `SearchLocationService`,
        web-canonical inline zip input; web `product/zipcode-shipping-fee` re-export; app `shared/zipcode-shipping-fee`
        re-export; `ChangeZipcodeComponent` superseded). `SearchLocationService` abstract added to shared-core,
        provided via `useExisting: GeolocationService` in both apps.
  - [x] **user** → `libs/shared/ui/user` — ~~user-avatar~~ (`TkUserAvatarComponent` lifted; web `modules/user-avatar` deleted,
        all 12 web + 7 app consumers migrated to `tk-user-avatar`),
        ~~user-header~~ (`tk-user-header`: `layout='row'|'card'`, `@Input() showChatButton/canOpenProfile/isLoggedUser`,
        `@Output() clicked/chatClick/sellerBadgeClick`; web `modules/user-card` + app `shared/users-list-item` deleted;
        purchase/sale/search.page migrated),
        ~~seller-status-badge~~ (`tk-seller-status-badge`: `@Input() isLoggedUser`, `@Output() badgeClick`; web
        `modules/seller-status-badge` deleted; menu-account/seller-status/wardrobe/user-card consumers migrated),
        ~~profile-form~~ (`tk-profile-form`: dumb Material+ngx-mask form, web-canonical validators — name pattern + 2-word,
        `under18`/`invalidBirth` birthday checks, CPF-focus alert via shared `AlertService`; `@Input() user/loading/
        completingInformation/emailRegistered/phoneRegistered`, `@Output() submitted/emailBlur/phoneBlur/verifyPhone`;
        both shells build `User`+`updateUser`, run the registered-email/phone checks, and open `tk-phone-verify-dialog`),
        ~~seller-profile~~ (`tk-seller-profile`: web-canonical store-profile form — storeName→nickname auto-slug, nickname
        sanitize/confirm-on-change via `AlertService.question`, bio, sale options, copy-link via CDK `Clipboard`, seller-adjust
        notice; `@Input() user/previewAvatarUrl/pictureUpdating/avatarPresent/requireAvatar/showBio/showStoreVisibility/
        sellerReviews`, platform image-picker projected via `[avatarPicker]` `<ng-content>`; web uses deferred-blob avatar
        upload + `Foto obrigatória`, app uses immediate upload + `storeVisibility` radios; both `store-options` shells render it.
        `profile-tab` is the Ionic account-menu — already on `tk-user-avatar`, no form to lift),
        ~~contact-form~~ (`tk-contact-form`: dumb Material form, `@Input() showName/showType/dismissable/email/loading/done`,
        `@Output() submitted/closed`; web `support/contact` page renders it (name+message → `GlobalService.sendContactMail`),
        app modal now a `MatDialog` `ContactFormDialogComponent` wrapper (type+message → `ContactFormService`, inline done state)),
        ~~report-user~~ (`tk-report-user`: dumb Material form + `tk-user-avatar` header + done state, `@Input() otherUser/loading/done`,
        `@Output() submitted/closed`; app `ReportUserDialogComponent` `MatDialog` wrapper opened from `chat` — old Ionic
        `ModalController` modal replaced; `ReportUserService` kept).
  - [x] **product** → `libs/shared/ui/product` — **`like-button` ✅ lifted** (`tk-like-button`: dumb,
        Material `mat-icon` `favorite`/`favorite_border` replacing both apps' `ion-icon`, tokens-only
        `--color-primary`; injects shared `FavoritesService`; click (web) + touch (mobile, tap-vs-scroll via
        `touchmove`) both handled, optimistic `lastAction` web-canonical; both apps' local `like-button` deleted,
        all 5 consumers — web product-image/products-list-item, app products-list-item/item-viewer/product.page —
        repoint to `@trokai/shared-ui`).
        **`gallery` ✅ lifted** (`tk-gallery`: web-canonical Material dialog + npm `swiper` (Navigation/Pagination/Zoom),
        `MAT_DIALOG_DATA {imageUrls, startIndex}`, tokens-only; **app now opens it via `MatDialog`** — Ionic
        `ModalController` + `swiper-container`/`IonicSlides` dropped; both apps' local `gallery` deleted; web
        product/product-image + app product.page repoint).
        **`questions-security-dialog` ✅ lifted** (`tk-questions-security-dialog`: web-canonical Material dialog,
        `mat-icon verified_user` replacing `ion-icon`, `StorageService` agree-flag, closes with `agreed` boolean +
        exports `QUESTIONS_SECURITY_DIALOG_AGREED_KEY`; **app opens via `MatDialog`** (was `ModalController`,
        `onDidDismiss().data.agreed` → `afterClosed()`); both apps' local copies deleted; web dialog.service +
        questions-page + app product.page repoint).
        **`product-image` ✅ lifted** (`tk-product-image`: desktop thumb-rail + mobile npm-`swiper` gallery, opens
        the shared `tk-gallery` via `MatDialog`; composes already-shared `tk-like-button`/`tk-status-pill`; Bootstrap
        `d-*` responsive classes rewritten as native media queries, tokens-only (`--color-gray-2`/`--color-primary`),
        dead `environment.imageURL` dropped. Web-only consumer for now — the app still renders product images inline
        in its Ionic `product.page` (`swiper-container`, no separable component) — but lives in shared-ui; web
        `product/product-image` deleted, `product.component` repoints).
        **App-only (no web pair, Ionic) — stay per-app**: `renew-product`, `required-adjusts` (wardrobe).
        **`products-list-item` ✅ lifted** (`tk-product-card`: web-canonical SSR `<a routerLink>` + `NgOptimizedImage`
        (`ngSrc`/`fill`/`priority`) preserved — the app drops Ionic `IonThumbnail`/`IonImg`/`IonSkeletonText` for the
        same `<img ngSrc fill>`, with the skeleton reproduced as a pure-CSS shimmer on the `--color-gray-2`
        image-wrapper (no perf cost). Dumb: `@Input() product/clean/canFavorite/onlyImage/useLink/priority/
        extraImgClass`, `@Output() open(Clothes)/onFinishLiking`. **Nav stays per-platform via `useLink`**: web sets
        `useLink=true` → the real crawlable anchor navigates (SSR/SEO/LCP intact); app sets `[useLink]="false"` and
        handles `(open)` → tab-relative `NavController.navigateForward` (a static routerLink can't express the app's
        `/main/<tab>/product/:id`). `myProduct` via `NavigationManager.currentUserId()`, size/link via shared
        `ProductService` (`getSizeName`/`mountProductLink`), status superset web-canonical. All 5 web + 5 app consumers
        repoint; both apps' local `products-list-item` (+ the app `console.log`) deleted. The two
        `products-horizontal-list` wrappers **stay per-app** (web responsive grid vs app horizontal-scroll +
        infinite-scroll + skeleton cards) — both now render `tk-product-card`. ⚠️ **Visual QA**: app card inside the
        Ionic lists (grid sizing, `only-image` 42vw strip on product page, shimmer-then-image) + web LCP unchanged.
        **`product-questions` — app reworked to the web canon** (not a shared dedup — stays per-platform, but the app
        now mirrors web's UX instead of its old full-screen Q&A modal): a **read-only list** inline on the product page
        (all questions, the `.slice(0, 2)` preview trimming dropped; rows navigate to a question page, `Fazer pergunta`
        for buyers) + a dedicated **question page** (`apps/app/.../product/questions-page`, Ionic chrome + web-canon
        Material answer/ask form) wired as child routes `product/:product_id/question[/:question_id]` (app
        `product.routes`; `home.routes` switched its product entries to `loadChildren` for consistency;
        `MainService.navigateToQuestion`). Both ask/answer go through the shared `ProductService.askQuestion`/
        `answerQuestion`; the security dialog (`TkQuestionsSecurityDialog`) now gates on the question page. App's old
        `product-questions` modal component + `product-questions.service` deleted.
        **`form-images` ✅ lifted** (`tk-form-images`: reorderable 6-slot grid of `tk-image-picker`s + drag-drop,
        web-canonical `PictureSlot` state; the "add photos" entry is capability-driven via the injected
        `MediaService` — native shows a Material camera/gallery `MatMenu` (replacing app's Ionic `ActionSheet` +
        `openCameraPreview`/`pickMultipleFromGallery`), web falls through to a multi-file `<input>` + `processFile`;
        `mat-icon` over both apps' `ion-icon`, token-based grid. `@Input() inputImages/disabled`,
        `@Output() onOutputImages/helpRequested`. Web `product-register` shell opens `PicturesHelpDialog` on
        `(helpRequested)`; app `FormImagesPage` is now a thin Ionic shell keeping its route deactivate-guard +
        swipe-gesture + `TutorialService.productRegisterTutorial`. Both apps' local `form-images` UI + specs deleted).
        **`product-register-form` ✅ lifted** (`tk-product-register-form`: web-canonical Reactive Forms + Material
        flat layout — replaces the app's template-driven Ionic accordion. Dumb component: `@Input() itemsMap/params/
        brands/product/initialImages/duplicating/editingId/waitingAdjustment/adjusts/adjustsNote/loading`,
        `@Output() submitted({clothes,images})/helpRequested`. Embeds `tk-form-images` + `tk-autocomplete`; live
        seller-fee calc via the shared `ProductService.getSellerFees` (identical `payments/seller-fees` HTTP moved
        out of both apps' `InventoryService`); opens `tk-fees-calculator` itself via `MatDialog`. All platform
        orchestration stays in thin shells: web keeps `GlobalService` subs + `CompletingInformationService` gate +
        `ProductService.fetchProduct` for edit + `InventoryService` upload/duplicate + `PicturesHelpDialog` on
        `(helpRequested)`; app keeps the Ionic toolbar/`IonContent` + deactivate guard + swipe-gesture + Firebase
        logs + `Network` connectivity check + `LoadingController` + `InventoryService` (item pre-loaded by wardrobe).
        Both apps' product-register form logic/templates deleted; app's dead `wardrobe/fees-calculator` removed.
        BREAKING (app): the accordion/section-validity UX + per-section toasts are gone — single Material form, errors
        via shared `AlertService`. ⚠️ **Needs visual QA on both** — app form inside `IonContent` (scroll/keyboard) +
        web edit/duplicate/waiting-adjustment paths. App's inline `app-autocomplete` stays (bank-account-form shell
        still uses it).)
  - [x] **reviews** → `libs/shared/ui/reviews` — **`review-stars` ✅ lifted** (`tk-review-stars`: dumb
        Material `mat-icon` `star`/`star_half`/`star_border` over the `--color-star-full`/`--color-star-empty`
        tokens, replacing both apps' SVG-asset stars + app's `ion-icon`; primitive `@Input() stars/amount/
        showAmount/clickable` + `@Output() clicked`. Folds web's two-layer `review-stars` + `review-stars-stars`
        and app's `review-stars` into one — the dialog/modal open is now a shell concern: web consumers (wardrobe,
        carts, product, seller-status) inject `DialogService.openUserReviews`; app `wardrobe.page` opens the Ionic
        `ReviewsListComponent` modal on `(clicked)`. Pure-renderer web usages (home, `review-comment`,
        `user-reviews-dialog`) pass `[showAmount]="false"`. Both apps' local `review-stars`(+`review-stars-stars`)
        + the `assets/review-stars/*.svg` deleted; all consumers repoint to `@trokai/shared-ui`).
        **`review-card` ✅ lifted** (`tk-review-card`: web-canonical row — `tk-user-avatar` + name + date +
        `tk-review-stars` + comment, `@Input() review: ReviewModel`. App adapted to the canon (its reduced
        name/stars/comment card + first-word `madeByName` truncation dropped — the `/users/:id/reviews` payload
        already carries `madeByUser`/`createdAt`, same as web). Layout via the shared `@trokai/shared-styles`
        utilities (`.flex`/`.gap-*`/`.label-*`), now loaded in **both** apps' global stylesheets (web
        `styles.scss` + app `global.scss` `@use 'index'`) so shared-ui renders identically on web/app. Web
        `review-comment` + app `review-card` deleted; web `user-reviews-dialog` + app `reviews-list` repoint;
        dead imports dropped from app `purchase`/`sale` pages).
        **`reviews-list` ✅ lifted** (`tk-reviews-list`: dumb shared *content* — user header (avatar +
        storeName/name + average + `tk-review-stars` + count) + `tk-review-card` list + empty state,
        `@Input() user/reviews`, shared-utility layout. The platform chrome stays as thin per-app shells:
        web `user-reviews-dialog` keeps the `MatDialog` close button + self-fetch/sort and renders
        `<tk-reviews-list>`; app `reviews-list` keeps the Ionic toolbar/back-button and renders it. App
        adapted to the canon — `wardrobe.page` now passes `owner` so the app modal shows the same rich
        header (previously title-only)).
        **`rating-form` ✅ lifted** (`tk-rating-form`: web-canonical Material form — `tk-user-avatar` + dynamic
        "Como foi a {compra|venda}?" + relationship subtitle + clickable 1–5 `mat-icon` stars (star tokens) +
        Material comment textarea + submit. Self-sufficient: injects shared `OrdersService` and calls
        `reviewOrder`, `@Input() order/otherUser/isSale`, `@Output() reviewed/closed`. Both shells stay thin —
        web `rating-modal` keeps `MatDialog` + computes `isSale`; app `negotiation-review` keeps the Ionic modal
        (its `LoadingController`/`ion-textarea`/`ion-icon` stars + the dead `done` success state dropped). App
        adapted to the canon: Material textarea/stars, loading via the button's disabled state).
  - [x] **chat** → `libs/shared/ui/chat` — **`chat-thread` ✅ lifted** (`tk-chat-thread`: the message
        list + composer for a negotiation. Owns all messaging — 5s polling `fetchMessages`, `sendMessage`,
        day-divider/time formatting, optimistic `addMessage`, auto-scroll — over the shared `MessagesService`
        and a **new abstract `ConnectivityService`** (shared-core `network/`; web provides `useExisting: BrowserRef`,
        app `useExisting: NetworkService` — both already expose `connected$`). Web-canonical Material composer
        (`mat-icon arrow_upward` + `matInput` textarea) over both apps' divergent inputs (web `mat-form-field` /
        app Ionic `ion-textarea`+`ion-footer`), token-based bubbles, self-scrolling `.chat-grid` (no `IonContent`
        dependency). `@Input() user/otherUser/negotiationId/negotiationType/enabled`. Platform chrome stays in thin
        shells: web `ChatComponent` keeps route parsing + order fetch/forbidden-status guard + `openOrder` and frames
        it in a `#chat-wrapper`; app `ChatComponent` keeps the Ionic modal toolbar/back-button + options→
        `ReportUserDialog` action sheet and hosts it in `ion-content`. Both apps' message logic + bubble SCSS deleted.
        ⚠️ **App-modal layout needs visual QA** — the thread fills `ion-content::part(scroll)` as a flex column;
        confirm scroll + keyboard-avoidance on device.)
        **`chat-list` stays web-only** (no app pair — the app surfaces chats elsewhere; relocate-only, like `google-btn`).
  - [x] **media** → `libs/shared/ui/media` —
        **`image-cropper` ✅ lifted** (`tk-image-cropper`: web-canonical Material dialog over `ngx-image-cropper`,
        `MAT_DIALOG_DATA {profile, imageBlob, cropState?}` → closes `{croppedImage, cropState}`; `mat-icon` footer
        (`add`/`remove`/`refresh`) replacing app's `ion-icon`; warnings via shared `AlertService` (app's `ToastService`
        dropped); two-way `[(cropper)]` for correct state capture; **exports `CropState`** (now imported from
        `@trokai/shared-ui` by both `image-picker`s + both `form-images`). **App opens it via `MatDialog`** (was Ionic
        `ModalController`; `onDidDismiss().data` → `afterClosed()`, loading dismissed on `afterOpened`); both apps'
        local `image-cropper` deleted).
        **`autocomplete` ✅ lifted** (`tk-autocomplete`: generic web-canonical inline `mat-autocomplete`,
        `parentForm`/`controlName` API, score-ranked filter, `ErrorStateMatcher`; web `product-register` (14 usages)
        repointed). App's old Ionic UX (read-only input → fullscreen `AutocompleteDialogComponent` picker modal) is
        **gone** — its only two consumers now use the inline Material autocomplete: `product-register` via
        `tk-product-register-form`, and `bank-account-form` via `tk-bank-account-form` (`MatAutocomplete`). Both apps'
        local autocomplete (+ dialog) deleted.
        **`image-picker` ✅ lifted** (`tk-image-picker`: single web-canonical `MatMenu` picker, capability-driven —
        injects the abstract **`MediaService`** (shared-core) and reads `capabilities.{camera, nativeGallery}` to
        decide which menu options to render (camera / gallery-or-file / crop / remove). Crop via shared
        `tk-image-cropper` (`MatDialog`), preview via blob object-URL, loading via shared `LoadingService`. Replaces
        web `MatMenu`+file-input **and** app Ionic `ActionSheet`+Capacitor flows with one component; both apps'
        local `image-picker` deleted; web `store-options`/`form-images` + app `store-options`/`form-images` repoint
        to `@trokai/shared-ui`.
        **`MediaService` abstraction** (`@trokai/shared-core`, `media/media.service.ts`): `@Injectable() abstract`
        like `StorageService` — concrete shared image pipeline (`resizeBlob`/`resizeBase64`/`processFile`/
        `canvasToBlob`, 1600px cap) lives once in the base; abstract native surface = `capabilities`,
        `openCameraPreview`, `pickSingleFromGallery`, `pickMultipleFromGallery`. Impls: `WebMediaService`
        (file-only, capabilities all-false, native methods no-op) / `MobileMediaService` (Capacitor Camera +
        gallery, capabilities gated on `Capacitor.isPluginAvailable('Camera')`, keeps private `processGalleryPhoto`).
        Each app provides `{ provide: MediaService, useClass: … }` (web `app.config`, app `main.ts`); both apps'
        `media.service.ts` shrank to the platform impl (resize dedup removed). `form-images` (both) now injects the
        abstract `MediaService`.
        ⚠️ **Needs native-device QA** (`nx build` is green but can't exercise the native camera): verify camera
        capture + gallery pick + crop + multi-pick on iOS/Android. **Two app-only quirks were intentionally dropped**
        in the shared picker — re-add per-app if still needed: Firebase `ROUPA_CAMERA`/`ROUPA_GALERIA` analytics
        logging, and `AuthService.redirectUrlPicture = null` reset after pick.
        ✅ This **unblocks** `form-images` + `product-register-form` (product domain).
  - [x] **primitives** → `libs/shared/ui` root — **`cost`/`short-date` pipes + `hide-loading-image` directive ✅
        lifted** (`@trokai/shared-ui`; both apps' local copies + specs deleted, all ~45 consumers repoint directly,
        no passthrough). `mask` directive (app) + back-button (app) **stay per-app** — Ionic-coupled (`IonInput`/
        Ionic toolbar), not platform-agnostic. `TrokaiErrorStateMatcher` ✅ scaffolded.
- [x] Add `nx lint` module-boundary tags — done. Tags `scope:web|app|shared` + `type:app|core|data-access|ui`
      on all 5 projects; `depConstraints` in `eslint.config.mjs` enforce apps→shared-only and
      the `core→data-access→ui` layering (no upward deps). Zero boundary violations. Unit/e2e test
      runners not set up yet — deferred.

---

## Lifting a symbol to shared libs

The project is migrated incrementally. The pattern for each lift:

**Model / enum / util → `@trokai/shared-core`**

1. Add the canonical (web) type to the right file under `libs/shared/core/src/lib/`.
2. Re-export it from `libs/shared/core/src/index.ts`.
3. Delete the duplicate from both apps.
4. Consumers import from `@trokai/shared-core` directly — no app-level re-export passthrough.

**Service → `@trokai/shared-data-access`**

1. Create `libs/shared/data-access/src/lib/<domain>/<domain>.service.ts` (+ `.models.ts` if needed).
2. Inject `HttpClient` and `APP_CONFIG` (never import `src/environments` from a lib).
3. If the service touches platform APIs (localStorage, Capacitor, Router, GTM), invert the
   coupling: define an abstract class in a sibling `<domain>.platform.ts` and inject it;
   each app provides a concrete impl in `app.config.ts` / `main.ts`. **Never import
   `@trokai/shared-ui` from a data-access service** (it inverts layering / closes the
   `data-access ⇄ ui` cycle) — for loading/toast/dialog feedback inject the shared-core
   **`FeedbackService`** port instead (see Troubleshooting).
4. Re-export from the data-access barrel (`libs/shared/data-access/src/index.ts`).
5. Replace both apps' `<domain>.service.ts` with a thin re-export:
   ```ts
   export { DomainService } from '@trokai/shared-data-access';
   ```
6. Fix app call sites to the web-canonical contract (Promise, web naming).

**Component → `@trokai/shared-ui`**

1. Create `libs/shared/ui/src/lib/<domain>/<name>/<name>.component.ts` (standalone, Material M3,
   no Ionic, no Bootstrap, tokens-only styling).
2. Wire inputs/outputs as a dumb component (`@Input()` data, `@Output()` events); inject shared
   services (`AlertService`, `LoadingService`, `BuyingService`, …) — no platform deps.
3. Export from the lib's barrel (`libs/shared/ui/src/index.ts`).
4. Render in **both** shell pages (web page component + app page/modal) — verify build.
5. Delete the legacy component from both app trees.
6. Tick the Roadmap item here.

> **Rule:** if a component needs `Router`, `NavController`, `MatDialog` (owned by web), or any
> Capacitor API, the platform-specific code stays in the per-app shell wrapper and the shared
> component emits an `@Output()` event instead.

---

## Troubleshooting

**data-access ↔ shared-ui layering (the `FeedbackService` port)**

`shared-ui` legitimately depends on `data-access` (`item-name.pipe` → `CatalogService`).
The reverse edge — a data-access service reaching **up** into `shared-ui` for `LoadingService`/
`AlertService` — is a layering inversion that closes that into a `data-access ⇄ ui` import
cycle (it only compiled because Angular's DI is lazy). It's also a concern leak: a data
service deciding to pop a dialog can't run headless (SSR, background sync, unit test).

**Fix (same inversion pattern as `StorageService`/`MediaService`):** the abstract
**`FeedbackService`** port lives in `shared-core` (`feedback/`) — `startLoading`/`stopLoading`/
`toast`/`info`/`confirm`. `BuyingService`/`CompletingInformationService` inject the *abstraction*,
so data-access imports **only `@trokai/shared-core`** (cycle edge gone). The concrete
`MaterialFeedbackService` (shared-ui) wraps `LoadingService`/`AlertService`; each app binds it
(`{ provide: FeedbackService, useClass: MaterialFeedbackService }` — web `app.config.ts`, app
`main.ts`). Prefer this port for cross-cutting service flows; for component-driven UX keep the
dumb `@Input() loading`/`serverError` contract and let the shell own the spinner/dialog.

`item-name.pipe` (shared-ui) → `CatalogService` (data-access) is the one remaining intentional
edge — do not eager-import back across it (e.g. no top-level `new Service()`).

**SSR `localhost` host check**

`apps/web/server.ts` restricts `allowedHosts` to the production domains. A raw `localhost`
request returns 500 by design. Test with:

```bash
curl -H "Host: www.trokai.com.br" http://localhost:4000/
```

Or temporarily add `localhost` to `allowedHosts` while developing.

---

## Useful commands

```bash
npx nx graph                      # visualize the project graph
npx nx build web && npx nx build app
npx nx run-many -t build          # build everything
npx nx show projects              # list projects
npx nx reset                      # clear Nx cache if a build looks stale
```
