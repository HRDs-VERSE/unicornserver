// src/routes/placesRoutes.ts
import { Router, Request, Response } from 'express';

// Create router
const router = Router();

// Type for query parameters
interface AutocompleteQuery {
  input: string;
  sessiontoken?: string;
  components?: string;
  strictbounds?: boolean;
  offset?: number;
  origin?: string;
  location?: string;
  radius?: number;
  types?: string;
  language?: string;
}

interface DistanceMatrixQuery {
    origins: string;
    destinations: string;
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    language?: string;
    region?: string;
    avoid?: string;
    units?: 'metric' | 'imperial';
    arrival_time?: number;
    departure_time?: number;
    traffic_model?: 'best_guess' | 'pessimistic' | 'optimistic';
    transit_mode?: string;
    transit_routing_preference?: string;
  }

router.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    // Get API key from environment
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    // Extract query parameters
    const {
      input,
      sessiontoken,
      components,
      strictbounds,
      offset,
      origin,
      location,
      radius,
      types,
      language
    } = req.query as unknown as AutocompleteQuery;

    // Validate required parameters
    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input parameter is required'
      });
    }

    // Check if API key is configured
    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Google Places API key is not configured'
      });
    }

    // Build parameters object for the Google API request
    const params = new URLSearchParams({
      input,
      key: GOOGLE_PLACES_API_KEY,
      // Default to India as country component if not specified
      components: components || 'country:in'
    });

    // Add optional parameters if they exist
    if (sessiontoken) params.append('sessiontoken', sessiontoken);
    if (strictbounds) params.append('strictbounds', strictbounds.toString());
    if (offset) params.append('offset', offset.toString());
    if (origin) params.append('origin', origin);
    if (location) params.append('location', location);
    if (radius) params.append('radius', radius.toString());
    if (types) params.append('types', types);
    if (language) params.append('language', language);

    // Construct the URL with query parameters
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

    // Make request to Google Places API using fetch
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `Google API error: ${response.statusText}`
      });
    }

    // Parse the JSON response
    const data = await response.json();

    // Return the data from Google
    return res.json(data);
  } catch (error) {
    console.error('Error in Places Autocomplete API:', error);
    
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

router.get('/distance-matrix', async (req: Request, res: Response) => {
    try {
      // Get API key from environment
      const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  
      // Extract query parameters
      const {
        origins,
        destinations,
        mode,
        language,
        region,
        avoid,
        units,
        arrival_time,
        departure_time,
        traffic_model,
        transit_mode,
        transit_routing_preference
      } = req.query as unknown as DistanceMatrixQuery;
  
      // Validate required parameters
      if (!origins || !destinations) {
        return res.status(400).json({
          success: false,
          error: 'Both origins and destinations parameters are required'
        });
      }
  
      // Check if API key is configured
      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({
          success: false,
          error: 'Google API key is not configured'
        });
      }
  
      // Build parameters object for the Google API request
      const params = new URLSearchParams({
        origins,
        destinations,
        key: GOOGLE_PLACES_API_KEY
      });
  
      // Add optional parameters if they exist
      if (mode) params.append('mode', mode);
      if (language) params.append('language', language);
      if (region) params.append('region', region);
      if (avoid) params.append('avoid', avoid);
      if (units) params.append('units', units);
      if (arrival_time) params.append('arrival_time', arrival_time.toString());
      if (departure_time) params.append('departure_time', departure_time.toString());
      if (traffic_model) params.append('traffic_model', traffic_model);
      if (transit_mode) params.append('transit_mode', transit_mode);
      if (transit_routing_preference) params.append('transit_routing_preference', transit_routing_preference);
  
      // Construct the URL with query parameters
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  
      // Make request to Google Distance Matrix API using fetch
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google API Error:', errorText);
        return res.status(response.status).json({
          success: false,
          error: `Google API error: ${response.statusText}`
        });
      }
  
      // Parse the JSON response
      const data = await response.json();
  
      // Return the data from Google
      return res.json(data);
    } catch (error) {
      console.error('Error in Distance Matrix API:', error);
      
      return res.status(500).json({
        success: false,
        error: 'An unexpected error occurred'
      });
    }
  });
  

export default router;