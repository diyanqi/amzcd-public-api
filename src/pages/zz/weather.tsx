import type { GetServerSideProps, NextPage } from 'next'

interface WeatherData {
  location: string
  temperature: string
  description: string
  humidity: string
  windSpeed: string
  icon: string
}

// 模拟天气数据（实际项目中应该调用真实的天气API）
async function getWeatherData(ip: string): Promise<WeatherData> {
  return {
    location: '北京市',
    temperature: '22°C',
    description: '多云',
    humidity: '65%',
    windSpeed: '3.2 m/s',
    icon: '☁️'
  }
}

function getClientIP(req: any): string {
  const forwarded = req.headers['x-forwarded-for']
  const realIP = req.headers['x-real-ip']
  const remoteAddress = req.socket.remoteAddress

  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  if (realIP && typeof realIP === 'string') {
    return realIP
  }
  return remoteAddress || '127.0.0.1'
}

function generateWeatherSVG(weatherData: WeatherData): string {
  const timestamp = new Date().toLocaleString('zh-CN')
  
  return `<?xml version="1.0" encoding="UTF-8"?>
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
</svg>`
}

interface WeatherPageProps {
  weatherData: WeatherData
  clientIP: string
  format: string
}

const WeatherPage: NextPage<WeatherPageProps> = ({ weatherData, clientIP, format }) => {
  if (format === 'json') {
    return null // JSON响应在getServerSideProps中处理
  }

  const svgContent = generateWeatherSVG(weatherData)
  
  return (
    <div style={{ width: '700px', margin: '0 auto' }}>
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const clientIP = getClientIP(req)
    const format = (query.format as string) || 'img'
    
    const weatherData = await getWeatherData(clientIP)

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.write(JSON.stringify({
        success: true,
        data: {
          ...weatherData,
          ip: clientIP,
          timestamp: new Date().toISOString()
        }
      }))
      res.end()
      return { props: {} }
    } else {
      // SVG响应
      const svgContent = generateWeatherSVG(weatherData)
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.write(svgContent)
      res.end()
      return { props: {} }
    }
  } catch (error) {
    console.error('Weather API error:', error)
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

export default WeatherPage
