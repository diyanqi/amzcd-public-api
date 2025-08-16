// 天气查询API - EdgeOne Pages Function
// 路径: /zz/weather

export async function onRequest({ request }) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'img';
    
    // 获取地理位置信息（EdgeOne提供）
    const geo = request.eo?.geo || {};
    const location = geo.city || geo.region || '未知位置';
    
    // 模拟天气数据
    const weatherData = {
      location: location,
      temperature: '22°C',
      description: '多云',
      humidity: '65%',
      windSpeed: '3.2 m/s',
      icon: '☁️'
    };

    if (format === 'json') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...weatherData,
          geo: geo,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });
    } else {
      // 生成SVG图片
      const timestamp = new Date().toLocaleString('zh-CN');
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="700" height="400" viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景渐变 -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E0F6FF;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="700" height="400" fill="url(#bg)"/>
  
  <!-- 标题 -->
  <text x="350" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#2D3748">天气预报</text>
  
  <!-- 位置 -->
  <text x="350" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#2D3748">${weatherData.location}</text>
  
  <!-- 天气图标 -->
  <text x="250" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#2D3748">${weatherData.icon}</text>
  
  <!-- 温度 -->
  <text x="450" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#2D3748">${weatherData.temperature}</text>
  
  <!-- 天气描述 -->
  <text x="350" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#2D3748">${weatherData.description}</text>
  
  <!-- 详细信息 -->
  <text x="150" y="300" font-family="Arial, sans-serif" font-size="20" fill="#2D3748">湿度: ${weatherData.humidity}</text>
  <text x="150" y="330" font-family="Arial, sans-serif" font-size="20" fill="#2D3748">风速: ${weatherData.windSpeed}</text>
  
  <!-- 时间戳 -->
  <text x="350" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#718096">更新时间: ${timestamp}</text>
</svg>`;

      return new Response(svgContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
