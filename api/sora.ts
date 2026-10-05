/**
 * Serverless SORA API Endpoint
 * Route: /api/sora
 *
 * Pulls MAS Daily SORA and compounded 1M/3M/6M averages from:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 *
 * Requires header: KeyId: <MAS_KEY_ID>
 */

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, KeyId');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // MAS KeyId must be retrieved from environment variable
  const masKeyId = process.env.MAS_KEY_ID;

  if (!masKeyId) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'MISSING_API_KEY',
          message:
            'MAS_KEY_ID environment variable is not configured on the server. Please configure MAS_KEY_ID in your deployment environment or .env file.',
          endpoint: MAS_SORA_ENDPOINT,
          requiredHeader: 'KeyId',
        },
        null,
        2
      )
    );
    return;
  }

  try {
    // Parse query params if available from URL
    const urlObj = new URL(req.url || '/api/sora', 'http://localhost');
    const searchParams = urlObj.searchParams;

    // Build outbound target URL with forwarded query params (e.g. limit, rows, filter)
    const targetUrl = new URL(MAS_SORA_ENDPOINT);
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const masResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
        'User-Agent': 'SORA-Calculator/1.0',
      },
    });

    if (!masResponse.ok) {
      const errText = await masResponse.text();
      res.statusCode = masResponse.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify(
          {
            error: 'MAS_GATEWAY_ERROR',
            status: masResponse.status,
            statusText: masResponse.statusText,
            details: errText,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      return;
    }

    const masData = await masResponse.json();

    // Send successful response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.end(JSON.stringify(masData));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: error?.message || 'Failed to fetch data from MAS gateway',
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  }
}
