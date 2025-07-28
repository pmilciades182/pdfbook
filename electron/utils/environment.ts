import * as electronIsDev from 'electron-is-dev';

/**
 * Check if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return electronIsDev as boolean;
}

/**
 * Alias for isDevelopment for shorter usage
 */
export function isDev(): boolean {
  return isDevelopment();
}

/**
 * Check if the application is running in production mode
 */
export function isProduction(): boolean {
  return !isDev();
}

/**
 * Get the current environment name
 */
export function getEnvironment(): 'development' | 'production' {
  return isDev() ? 'development' : 'production';
}

/**
 * Get environment-specific configuration
 */
export function getConfig() {
  return {
    isDev: isDev(),
    isProduction: isProduction(),
    environment: getEnvironment(),
    rendererPort: 3000,
    logLevel: isDev() ? 'debug' : 'error',
    enableDevTools: isDev(),
  };
}