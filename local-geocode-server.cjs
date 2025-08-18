// Local Node.js server for testing reverse geocoding without Supabase
const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache for testing
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map();
const RATE_LIMIT = 50; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Utility functions
function validateCoordinates(latitude, longitude) {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return { isValid: false, error: 'Latitude and longitude are required' };
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return { isValid: false, error: 'Latitude and longitude must be valid numbers' };
  }

  if (lat < -90 || lat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }

  if (lng < -180 || lng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }

  return { isValid: true };
}

function getCacheKey(lat, lng) {
  // Round to 4 decimal places for cache efficiency
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function checkRateLimit(clientIP) {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIP) || { count: 0, resetTime: now + RATE_WINDOW };
  
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_WINDOW;
  }
  
  if (clientData.count >= RATE_LIMIT) {
    return false;
  }
  
  clientData.count++;
  rateLimitMap.set(clientIP, clientData);
  return true;
}

async function fetchWithRetry(url, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxAttempts) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Main reverse geocoding endpoint
app.post('/reverse-geocode', async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    console.log('\n=== Reverse Geocoding Request ===');
    console.log('Client IP:', clientIP);
    console.log('Request body:', req.body);
    
    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      });
    }
    
    const { latitude, longitude } = req.body;
    
    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error,
        code: 'INVALID_COORDINATES',
        timestamp: new Date().toISOString()
      });
    }
    
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    console.log('Processing coordinates:', { latitude: lat, longitude: lng });
    
    // Check cache first
    const cacheKey = getCacheKey(lat, lng);
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      console.log('✅ Cache hit!');
      const processingTime = Date.now() - startTime;
      console.log(`Request completed in ${processingTime}ms (cached)`);
      return res.json(cachedResult.data);
    }
    
    // Get Google Maps API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Google Maps API key not configured',
        code: 'API_KEY_MISSING',
        timestamp: new Date().toISOString()
      });
    }
    
    // Call Google Maps Geocoding API
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|route|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country&location_type=ROOFTOP|RANGE_INTERPOLATED|GEOMETRIC_CENTER`;
    console.log('🌍 Calling Google Maps API...');
    
    let response;
    let data;
    
    try {
      response = await fetchWithRetry(apiUrl);
      data = await response.json();
    } catch (error) {
      console.error('❌ Google Maps API request failed:', error.message);
      
      // Return fallback response
      const fallbackResponse = {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { latitude: lat, longitude: lng },
        components: {},
        isComplete: false,
        confidence: 0
      };
      
      // Cache fallback for shorter time
      cache.set(cacheKey, { data: fallbackResponse, timestamp: Date.now() });
      
      const processingTime = Date.now() - startTime;
      console.log(`Request completed in ${processingTime}ms (fallback)`);
      return res.json(fallbackResponse);
    }
    
    console.log('Google Maps API status:', data.status);
    
    let result;
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const googleResult = data.results[0];
      const formattedAddress = googleResult.formatted_address;
      
      // Extract address components
      const addressComponents = {};
      googleResult.address_components?.forEach(component => {
        const types = component.types || [];
        if (types.includes('street_number')) {
          addressComponents.street_number = component.long_name;
        }
        if (types.includes('route')) {
          addressComponents.route = component.long_name;
        }
        if (types.includes('locality')) {
          addressComponents.locality = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressComponents.state = component.long_name;
        }
        if (types.includes('administrative_area_level_2')) {
          addressComponents.county = component.long_name;
        }
        if (types.includes('country')) {
          addressComponents.country = component.long_name;
        }
        if (types.includes('postal_code')) {
          addressComponents.postal_code = component.long_name;
        }
        if (types.includes('sublocality')) {
          addressComponents.sublocality = component.long_name;
        }
      });
      
      // Calculate confidence based on result quality
      let confidence = 0.5;
      if (googleResult.geometry?.location_type === 'ROOFTOP') {
        confidence = 0.95;
      } else if (googleResult.geometry?.location_type === 'RANGE_INTERPOLATED') {
        confidence = 0.85;
      } else if (googleResult.geometry?.location_type === 'GEOMETRIC_CENTER') {
        confidence = 0.75;
      }
      
      result = {
        formattedAddress,
        coordinates: { latitude: lat, longitude: lng },
        components: addressComponents,
        placeId: googleResult.place_id,
        isComplete: formattedAddress && formattedAddress.length > 10,
        confidence
      };
      
      console.log('✅ Successfully geocoded:', {
        address: formattedAddress,
        confidence,
        placeId: googleResult.place_id
      });
    } else {
      // No results found
      result = {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { latitude: lat, longitude: lng },
        components: {},
        confidence: 0,
        isComplete: false
      };
      
      console.log('⚠️ No geocoding results found, using coordinates as fallback');
    }
    
    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Request completed in ${processingTime}ms`);
    console.log('=== End Request ===\n');
    
    res.json(result);
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Reverse geocoding error:', {
      error: error.message,
      stack: error.stack,
      clientIP,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      error: 'Failed to reverse geocode location',
      code: 'GEOCODING_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache_size: cache.size,
    rate_limit_entries: rateLimitMap.size
  });
});

// Add fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 Local Reverse Geocoding Server Started!');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🔑 Google Maps API Key: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('\n📋 Available endpoints:');
  console.log(`   POST http://localhost:${PORT}/reverse-geocode`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log('\n🧪 Test with curl:');
  console.log(`   curl -X POST http://localhost:${PORT}/reverse-geocode \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"latitude": 40.7128, "longitude": -74.0060}'`);
  console.log('\n⏹️  Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});