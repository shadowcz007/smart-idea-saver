import { prepareTools } from 'mcp-uiux/dist/MCPClient'

export const checkMCPStatus = async (url: string) => {
  try {
    let { mcpClient, toolsFunctionCall, systemPrompts }: any =
      await prepareTools(url)

    if (mcpClient) {
      mcpClient.disconnect()
      return {
        connected: true,
        serverInfo: `${mcpClient.serverInfo.name} v${mcpClient.serverInfo.version}`,
        toolCount: toolsFunctionCall.length,
        systemPromptCount: systemPrompts.length
      }
    } else {
      return { connected: false }
    }
  } catch (error) {
    console.error('Failed to check MCP status:', error)
    return { connected: false }
  }
}
