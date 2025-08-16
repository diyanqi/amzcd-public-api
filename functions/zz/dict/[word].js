// 词典查询API - EdgeOne Pages Function  
// 路径: /zz/dict/[word]

export async function onRequest({ request, params }) {
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
      const apiResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        
        if (apiData && apiData.length > 0) {
          const entry = apiData[0];
          
          // 提取音标
          const phonetic = entry.phonetic || 
            (entry.phonetics && entry.phonetics.length > 0 ? entry.phonetics[0].text : '') || '';
          
          // 提取定义
          const definitions = [];
          if (entry.meanings && entry.meanings.length > 0) {
            entry.meanings.forEach((meaning) => {
              if (meaning.definitions && meaning.definitions.length > 0) {
                meaning.definitions.slice(0, 3).forEach((def) => {
                  definitions.push({
                    type: meaning.partOfSpeech || 'unknown',
                    meaning: def.definition || '无定义',
                    example: def.example || ''
                  });
                });
              }
            });
          }
          
          // 提取同义词
          const synonyms = [];
          if (entry.meanings && entry.meanings.length > 0) {
            entry.meanings.forEach((meaning) => {
              if (meaning.synonyms && meaning.synonyms.length > 0) {
                synonyms.push(...meaning.synonyms.slice(0, 5));
              }
            });
          }
          
          dictData = {
            word: entry.word || word,
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
      const baseHeight = 300;
      const definitionsHeight = dictData.definitions.length * 90;
      const synonymsHeight = dictData.synonyms && dictData.synonyms.length > 0 ? 70 : 0;
      const height = Math.max(baseHeight + definitionsHeight + synonymsHeight, 400);
      const timestamp = new Date().toLocaleString('zh-CN');

      // 生成定义部分的SVG
      let definitionsSVG = '';
      let currentY = dictData.phonetic ? 160 : 120;

      dictData.definitions.forEach((def, index) => {
        const meaning = def.meaning.length > 80 ? def.meaning.substring(0, 80) + '...' : def.meaning;
        const example = def.example && def.example.length > 60 ? def.example.substring(0, 60) + '...' : def.example;
        
        definitionsSVG += `
          <!-- 定义 ${index + 1} -->
          <text x="40" y="${currentY}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4299E1">${index + 1}. [${def.type}]</text>
          <text x="60" y="${currentY + 25}" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">${meaning}</text>
        `;
        
        if (example) {
          definitionsSVG += `
            <text x="60" y="${currentY + 50}" font-family="Arial, sans-serif" font-size="14" font-style="italic" fill="#718096">例: ${example}</text>
          `;
          currentY += 90;
        } else {
          currentY += 70;
        }
      });

      // 生成同义词部分的SVG
      let synonymsSVG = '';
      if (dictData.synonyms && dictData.synonyms.length > 0) {
        const synonymsText = dictData.synonyms.slice(0, 8).join(', ');
        synonymsSVG = `
          <text x="40" y="${currentY + 20}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#4299E1">同义词:</text>
          <text x="60" y="${currentY + 45}" font-family="Arial, sans-serif" font-size="14" fill="#2D3748">${synonymsText}</text>
        `;
      }

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="700" height="${height}" viewBox="0 0 700 ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="700" height="${height}" fill="#F7FAFC"/>
  
  <!-- 边框 -->
  <rect x="10" y="10" width="680" height="${height - 20}" fill="none" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- 标题背景 -->
  <rect x="10" y="10" width="680" height="80" fill="#4299E1"/>
  
  <!-- 单词标题 -->
  <text x="350" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">${dictData.word.toUpperCase()}</text>
  
  <!-- 音标 -->
  ${dictData.phonetic ? `<text x="350" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#2D3748">${dictData.phonetic}</text>` : ''}
  
  <!-- 定义 -->
  ${definitionsSVG}
  
  <!-- 同义词 -->
  ${synonymsSVG}
  
  <!-- API来源 -->
  <text x="60" y="${height - 40}" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">数据来源: Free Dictionary API</text>
  
  <!-- 时间戳 -->
  <text x="350" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">查询时间: ${timestamp}</text>
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
