// Configuration for reverse geocoding service
// This file handles environment-specific settings and API key management

export interface ServiceConfig {
  googleMapsApiKey: string;
  environment: 'development' | 'staging' | 'production';
  rateLimiting: {
    maxRequestsPerMinute: number;
    windowMs: number;
  };
  caching: {
    ttlMs: number;
    maxCacheSize: number;
  };
  retry: {
    maxAttempts: number;
    baseDelayMs: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceMetrics: boolean;
  };
}

// Environment detection
function getEnvironment(): 'development' | 'staging' | 'production' {
  const env = Deno.env.get('ENVIRONMENT') || Deno.env.get('NODE_ENV') || 'development'
  
  if (env === 'production' || env === 'prod') return 'production'
  if (env === 'staging' || env === 'stage') return 'staging'
  return 'development'
}

// Configuration factory
export function createConfig(): ServiceConfig {
  const environment = getEnvironment()
  
  // Base configuration
  const baseConfig: ServiceConfig = {
    googleMapsApiKey: '',
    environment,
    rateLimiting: {
      maxRequestsPerMinute: 10,
      windowMs: 60 * 1000
    },
    caching: {
      ttlMs: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 1000
    },
    retry: {
      maxAttempts: 3,
      baseDelayMs: 1000
    },
    logging: {
      level: 'info',
      enablePerformanceMetrics: true
    }
  }
  
  // Environment-specific overrides
  switch (environment) {
    case 'development':
      baseConfig.rateLimiting.maxRequestsPerMinute = 50 // More lenient for dev
      baseConfig.logging.level = 'debug'
      baseConfig.caching.ttlMs = 2 * 60 * 1000 // Shorter cache for dev
      break
      
    case 'staging':
      baseConfig.rateLimiting.maxRequestsPerMinute = 20
      baseConfig.logging.level = 'info'
      break
      
    case 'production':
      baseConfig.rateLimiting.maxRequestsPerMinute = 10 // Strict for prod
      baseConfig.logging.level = 'warn'
      baseConfig.caching.ttlMs = 10 * 60 * 1000 // Longer cache for prod
      baseConfig.caching.maxCacheSize = 5000 // Larger cache for prod
      break
  }
  
  // Get API key with fallback strategy
  baseConfig.googleMapsApiKey = getApiKey(environment)
  
  return baseConfig
}

// API key management with rotation support
function getApiKey(environment: string): string {
  // Primary API key
  let apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
  
  // Environment-specific API keys (for key rotation)
  if (!apiKey) {
    switch (environment) {
      case 'development':
        apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY_DEV')
        break
      case 'staging':
        apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY_STAGING')
        break
      case 'production':
        apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY_PROD')
        break
    }
  }
  
  // Fallback to secondary key (for rotation scenarios)
  if (!apiKey) {
    apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY_SECONDARY')
  }
  
  if (!apiKey) {
    throw new Error(`Google Maps API key not found for environment: ${environment}`)
  }
  
  return apiKey
}

// Validate configuration
export function validateConfig(config: ServiceConfig): void {
  if (!config.googleMapsApiKey) {
    throw new Error('Google Maps API key is required')
  }
  
  if (config.rateLimiting.maxRequestsPerMinute <= 0) {
    throw new Error('Rate limiting max requests must be positive')
  }
  
  if (config.caching.ttlMs <= 0) {
    throw new Error('Cache TTL must be positive')
  }
  
  if (config.retry.maxAttempts <= 0) {
    throw new Error('Max retry attempts must be positive')
  }
}

// Export singleton config instance
export const config = createConfig()
validateConfig(config)

// Log configuration (without sensitive data)
console.log('Service configuration loaded:', {
  environment: config.environment,
  rateLimiting: config.rateLimiting,
  caching: config.caching,
  retry: config.retry,
  logging: config.logging,
  apiKeyConfigured: !!config.googleMapsApiKey
})