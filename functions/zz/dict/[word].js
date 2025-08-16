// 词典查询API - EdgeOne Pages Function  
// 路径: /zz/dict/[word]

export async function onRequest({ request, params }) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 智能换行函数
  function wrapText(text, maxCharsPerLine = 70) {
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
    const word = params.word;

    if (!word) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Word parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 调用Free Dictionary API
    let dictData = {
      word: word,
      definitions: [{
        type: 'error',
        meaning: '抱歉，无法获取该单词的释义。请检查拼写或稍后再试。',
        example: ''
      }]
    };

    try {
      const apiResponse = await fetch(`https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(word)}`);

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();

        if (apiData && apiData.entries && apiData.entries.length > 0) {
          const entry = apiData.entries[0];

          // 提取音标
          const phonetic = entry.pronunciations && entry.pronunciations.length > 0 ? entry.pronunciations[0].text : '';

          // 提取定义
          const definitions = [];
          if (entry.senses && entry.senses.length > 0) {
            entry.senses.forEach((sense) => {
              definitions.push({
                type: entry.partOfSpeech || 'unknown',
                meaning: sense.definition || '无定义',
                example: sense.examples && sense.examples.length > 0 ? sense.examples[0] : ''
              });
            });
          }

          // 提取同义词
          const synonyms = entry.synonyms || [];

          dictData = {
            word: apiData.word || word,
            phonetic: phonetic,
            definitions: definitions.length > 0 ? definitions : [{
              type: 'unknown',
              meaning: '未找到定义',
              example: ''
            }],
            synonyms: synonyms.length > 0 ? [...new Set(synonyms)] : undefined
          };
        }
      }
    } catch (apiError) {
      console.error('Dictionary API error:', apiError);
    }

    if (format === 'json') {
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...dictData,
          timestamp: new Date().toISOString()
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } else {
      // 生成SVG图片
      const timestamp = new Date().toLocaleString('zh-CN');

      // 计算所需高度
      let totalHeight = 140; // 基础高度（标题栏 + 音标）
      const definitionDetails = [];
      
      dictData.definitions.forEach((def, index) => {
        const meaningLines = wrapText(def.meaning, 70);
        const exampleLines = def.example ? wrapText(`例: ${def.example}`, 60) : [];
        
        definitionDetails.push({ meaningLines, exampleLines });
        
        totalHeight += 35; // 定义标题高度
        totalHeight += meaningLines.length * 24; // 释义内容高度
        totalHeight += exampleLines.length * 22; // 例句高度
        totalHeight += 15; // 定义间隔
      });
      
      // 同义词高度
      const synonymsHeight = dictData.synonyms && dictData.synonyms.length > 0 ? 60 : 0;
      totalHeight += synonymsHeight + 80; // 底部信息区域
      
      const height = Math.max(totalHeight, 400);

      // 生成定义部分的SVG
      let definitionsSVG = '';
      let currentY = dictData.phonetic ? 160 : 120;

      dictData.definitions.forEach((def, index) => {
        const { meaningLines, exampleLines } = definitionDetails[index];
        
        // 定义标题背景
        definitionsSVG += `
          <!-- 定义 ${index + 1} 背景 -->
          <rect x="30" y="${currentY - 25}" width="640" height="30" fill="#EBF8FF" stroke="#90CDF4" stroke-width="1" rx="5"/>
          <!-- 定义 ${index + 1} -->
          <text x="45" y="${currentY - 5}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="600" fill="#2B6CB0">${index + 1}. [${def.type}]</text>
        `;
        currentY += 20;

        meaningLines.forEach((line, lineIndex) => {
          definitionsSVG += `
            <text x="50" y="${currentY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="15" fill="#2D3748" leading="1.5">${line}</text>
          `;
          currentY += 24;
        });

        if (exampleLines.length > 0) {
          currentY += 5;
          exampleLines.forEach((line, lineIndex) => {
            definitionsSVG += `
              <text x="50" y="${currentY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="13" font-style="italic" fill="#4A5568">${line}</text>
            `;
            currentY += 22;
          });
        }

        currentY += 15; // 定义间隔
      });

      // 生成同义词部分的SVG
      let synonymsSVG = '';
      if (dictData.synonyms && dictData.synonyms.length > 0) {
        const synonymsText = dictData.synonyms.slice(0, 8).join(' • ');
        const synonymsLines = wrapText(synonymsText, 80);
        
        synonymsSVG += `
          <!-- 同义词背景 -->
          <rect x="30" y="${currentY}" width="640" height="${25 + synonymsLines.length * 20}" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1" rx="5"/>
          <text x="45" y="${currentY + 20}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="600" fill="#059669">📝 同义词</text>
        `;
        
        let synonymsY = currentY + 45;
        synonymsLines.forEach((line) => {
          synonymsSVG += `
            <text x="50" y="${synonymsY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="14" fill="#065F46">${line}</text>
          `;
          synonymsY += 20;
        });
      }

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="700" height="${height}" viewBox="0 0 700 ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667EEA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764BA2;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
    </filter>
  </defs>
  
  <!-- 背景 -->
  <rect width="700" height="${height}" fill="url(#backgroundGradient)"/>
  
  <!-- 主边框 -->
  <rect x="15" y="15" width="670" height="${height - 30}" fill="white" stroke="#E2E8F0" stroke-width="2" rx="12" filter="url(#shadow)"/>
  
  <!-- 标题背景 -->
  <rect x="15" y="15" width="670" height="85" fill="url(#headerGradient)" rx="12"/>
  <rect x="15" y="85" width="670" height="15" fill="url(#headerGradient)"/>
  
  <!-- 装饰性元素 -->
  <circle cx="650" cy="45" r="15" fill="#FFFFFF20" />
  <circle cx="625" cy="65" r="8" fill="#FFFFFF15" />
  
  <!-- 单词标题 -->
  <text x="350" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="36" font-weight="700" fill="white" letter-spacing="1px">${dictData.word.charAt(0).toUpperCase() + dictData.word.slice(1)}</text>
  
  <!-- 音标 -->
  ${dictData.phonetic ? `
    <rect x="250" y="105" width="200" height="25" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1" rx="12"/>
    <text x="350" y="122" text-anchor="middle" font-family="'SF Mono', Monaco, 'Cascadia Code', monospace" font-size="16" fill="#475569">/${dictData.phonetic}/</text>
  ` : ''}
  
  <!-- 定义 -->
  ${definitionsSVG}
  
  <!-- 同义词 -->
  ${synonymsSVG}
  
  <!-- 底部信息栏 -->
  <rect x="15" y="${height - 65}" width="670" height="50" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" rx="0 0 12 12"/>
  
  <!-- API来源 -->
  <text x="30" y="${height - 35}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="12" fill="#64748B">📚 数据来源: Free Dictionary API</text>
  
  <!-- 时间戳 -->
  <text x="670" y="${height - 35}" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="12" fill="#64748B">🕐 ${timestamp}</text>
  
  <!-- 版权信息 -->
  <text x="350" y="${height - 15}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="10" fill="#94A3B8">Powered by AMZCD Dictionary API</text>
</svg>`;

      return new Response(svgContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
  } catch (error) {
    console.error('Dictionary API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
