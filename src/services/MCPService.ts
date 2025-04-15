import { checkMCPStatus } from './CheckMCPStatus'
import { processKnowledgeTools } from './KnowledgeTools'

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
}

class MCPService {
  private config: MCPConfig = {
    url: localStorage.getItem('mcpUrl') || 'http://localhost:8080',
    llmApiUrl:
      localStorage.getItem('llmApiUrl') ||
      'https://api.siliconflow.cn/v1/chat/completions',
    llmApiKey: localStorage.getItem('llmApiKey') || '',
    llmModel: localStorage.getItem('llmModel') || 'Qwen/Qwen2.5-7B-Instruct'
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
      return result?.length>0?JSON.stringify(result,null,2):'Failed to process note'
    } catch (error) {
      console.error('Failed to process note:', error)
      throw new Error('Failed to process note through MCP')
    }
  }

  async getKnowledge (): Promise<string[]> {
    if (!this.config.url) {
      throw new Error('MCP URL not configured')
    }

    try {
      // Simulate fetching knowledge from MCP
      // In a real implementation, you would make a fetch request to the MCP server
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulated response
      return [
        'The key to productivity is focused deep work.',
        'Spaced repetition improves long-term memory retention.',
        'Connecting ideas across domains leads to novel insights.',
        'Regular reflection enhances learning and creativity.'
      ]
    } catch (error) {
      console.error('Failed to get knowledge from MCP:', error)
      throw new Error('Failed to retrieve knowledge from MCP')
    }
  }

  async generateInspiration (
    noteText: string,
    existingKnowledge: string[]
  ): Promise<string> {
    if (!this.config.url || !noteText.trim()) {
      throw new Error('MCP URL not configured or note is empty')
    }

    try {
      // Simulate generating inspiration through MCP and LLM
      // In a real implementation, you would make a fetch request to the MCP server
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simulated response - combine existing knowledge with the note to create "inspiration"
      const combinedText = [...existingKnowledge, noteText].join(' ')
      const inspiration = `Based on your notes and existing knowledge, consider exploring the connection between ${combinedText
        .split(' ')
        .slice(0, 3)
        .join(' ')} and ${combinedText
        .split(' ')
        .slice(-3)
        .join(
          ' '
        )} to develop a novel framework for understanding complex systems.`

      return inspiration
    } catch (error) {
      console.error('Failed to generate inspiration:', error)
      throw new Error('Failed to generate inspiration through MCP')
    }
  }
}

// Create a singleton instance
const mcpService = new MCPService()
export default mcpService
