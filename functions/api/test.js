// EdgeOne Functions 测试端点
// 访问路径: /api/test

export function onRequest({ request }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const geo = request.eo?.geo || {};
  
  return new Response(JSON.stringify({
    message: 'EdgeOne Functions 运行正常!',
    timestamp: new Date().toISOString(),
    userLocation: {
      country: geo.country || '未知',
      region: geo.region || '未知', 
      city: geo.city || '未知'
    },
    request: {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || '未知'
    }
  }, null, 2), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
