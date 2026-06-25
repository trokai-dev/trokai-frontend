import { Injectable } from '@angular/core';

/**
 * Platform-agnostic user-feedback port (loading / toast / dialog) for the
 * data-access layer. Lets services request feedback without depending on
 * `@trokai/shared-ui` — which would invert layering and re-create the
 * `data-access ⇄ ui` import cycle (shared-ui already imports data-access via
 * `item-name.pipe` → `CatalogService`).
 *
 * The concrete impl (`MaterialFeedbackService`, shared-ui) wraps
 * `LoadingService`/`AlertService`; each app binds it in DI.
 */
@Injectable()
export abstract class FeedbackService {
  /** Blocking loading overlay. */
  abstract startLoading(message?: string): void;
  abstract stopLoading(): void;

  /** Transient toast/snackbar — success (green) or error (red) styling. */
  abstract success(message: string): void;
  abstract error(message: string): void;
  /** Neutral notice — not a success/error outcome (e.g. "complete your profile"). */
  abstract warning(message: string): void;

  /** Informational dialog; resolves when dismissed. */
  abstract info(title?: string, text?: string): Promise<boolean>;

  /** Yes/no confirm dialog; resolves to the user's choice. */
  abstract confirm(
    message: string,
    title?: string,
    okText?: string,
    noText?: string,
    danger?: boolean,
  ): Promise<boolean>;
}
