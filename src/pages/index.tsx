import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Amzcd公益API</title>
        <meta name="description" content="Amzcd公益API服务" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-8">
            Amzcd公益API
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            为开发者提供免费、稳定的API服务
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">天气查询</h3>
              <p className="text-gray-600 mb-4">
                获取当前用户IP地址的天气信息
              </p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm">
                GET /zz/weather?format=json/img
              </code>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">词典查询</h3>
              <p className="text-gray-600 mb-4">
                查询英文单词的详细释义信息（基于Free Dictionary API）
              </p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm">
                GET /zz/dict/{'{单词}'}?format=json/img
              </code>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              href="/docs" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mr-4"
            >
              查看API文档
            </Link>
            <p className="text-gray-500 mt-4">
              所有图片接口默认宽度：700px，高度自适应，格式为SVG
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
