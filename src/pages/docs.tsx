import Head from 'next/head'
import Link from 'next/link'

export default function Docs() {
  return (
    <>
      <Head>
        <title>API文档 | Amzcd公益API</title>
        <meta name="description" content="Amzcd公益API使用文档" />
      </Head>
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                ← 返回首页
              </Link>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">API 使用文档</h1>
              <p className="text-gray-600">免费、开源的公益API服务</p>
            </div>

            <div className="space-y-8">
              {/* 天气API */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">天气查询 API</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <code className="text-sm">GET /zz/weather?format=json|img</code>
                </div>
                
                <h3 className="text-lg font-medium text-gray-700 mb-2">参数说明</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li><strong>format</strong>: 返回格式，可选值为 json 或 img（默认为 img）</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-700 mb-2">示例</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">返回图片（默认）:</p>
                    <code className="bg-gray-100 p-2 rounded text-xs block">
                      GET /zz/weather
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">返回JSON:</p>
                    <code className="bg-gray-100 p-2 rounded text-xs block">
                      GET /zz/weather?format=json
                    </code>
                  </div>
                </div>
              </section>

              {/* 词典API */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">词典查询 API</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <code className="text-sm">GET /zz/dict/{'{word}'}?format=json|img</code>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>数据来源:</strong> 使用 <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener noreferrer" className="underline">Free Dictionary API</a> 提供真实的英文词典数据
                  </p>
                </div>
                
                <h3 className="text-lg font-medium text-gray-700 mb-2">参数说明</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li><strong>word</strong>: 要查询的英文单词（路径参数）</li>
                  <li><strong>format</strong>: 返回格式，可选值为 json 或 img（默认为 img）</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-700 mb-2">示例</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">查询单词（返回图片）:</p>
                    <code className="bg-gray-100 p-2 rounded text-xs block">
                      GET /zz/dict/hello
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">查询单词（返回JSON）:</p>
                    <code className="bg-gray-100 p-2 rounded text-xs block">
                      GET /zz/dict/hello?format=json
                    </code>
                  </div>
                </div>
              </section>

              {/* 通用说明 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">通用说明</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>所有API支持跨域访问</li>
                  <li>图片格式统一为PNG，默认宽度700px，高度自适应</li>
                  <li>API响应包含适当的缓存头信息</li>
                  <li>错误响应统一为JSON格式</li>
                  <li>服务完全免费，无需API密钥</li>
                </ul>
              </section>

              {/* 错误处理 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">错误处理</h2>
                <p className="text-gray-600 mb-4">当API调用出现错误时，会返回相应的HTTP状态码和错误信息：</p>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
{`{
  "success": false,
  "message": "错误描述"
}`}
                  </pre>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
