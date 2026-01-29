import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const autocompleteSchema = z.object({
  query: z.string().min(1, "Query is required"),
  country: z.string().default("au"), // Default to Australia
});

// Using a free geocoding service (Nominatim) for address autocomplete
// In production, you might want to use Google Places API or similar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const country = searchParams.get("country") || "au";

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use Nominatim (OpenStreetMap) for free geocoding
    // This provides address autocomplete without API keys
    // Add Australia-specific parameters for better results
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${country}&limit=8&addressdetails=1&extratags=1&namedetails=1`,
      {
        headers: {
          "User-Agent": "JobSync Resume Builder", // Required by Nominatim
          "Accept-Language": "en-AU,en",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location suggestions");
    }

    const data = await response.json();
    
    // Format the results
    const suggestions = data.map((item: any) => {
      const address = item.address || {};
      let formatted = "";
      
      // Build formatted address with better Australian format
      // Priority: Street Number + Road, Suburb, State Postcode
      const parts: string[] = [];
      
      if (address.house_number && address.road) {
        parts.push(`${address.house_number} ${address.road}`);
      } else if (address.road) {
        parts.push(address.road);
      }
      
      if (address.suburb || address.city_district || address.neighbourhood) {
        parts.push(address.suburb || address.city_district || address.neighbourhood);
      }
      
      if (address.city || address.town || address.municipality) {
        const city = address.city || address.town || address.municipality;
        if (!parts.includes(city)) {
          parts.push(city);
        }
      }
      
      // Australian format: Suburb, State Postcode
      if (address.state && address.postcode) {
        const stateAbbr = address.state.length > 3 ? address.state.substring(0, 3).toUpperCase() : address.state.toUpperCase();
        parts.push(`${stateAbbr} ${address.postcode}`);
      } else if (address.state) {
        parts.push(address.state);
      } else if (address.postcode) {
        parts.push(address.postcode);
      }

      formatted = parts.join(", ");

      // Fallback to display_name if formatted is empty
      return formatted || item.display_name;
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Location autocomplete error:", error);
    // Return empty suggestions on error
    return NextResponse.json({ suggestions: [] });
  }
}
