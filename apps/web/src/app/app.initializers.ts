import { GeolocationService } from './services/geolocation.service';

/**
 * Initialize geolocation service before app starts.
 * This ensures search location is available during SSR and initial client render.
 */
async function initializeGeolocation(locationService: GeolocationService) {
  return await locationService.init();
}

/**
 * Main app initializer function that runs all initialization logic.
 * Add new initializers here as the app grows.
 */
export function initialize(locationService: GeolocationService) {
  return async () => {
    await initializeGeolocation(locationService);
    // Add more initializers here in the future
  };
}
