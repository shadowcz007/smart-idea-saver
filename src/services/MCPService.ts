import { checkMCPStatus } from './CheckMCPStatus'
import { processKnowledgeTools } from './KnowledgeTools'
import { getKnowledge } from './GetKnowledge'

export interface MCPStatus {
  connected: boolean
  serverInfo?: string
  toolCount?: number
  systemPromptCount?: number
}

export interface MCPConfig {
  url: string
  llmApiUrl: string
  llmApiKey: string
  llmModel: string
  inspirationPrompt: string
}

class MCPService {
  private config: MCPConfig = {
    url: localStorage.getItem('mcpUrl') || 'http://localhost:8080',
    llmApiUrl:
      localStorage.getItem('llmApiUrl') ||
      'https://api.siliconflow.cn/v1/chat/completions',
    llmApiKey: localStorage.getItem('llmApiKey') || '',
    llmModel: localStorage.getItem('llmModel') || 'Qwen/Qwen2.5-7B-Instruct',
    inspirationPrompt:
      localStorage.getItem('inspirationPrompt') ||
      '根据以下笔记和已有知识，请提供创新的思维框架或见解，帮助理解这些概念之间的联系：\n\n{note}\n\n请分析这些概念如何能够帮助构建创新的思维框架来理解复杂系统或解决当前面临的问题。'
  }

  constructor () {
    this.loadConfig()
  }

  private loadConfig (): void {
    const savedConfig = localStorage.getItem('mcpConfig')
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig)
      } catch (error) {
        console.error('Failed to parse saved MCP config:', error)
      }
    }
  }

  saveConfig (config: MCPConfig): void {
    this.config = config
    localStorage.setItem('mcpConfig', JSON.stringify(config))
  }

  getConfig (): MCPConfig {
    return { ...this.config }
  }

  async checkStatus (): Promise<MCPStatus> {
    if (!this.config.url) {
      return { connected: false }
    }
    return await checkMCPStatus(this.config.url)
  }

  async processNote (
    noteText: string,
    callback: (data: any) => void
  ): Promise<string> {
    if (!this.config.url || !noteText.trim()) {
      throw new Error('MCP URL not configured or note is empty')
    }

    try {
      let result = await processKnowledgeTools(
        noteText,
        this.config.url,
        this.config.llmModel,
        this.config.llmApiKey,
        this.config.llmApiUrl,
        callback
      )
      // Simulated response
      return result?.length > 0
        ? JSON.stringify(result, null, 2)
        : 'Failed to process note'
    } catch (error) {
      console.error('Failed to process note:', error)
      throw new Error('Failed to process note through MCP')
    }
  }

  async getKnowledge () {
    if (!this.config.url) {
      throw new Error('MCP URL not configured')
    }

    try {
      // Simulate fetching knowledge from MCP
      // In a real implementation, you would make a fetch request to the MCP server
      await new Promise(resolve => setTimeout(resolve, 500))
      let result: any = await getKnowledge(this.config.url)
      return JSON.stringify(result || {}, null, 2)
    } catch (error) {
      console.error('Failed to get knowledge from MCP:', error)
      throw new Error('Failed to retrieve knowledge from MCP')
    }
  }

  async generateInspiration (
    noteText: string,
    existingKnowledge: string
  ): Promise<string> {
    if (!this.config.url || !noteText.trim()) {
      throw new Error('MCP URL not configured or note is empty')
    }

    try {
      // 组合文本作为提示
      const combinedText = [existingKnowledge, noteText].join('\n\n')
      const prompt = this.config.inspirationPrompt.replace(
        /\${note}|\{note\}/g,
        combinedText
      )

      // 发送请求到LLM API
      const response = await fetch(this.config.llmApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.llmApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.llmModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          max_tokens: 2024,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(
          `API请求失败: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      // console.log('生成灵感', data)
      return data.choices[0].message.content
    } catch (error) {
      console.error('Failed to generate inspiration:', error)
      throw new Error('Failed to generate inspiration through MCP')
    }
  }
}

// Create a singleton instance
const mcpService = new MCPService()
export default mcpService
