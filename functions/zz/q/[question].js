// AI聊天对话API - EdgeOne Pages Function  
// 路径: /zz/q/{question}

export async function onRequest({ request, params, env }) {
  // 智能换行函数
  function wrapText(text, maxCharsPerLine = 60) {
    if (!text || typeof text !== 'string') return [];
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      // 如果当前行加上新单词不超过限制，就添加到当前行
      if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        // 否则开始新行
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    // 添加最后一行
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

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
    const question = decodeURIComponent(params.question);

    if (!question) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Question parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 模拟AI回答 (实际使用时需要配置真实的AI API)
    let aiResponse = '这是一个模拟的AI回答。在实际使用中，这里会调用真实的AI API来生成回答。';
    
    // 如果有配置AI API，则调用真实API
    const apiKey = env?.AI_API_KEY;
    const apiEndpoint = env?.AI_API_ENDPOINT;

    if (apiKey && apiEndpoint) {
      try {
        const apiResponse = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ 
            question: question,
            max_tokens: 500
          }),
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          aiResponse = apiData.answer || aiData.choices?.[0]?.message?.content || aiResponse;
        }
      } catch (apiError) {
        console.error('AI API error:', apiError);
        // 保持默认回答
      }
    }

    if (format === 'json') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          question: question,
          answer: aiResponse,
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
      
      const questionLines = wrapText(question, 70);
      const answerLines = wrapText(aiResponse, 75);

      // 计算所需高度
      const questionHeight = questionLines.length * 28 + 40;
      const answerHeight = answerLines.length * 24 + 60;
      const totalHeight = Math.max(questionHeight + answerHeight + 120, 300);

      let questionSVG = '';
      let currentY = 50;

      questionLines.forEach((line, index) => {
        questionSVG += `
          <text x="350" y="${currentY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="${index === 0 ? '22' : '20'}" font-weight="${index === 0 ? '700' : '600'}" fill="white">${line}</text>
        `;
        currentY += 28;
      });

      let answerSVG = '';
      currentY = questionHeight + 80;

      answerLines.forEach((line, index) => {
        answerSVG += `
          <text x="50" y="${currentY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="16" fill="#2D3748" leading="1.6">${line}</text>
        `;
        currentY += 24;
      });

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="700" height="${totalHeight}" viewBox="0 0 700 ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="questionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667EEA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764BA2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="answerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#11998E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#38EF7D;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
    </filter>
  </defs>

  <!-- 背景 -->
  <rect width="700" height="${totalHeight}" fill="#F8FAFC"/>

  <!-- 主边框 -->
  <rect x="15" y="15" width="670" height="${totalHeight - 30}" fill="white" stroke="#E2E8F0" stroke-width="2" rx="12" filter="url(#shadow)"/>

  <!-- 问题区域背景 -->
  <rect x="15" y="15" width="670" height="${questionHeight + 20}" fill="url(#questionGradient)" rx="12"/>
  <rect x="15" y="${questionHeight + 15}" width="670" height="20" fill="url(#questionGradient)"/>

  <!-- 装饰性元素 -->
  <circle cx="650" cy="40" r="12" fill="#FFFFFF30" />
  <circle cx="50" cy="40" r="8" fill="#FFFFFF20" />
  
  <!-- 问题图标和标题 -->
  <text x="40" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="20" fill="white">❓</text>

  <!-- 问题内容 -->
  ${questionSVG}

  <!-- 回答区域背景 -->
  <rect x="30" y="${questionHeight + 50}" width="640" height="${answerHeight + 10}" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1" rx="8"/>
  
  <!-- 回答图标和标题 -->
  <text x="45" y="${questionHeight + 75}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="18" font-weight="600" fill="#059669">🤖 AI 回答</text>

  <!-- 回答内容 -->
  ${answerSVG}

  <!-- 底部信息栏 -->
  <rect x="15" y="${totalHeight - 65}" width="670" height="50" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" rx="0 0 12 12"/>
  
  <!-- API信息 -->
  <text x="30" y="${totalHeight - 35}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="12" fill="#64748B">💬 AMZCD AI Chat API</text>
  
  <!-- 时间戳 -->
  <text x="670" y="${totalHeight - 35}" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="12" fill="#64748B">🕐 ${timestamp}</text>
  
  <!-- 版权信息 -->
  <text x="350" y="${totalHeight - 15}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="10" fill="#94A3B8">Powered by AMZCD API Platform</text>
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
    console.error('AI API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
