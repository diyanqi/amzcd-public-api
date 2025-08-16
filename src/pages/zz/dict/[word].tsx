import type { GetServerSideProps, NextPage } from 'next'
import axios from 'axios'

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

// 调用真实的词典API
async function getDictionaryData(word: string): Promise<DictData> {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    
    if (response.data && response.data.length > 0) {
      const entry = response.data[0]
      
      // 提取音标
      const phonetic = entry.phonetic || 
        (entry.phonetics && entry.phonetics.length > 0 ? entry.phonetics[0].text : '') || ''
      
      // 提取定义
      const definitions: DictData['definitions'] = []
      if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.forEach((meaning: any) => {
          if (meaning.definitions && meaning.definitions.length > 0) {
            meaning.definitions.slice(0, 3).forEach((def: any) => { // 限制最多3个定义
              definitions.push({
                type: meaning.partOfSpeech || 'unknown',
                meaning: def.definition || '无定义',
                example: def.example || ''
              })
            })
          }
        })
      }
      
      // 提取同义词
      const synonyms: string[] = []
      if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.forEach((meaning: any) => {
          if (meaning.synonyms && meaning.synonyms.length > 0) {
            synonyms.push(...meaning.synonyms.slice(0, 5)) // 限制最多5个同义词
          }
        })
      }
      
      return {
        word: entry.word || word,
        phonetic: phonetic,
        definitions: definitions.length > 0 ? definitions : [{
          type: 'unknown',
          meaning: '未找到定义',
          example: ''
        }],
        synonyms: synonyms.length > 0 ? [...new Set(synonyms)] : undefined // 去重
      }
    }
  } catch (error) {
    console.error('Dictionary API error:', error)
  }
  
  // 如果API调用失败，返回默认错误信息
  return {
    word: word,
    definitions: [
      {
        type: 'error',
        meaning: '抱歉，无法获取该单词的释义。请检查拼写或稍后再试。',
        example: ''
      }
    ]
  }
}

function generateDictionarySVG(dictData: DictData): string {
  const baseHeight = 300
  const definitionsHeight = dictData.definitions.length * 90 // 增加每个定义的高度
  const synonymsHeight = dictData.synonyms && dictData.synonyms.length > 0 ? 70 : 0
  const height = Math.max(baseHeight + definitionsHeight + synonymsHeight, 400)
  const timestamp = new Date().toLocaleString('zh-CN')

  // 生成定义部分的SVG
  let definitionsSVG = ''
  let currentY = dictData.phonetic ? 160 : 120

  dictData.definitions.forEach((def, index) => {
    // 处理过长的定义文本
    const meaning = def.meaning.length > 80 ? def.meaning.substring(0, 80) + '...' : def.meaning
    const example = def.example && def.example.length > 60 ? def.example.substring(0, 60) + '...' : def.example
    
    definitionsSVG += `
      <!-- 定义 ${index + 1} -->
      <text x="40" y="${currentY}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4299E1">${index + 1}. [${def.type}]</text>
      <text x="60" y="${currentY + 25}" font-family="Arial, sans-serif" font-size="16" fill="#2D3748">${meaning}</text>
    `
    
    if (example) {
      definitionsSVG += `
        <text x="60" y="${currentY + 50}" font-family="Arial, sans-serif" font-size="14" font-style="italic" fill="#718096">例: ${example}</text>
      `
      currentY += 90
    } else {
      currentY += 70
    }
  })

  // 生成同义词部分的SVG
  let synonymsSVG = ''
  if (dictData.synonyms && dictData.synonyms.length > 0) {
    const synonymsText = dictData.synonyms.slice(0, 8).join(', ') // 限制显示的同义词数量
    synonymsSVG = `
      <text x="40" y="${currentY + 20}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#4299E1">同义词:</text>
      <text x="60" y="${currentY + 45}" font-family="Arial, sans-serif" font-size="14" fill="#2D3748">${synonymsText}</text>
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
  
  <!-- API来源 -->
  <text x="60" y="${height - 40}" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">数据来源: Free Dictionary API</text>
  
  <!-- 时间戳 -->
  <text x="350" y="${height - 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#A0AEC0">查询时间: ${timestamp}</text>
</svg>`
}

interface DictPageProps {
  dictData: DictData
  format: string
}

const DictPage: NextPage<DictPageProps> = ({ dictData, format }) => {
  if (format === 'json') {
    return null // JSON响应在getServerSideProps中处理
  }

  const svgContent = generateDictionarySVG(dictData)
  
  return (
    <div style={{ width: '700px', margin: '0 auto' }}>
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ res, query }) => {
  try {
    const { word } = query
    const format = (query.format as string) || 'img'

    if (!word || typeof word !== 'string') {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify({
        success: false,
        message: 'Word parameter is required'
      }))
      res.end()
      return { props: {} }
    }

    const dictData = await getDictionaryData(word)

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.write(JSON.stringify({
        success: true,
        data: {
          ...dictData,
          timestamp: new Date().toISOString()
        }
      }))
      res.end()
      return { props: {} }
    } else {
      // SVG响应
      const svgContent = generateDictionarySVG(dictData)
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.write(svgContent)
      res.end()
      return { props: {} }
    }
  } catch (error) {
    console.error('Dictionary API error:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }))
    res.end()
    return { props: {} }
  }
}

export default DictPage
