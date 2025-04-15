# Smart Idea Saver - 智能创意保存工具

这是一个利用MCP（Model Control Protocol）、知识工具和大型语言模型（LLM）的创意管理应用，帮助用户保存、分析和拓展创意。

## 功能特点

- 连接到MCP服务器获取工具和系统提示
- 利用知识工具提取、存储和分析笔记内容
- 基于已有知识和笔记生成创新思维框架和见解
- 支持知识图谱的读取

## 技术架构

### MCP 服务（Model Control Protocol）

MCP是一个模型控制协议，通过它可以连接到大型语言模型并使用各种工具。我们的应用基于这个协议实现了以下功能：

```typescript
// 连接到MCP服务器，获取工具和系统提示
async checkStatus(): Promise<MCPStatus> {
  return await checkMCPStatus(this.config.url);
}

// MCP配置管理
export interface MCPConfig {
  url: string;
  llmApiUrl: string;
  llmApiKey: string;
  llmModel: string;
  inspirationPrompt: string;
}
```

### 知识工具（Tools）

应用集成了多种知识处理工具，用于提取和管理知识：

```typescript
// 从笔记中提取知识实体和关系
export const processKnowledgeTools = async (
  text: string,
  mcpUrl: string,
  model: string,
  apiKey: string,
  apiUrl: string,
  callback: (data: any) => void
) => {
  // 通过MCP获取知识提取工具
  let { mcpClient, tools, toolsFunctionCall, systemPrompts }: any =
    await prepareTools(mcpUrl);
    
  // 使用create_relations和create_entities工具
  const knowledgeTools = toolsFunctionCall.filter((t: any) =>
    ['create_relations', 'create_entities'].includes(t.function.name)
  );
  
  // 执行工具调用并处理结果
  // ...
}

// 获取知识图谱数据
export const getKnowledge = async (mcpUrl: string) => {
  // 通过MCP获取read_graph工具并执行
  let { mcpClient, tools }: any = await prepareTools(mcpUrl);
  const readGraphTools = tools.filter((t: any) =>
    ['read_graph'].includes(t.name)
  )[0];
  
  // ...
}
```

### 大型语言模型（LLM）集成

应用通过API调用大型语言模型，为用户生成创新见解：

```typescript
// 根据笔记内容和已有知识生成创新思维框架
async generateInspiration(
  noteText: string,
  existingKnowledge: string
): Promise<string> {
  // 组合提示模板
  const combinedText = [existingKnowledge, noteText].join('\n\n');
  const prompt = this.config.inspirationPrompt.replace(
    /\${note}|\{note\}/g,
    combinedText
  );

  // 调用LLM API
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
      // ...其他参数
    })
  });
  
  // 解析返回结果
  // ...
}
```

## 使用方法

### 安装依赖

```bash
npm i
```

### 启动开发服务器

```bash
npm run dev
```

### 配置MCP服务

应用默认连接到`http://localhost:8080`的MCP服务器，您可以在应用中修改以下配置：

- MCP服务器URL
- LLM API URL和密钥
- LLM模型名称
- 灵感生成的提示模板

## 主要服务组件

- **MCPService**: 核心服务类，管理MCP配置和提供各种功能接口
- **CheckMCPStatus**: 检查MCP服务器连接状态
- **KnowledgeTools**: 提供知识处理工具的调用接口
- **GetKnowledge**: 从知识图谱获取数据
- **Prompt**: 定义用于生成创新思维的提示模板
- **Markdown**: 提供Markdown渲染功能

## 工作流程

1. 连接到MCP服务器获取可用工具和系统提示
2. 用户输入笔记内容
3. 使用知识工具提取笔记中的实体和关系
4. 存储到知识图谱
5. 基于当前笔记和已有知识，生成创新思维框架和见解
6. 展示结果给用户

## 技术依赖

- mcp-uiux: MCP客户端库，提供与MCP服务器交互的接口
- 各种React组件库用于构建用户界面
- 大型语言模型API

## 注意事项

- 使用前请确保MCP服务器已启动并可访问
- 需要有效的LLM API密钥才能使用灵感生成功能
- 知识图谱数据存储在MCP服务器中

```
npm i
```


```
npm run dev
```


