import type { NextApiRequest, NextApiResponse } from 'next'

interface DictData {
  word: string
  phonetic?: string
  definitions: {
    type: string
    meaning: string
    example?: string
  }[]
  synonyms?: string[]
}

// 模拟词典数据（实际项目中应该调用真实的词典API）
async function getDictionaryData(word: string): Promise<DictData> {
  // 简单的模拟数据
  const mockData: { [key: string]: DictData } = {
    'hello': {
      word: 'hello',
      phonetic: '/həˈloʊ/',
      definitions: [
        {
          type: 'interjection',
          meaning: '你好；喂',
          example: 'Hello, how are you?'
        },
        {
          type: 'noun',
          meaning: '招呼，问候',
          example: 'Give my hello to your family.'
        }
      ],
      synonyms: ['hi', 'greetings', 'hey']
    },
    'world': {
      word: 'world',
      phonetic: '/wɜːrld/',
      definitions: [
        {
          type: 'noun',
          meaning: '世界；地球',
          example: 'The world is a beautiful place.'
        },
        {
          type: 'noun',
          meaning: '领域；范围',
          example: 'The world of science is fascinating.'
        }
      ],
      synonyms: ['earth', 'globe', 'universe']
    }
  }

  return mockData[word.toLowerCase()] || {
    word: word,
    definitions: [
      {
        type: 'unknown',
        meaning: '抱歉，未找到该单词的释义',
        example: ''
      }
    ]
  }
}

function generateDictionarySVG(dictData: DictData): string {
  const baseHeight = 300
  const definitionsHeight = dictData.definitions.length * 80
  const synonymsHeight = dictData.synonyms ? 50 : 0
  const height = Math.max(baseHeight + definitionsHeight + synonymsHeight, 400)
  const timestamp = new Date().toLocaleString('zh-CN')

  // 生成定义部分的SVG
  let definitionsSVG = ''
  let currentY = dictData.phonetic ? 160 : 120

  dictData.definitions.forEach((def, index) => {
    definitionsSVG += `
      <!-- 定义 ${index + 1} -->
      <text x="40" y="${currentY}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4299E1">${index + 1}. [${def.type}]</text>
      <text x="60" y="${currentY + 25}" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">${def.meaning}</text>
    `
    
    if (def.example) {
      definitionsSVG += `
        <text x="60" y="${currentY + 45}" font-family="Arial, sans-serif" font-size="14" font-style="italic" fill="#718096">例: ${def.example}</text>
      `
      currentY += 80
    } else {
      currentY += 65
    }
  })

  // 生成同义词部分的SVG
  let synonymsSVG = ''
  if (dictData.synonyms && dictData.synonyms.length > 0) {
    synonymsSVG = `
      <text x="40" y="${currentY + 20}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#4299E1">同义词:</text>
      <text x="60" y="${currentY + 40}" font-family="Arial, sans-serif" font-size="14" fill="#2D3748">${dictData.synonyms.join(', ')}</text>
    `
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
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
  
  <!-- 时间戳 -->
  <text x="350" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">查询时间: ${timestamp}</text>
</svg>`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { word } = req.query
    const format = req.query.format as string || 'img'

    if (!word || typeof word !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Word parameter is required'
      })
    }

    const dictData = await getDictionaryData(word)

    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: {
          ...dictData,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      // 默认返回SVG图片
      const svgContent = generateDictionarySVG(dictData)
      
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=3600') // 1小时缓存
      res.status(200).send(svgContent)
    }
  } catch (error) {
    console.error('Dictionary API error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
