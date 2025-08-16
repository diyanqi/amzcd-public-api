import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// AI聊天对话API - EdgeOne Pages Function  
// 路径: /zz/q/{question}

export async function onRequest({ request, params, env }) {
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
    const question = params.question;

    if (!question) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Question parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.AI_API_KEY;
    const apiEndpoint = env.AI_API_ENDPOINT;

    if (!apiKey || !apiEndpoint) {
      return new Response(JSON.stringify({
        success: false,
        message: 'API key or endpoint is not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let aiResponse = '抱歉，无法获取回答。请稍后再试。';

    try {
      const apiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ question }),
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        aiResponse = apiData.answer || aiResponse;
      }
    } catch (apiError) {
      console.error('AI API error:', apiError);
    }

    const questionLines = question.match(/.{1,50}/g) || [question];
    const answerLines = aiResponse.match(/.{1,50}/g) || [aiResponse];

    let questionSVG = '';
    let currentY = 40;

    questionLines.forEach((line) => {
      questionSVG += `
        <text x="350" y="${currentY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">${line}</text>
      `;
      currentY += 30;
    });

    let answerSVG = '';
    currentY = 100;

    answerLines.forEach((line) => {
      answerSVG += `
        <text x="40" y="${currentY}" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">${line}</text>
      `;
      currentY += 25;
    });

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="700" height="200" viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="700" height="200" fill="#F7FAFC"/>

  <!-- 边框 -->
  <rect x="10" y="10" width="680" height="180" fill="none" stroke="#E2E8F0" stroke-width="2"/>

  <!-- 标题背景 -->
  <rect x="10" y="10" width="680" height="50" fill="#4299E1"/>

  <!-- 问题标题 -->
  ${questionSVG}

  <!-- 回答 -->
  ${answerSVG}

  <!-- 时间戳 -->
  <text x="350" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">查询时间: ${new Date().toLocaleString('zh-CN')}</text>
</svg>`;

    return new Response(svgContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('AI API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
