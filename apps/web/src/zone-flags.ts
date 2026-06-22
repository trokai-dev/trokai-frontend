/**
 * Zone.js configuration flags.
 * This file MUST be imported BEFORE zone.js is loaded (see polyfills.ts).
 *
 * These flags prevent Zone.js from patching high-frequency browser events that
 * would otherwise create constant Zone task notifications, keeping Angular's
 * zone perpetually "unstable" and blocking app stability detection.
 *
 * Events listed here will NOT trigger Angular change detection automatically.
 * Any listener that needs to update Angular state must call NgZone.run() manually.
 */

// Disable patching of high-frequency events that fire constantly during
// scroll restoration, navigation, and normal browsing. Patching these causes
// Zone.js to register EventTasks for every listener, polluting the zone.
(window as unknown as Record<string, unknown>).__zone_symbol__UNPATCHED_EVENTS =
  [
    'scroll',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'wheel',
    'resize',
    'touchmove',
  ];
