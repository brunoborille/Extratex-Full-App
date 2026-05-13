import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MetalsAPIResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const METALS_API_KEY = Deno.env.get("METALS_API_KEY");

    if (!METALS_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "METALS_API_KEY not configured. Please sign up at https://metals-api.com and add your API key to Supabase secrets."
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiUrl = `https://metals-api.com/api/latest?access_key=${METALS_API_KEY}&base=USD&symbols=LME-XCU,XAU,XAG`;

    const response = await fetch(apiUrl);
    const data: MetalsAPIResponse = await response.json();

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch metal prices from Metals-API" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const copperPerLb = data.rates["LME-XCU"] ? 1 / data.rates["LME-XCU"] : null;
    const goldPerOz = data.rates["XAU"] ? 1 / data.rates["XAU"] : null;
    const silverPerOz = data.rates["XAG"] ? 1 / data.rates["XAG"] : null;

    return new Response(
      JSON.stringify({
        success: true,
        prices: {
          copper: copperPerLb,
          gold: goldPerOz,
          silver: silverPerOz,
        },
        timestamp: data.timestamp,
        date: data.date,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
