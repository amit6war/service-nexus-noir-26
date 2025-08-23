import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { config, ServiceConfig } from './config.ts'

// TypeScript interfaces for better type safety
interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  county?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  sublocality?: string;
}

interface ReverseGeocodeResponse {
  formattedAddress: string;
  coordinates: { latitude: number; longitude: number };
  components: AddressComponents;
  placeId?: string;
  isComplete: boolean;
  confidence?: number;
}

interface ErrorResponse {
  error: string;
  code?: string;
  timestamp: string;
}

// Enhanced CORS headers with security considerations
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Simple in-memory cache for rate limiting and caching
const cache = new Map<string, { data: any; timestamp: number; hitCount: number }>()
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Configuration constants from config
const CACHE_TTL = config.caching.ttlMs
const RATE_LIMIT_WINDOW = config.rateLimiting.windowMs
const RATE_LIMIT_MAX_REQUESTS = config.rateLimiting.maxRequestsPerMinute
const MAX_RETRY_ATTEMPTS = config.retry.maxAttempts
const RETRY_DELAY_BASE = config.retry.baseDelayMs
const MAX_CACHE_SIZE = config.caching.maxCacheSize

// Utility functions
function validateCoordinates(latitude: any, longitude: any): { isValid: boolean; error?: string } {
  // Check if values exist
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return { isValid: false, error: 'Latitude and longitude are required' }
  }

  // Convert to numbers and validate
  const lat = Number(latitude)
  const lng = Number(longitude)

  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Latitude and longitude must be valid numbers' }
  }

  // Check coordinate bounds
  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90 degrees' }
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180 degrees' }
  }

  return { isValid: true }
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

function checkRateLimit(clientIP: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const clientData = rateLimitMap.get(clientIP)

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, resetTime: clientData.resetTime }
  }

  clientData.count++
  return { allowed: true }
}

function getCacheKey(latitude: number, longitude: number): string {
  // Round coordinates to reduce cache size while maintaining reasonable precision
  const roundedLat = Math.round(latitude * 10000) / 10000
  const roundedLng = Math.round(longitude * 10000) / 10000
  return `${roundedLat},${roundedLng}`
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  cached.hitCount++
  return cached.data
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now(), hitCount: 0 })
  
  // Simple cache cleanup - remove oldest entries if cache gets too large
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.1) // Remove 10% of entries
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      cache.delete(entries[i][0])
    }
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, maxAttempts: number = MAX_RETRY_ATTEMPTS): Promise<Response> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url)
      
      if (response.ok) {
        return response
      }
      
      // Don't retry on client errors (4xx), only server errors (5xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`)
      }
      
      throw new Error(`Server error: ${response.status} ${response.statusText}`)
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxAttempts) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error instanceof Error ? error.message : String(error))
        await sleep(delay)
      }
    }
  }
  
  throw lastError!
}

function createErrorResponse(error: string, code?: string, status: number = 500): Response {
  const errorResponse: ErrorResponse = {
    error,
    code,
    timestamp: new Date().toISOString()
  }
  
  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

serve(async (req: Request) => {
  const startTime = Date.now()
  const clientIP = getClientIP(req)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }
  
  // Check rate limiting
  const rateLimitCheck = checkRateLimit(clientIP)
  if (!rateLimitCheck.allowed) {
    const resetTime = rateLimitCheck.resetTime!
    const waitTime = Math.ceil((resetTime - Date.now()) / 1000)
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: waitTime,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': waitTime.toString()
        }
      }
    )
  }

  try {
    // Parse and validate request body
    let requestBody: any
    try {
      requestBody = await req.json()
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 'INVALID_JSON', 400)
    }

    const { latitude, longitude } = requestBody
    
    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude)
    if (!validation.isValid) {
      return createErrorResponse(validation.error!, 'INVALID_COORDINATES', 400)
    }

    const lat = Number(latitude)
    const lng = Number(longitude)
    
    console.log('Processing request:', { 
      clientIP, 
      coordinates: { latitude: lat, longitude: lng },
      timestamp: new Date().toISOString()
    })
    
    // Check cache first
    const cacheKey = getCacheKey(lat, lng)
    const cachedResult = getFromCache(cacheKey)
    if (cachedResult) {
      console.log('Cache hit for coordinates:', { latitude: lat, longitude: lng })
      return new Response(
        JSON.stringify(cachedResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Google Maps API key from configuration
    const apiKey = config.googleMapsApiKey
    
    if (!apiKey) {
      return createErrorResponse('Google Maps API key not configured', 'API_KEY_MISSING', 500)
    }

    // Call Google Maps Geocoding API with retry logic
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|route|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country&location_type=ROOFTOP|RANGE_INTERPOLATED|GEOMETRIC_CENTER`
    console.log('Calling Google Maps API with URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'))
    
    let response: Response
    let data: any
    
    try {
      response = await fetchWithRetry(apiUrl)
      data = await response.json()
    } catch (error) {
      console.error('Google Maps API request failed after retries:', error)
      
      // Return fallback response with coordinates
      const fallbackResponse: ReverseGeocodeResponse = {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { latitude: lat, longitude: lng },
        components: {},
        isComplete: false,
        confidence: 0
      }
      
      // Cache the fallback response for a shorter time
      setCache(cacheKey, fallbackResponse)
      
      return new Response(
        JSON.stringify(fallbackResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Google Maps API response status:', data.status)
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data)
    }

    let result: ReverseGeocodeResponse
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const googleResult = data.results[0]
      const formattedAddress = googleResult.formatted_address

      // Extract components for detailed info with proper typing
      const addressComponents: AddressComponents = {}
      googleResult.address_components?.forEach((component: any) => {
        const types = component.types || []
        if (types.includes('street_number')) {
          addressComponents.street_number = component.long_name
        }
        if (types.includes('route')) {
          addressComponents.route = component.long_name
        }
        if (types.includes('locality')) {
          addressComponents.locality = component.long_name
        }
        if (types.includes('administrative_area_level_2')) {
          addressComponents.county = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.long_name
        }
        if (types.includes('country')) {
          addressComponents.country = component.long_name
        }
        if (types.includes('postal_code')) {
          addressComponents.postal_code = component.long_name
        }
        if (types.includes('sublocality')) {
          addressComponents.sublocality = component.long_name
        }
      })
      
      // Calculate confidence based on location type and address completeness
      let confidence = 0.5 // Default confidence
      if (googleResult.geometry?.location_type === 'ROOFTOP') {
        confidence = 1.0
      } else if (googleResult.geometry?.location_type === 'RANGE_INTERPOLATED') {
        confidence = 0.8
      } else if (googleResult.geometry?.location_type === 'GEOMETRIC_CENTER') {
        confidence = 0.6
      }
      
      // Boost confidence if we have detailed address components
      if (addressComponents.street_number && addressComponents.route) {
        confidence = Math.min(confidence + 0.2, 1.0)
      }

      result = {
        formattedAddress,
        coordinates: { latitude: lat, longitude: lng },
        components: addressComponents,
        placeId: googleResult.place_id,
        isComplete: formattedAddress && formattedAddress.length > 10,
        confidence
      }
      
      console.log('Successfully geocoded address:', {
        formattedAddress,
        confidence,
        placeId: googleResult.place_id
      })
    } else {
      // Handle cases where no results are found
      result = {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { latitude: lat, longitude: lng },
        components: {},
        confidence: 0,
        isComplete: false
      }
      
      console.log('No geocoding results found, using coordinates as fallback')
    }
    
    // Cache the result
    setCache(cacheKey, result)
    
    // Log performance metrics
    const processingTime = Date.now() - startTime
    console.log('Request completed:', {
      clientIP,
      processingTime: `${processingTime}ms`,
      cached: false,
      confidence: result.confidence
    })
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('Reverse geocoding error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIP,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    })
    
    return createErrorResponse(
      'Failed to reverse geocode location',
      'GEOCODING_ERROR',
      500
    )
  }
})
