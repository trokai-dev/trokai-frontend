import { Injectable } from '@angular/core';
import { CompletingType } from '@trokai/shared-core';

/**
 * Platform navigation for the shared `CompletingInformationService`. Each app
 * provides one impl — only the *navigation* (which completion gates exist, the
 * routes they redirect to, the per-platform feedback, and the sell destination)
 * is specialized; the orchestration stays in the shared service.
 */
@Injectable()
export abstract class CompletingNavigator {
  /** Clear any in-progress sell draft before entering the sell flow. */
  abstract resetSellDraft(): void;

  /**
   * Run the platform completion gates for `action`. Returns `true` if the user
   * was redirected to complete a missing step (caller stops), `false` if the
   * user may proceed to the action.
   */
  abstract gate(action: CompletingType): Promise<boolean>;

  /** Navigate to the sell / product-register destination. */
  abstract toSellRegister(): Promise<void>;
}
