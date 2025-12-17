'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
}

type ToolCall = {
  name: string
  input: any
  result?: any
}

const AVAILABLE_TOOLS = [
  { name: 'web_search', icon: '🔍', description: 'Search the internet' },
  { name: 'calculator', icon: '🧮', description: 'Perform calculations' },
  { name: 'code_executor', icon: '💻', description: 'Execute code' },
  { name: 'knowledge_base', icon: '📚', description: 'Access knowledge' },
  { name: 'image_analyzer', icon: '🖼️', description: 'Analyze images' },
  { name: 'data_processor', icon: '📊', description: 'Process data' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        toolCalls: data.toolCalls
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-5xl flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center py-8 mb-4">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Elite AI Agent
          </h1>
          <p className="text-gray-400 text-lg">Advanced multi-tool autonomous agent</p>
        </div>

        {/* Tools Display */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {AVAILABLE_TOOLS.map(tool => (
            <div
              key={tool.name}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-2xl">{tool.icon}</span>
              <div className="text-sm">
                <div className="font-semibold text-gray-200">{tool.name.replace('_', ' ')}</div>
                <div className="text-gray-500 text-xs">{tool.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-xl mb-2">Welcome to Elite AI Agent</p>
                <p className="text-sm">Ask me anything - I can search, calculate, analyze, and more!</p>
              </div>
            ) : (
              messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'bg-gray-800 text-gray-100'
                  } rounded-2xl px-6 py-4 shadow-lg`}>
                    {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {message.toolCalls.map((tool, i) => (
                          <div key={i} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm border border-gray-600">
                            <div className="flex items-center gap-2 font-semibold text-purple-400">
                              <span>🔧</span>
                              <span>Using: {tool.name}</span>
                            </div>
                            {tool.result && (
                              <div className="mt-1 text-gray-400 text-xs">
                                {typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-800 text-white rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 py-4 font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          Powered by advanced AI with autonomous tool selection
        </div>
      </div>
    </main>
  )
}
