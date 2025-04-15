import {
  prepareTools,
  callOpenAIFunctionAndProcessToolCalls
} from 'mcp-uiux/dist/MCPClient.js'

function getRandomItems<T> (array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const getKnowledge = async (mcpUrl: string) => {
  let { mcpClient, tools }: any = await prepareTools(mcpUrl)

  try {
    const readGraphTools = tools.filter((t: any) =>
      ['read_graph'].includes(t.name)
    )[0]
    let result = await readGraphTools?.execute()
    mcpClient.disconnect()

    if (result && result[0]) {
      result = JSON.parse(result[0].text)

      // result.entities
      // result.relations
      let entities = getRandomItems(result.entities, 8)
      let relations = getRandomItems(result.relations, 8)

      return entities
    }
  } catch (error) {
    console.error('Failed to get knowledge:', error)
  }

  return
}
