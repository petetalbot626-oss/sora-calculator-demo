/**
 * Serverless Health Check Endpoint
 * Route: /api/health
 */

export default async function handler(req: any, res: any) {
  // Enable CORS for all environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, KeyId');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const hasMasKey = Boolean(process.env.MAS_KEY_ID);

  const payload = {
    status: 'ok',
    service: 'sora-mas-serverless-api',
    timestamp: new Date().toISOString(),
    masIntegration: {
      configured: hasMasKey,
      authHeaderRequired: 'KeyId',
      endpoint:
        'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
    },
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}
