import Head from 'next/head'
import Link from 'next/link'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - 页面未找到 | Amzcd公益API</title>
        <meta name="description" content="页面未找到" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-red-500 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">页面未找到</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <Link 
            href="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            返回首页
          </Link>
        </div>
      </main>
    </>
  )
}
