/**
 * Standalone Entry Point
 * Used when running the app independently (not via Module Federation)
 * Bootstrap pattern to avoid "Shared module is not available for eager consumption" error
 */

// Bootstrap pattern for Module Federation
import('./bootstrap');
