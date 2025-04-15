import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import mcpService, { MCPStatus, MCPConfig } from '@/services/MCPService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<MCPConfig>({
    ...mcpService.getConfig(),
    llmApiUrl: mcpService.getConfig().llmApiUrl || "https://api.siliconflow.cn/v1/chat/completions",
    llmModel: mcpService.getConfig().llmModel || "Qwen/Qwen2.5-7B-Instruct",
    inspirationPrompt: mcpService.getConfig().inspirationPrompt || "根据以下笔记和已有知识，请提供创新的思维框架或见解，帮助理解这些概念之间的联系：\n\n{note}\n\n请分析这些概念如何能够帮助构建创新的思维框架来理解复杂系统或解决当前面临的问题。"
  });
  const [status, setStatus] = useState<MCPStatus>({ connected: false });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    console.log('checkStatus');
    try {
      const status = await mcpService.checkStatus();

      setStatus(status);
    } catch (error) {
      console.error('Failed to check MCP status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      checkStatus();
    }
  }, [open]);

  const handleSave = async () => {
    mcpService.saveConfig(config);
    await checkStatus();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <Settings className="h-5 w-5" />
          <span className="sr-only">设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="mcp" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mcp">MCP 设置</TabsTrigger>
            <TabsTrigger value="llm">LLM 设置</TabsTrigger>
            <TabsTrigger value="inspiration">灵感设置</TabsTrigger>
          </TabsList>

          <TabsContent value="mcp" className="mt-2">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mcp-url" className="text-right">
                  MCP URL
                </Label>
                <Input
                  id="mcp-url"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="http://localhost:8000"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">状态</Label>
                <div className="col-span-3 flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{status.connected ? '已连接' : '未连接'}</span>
                </div>
              </div>

              {status.connected && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">服务器信息</Label>
                    <div className="col-span-3">
                      <span className="text-sm text-muted-foreground">{status.serverInfo || '-'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">工具</Label>
                    <div className="col-span-3">
                      <span className="text-sm text-muted-foreground">{status.toolCount || 0} 个工具</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">系统提示</Label>
                    <div className="col-span-3">
                      <span className="text-sm text-muted-foreground">{status.systemPromptCount || 0} 个系统提示</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="llm" className="mt-2">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="llm-api-url" className="text-right">
                  API URL
                </Label>
                <Input
                  id="llm-api-url"
                  value={config.llmApiUrl}
                  onChange={(e) => setConfig({ ...config, llmApiUrl: e.target.value })}
                  placeholder="https://api.siliconflow.cn/v1/chat/completions"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="llm-api-key" className="text-right">
                  API Key
                </Label>
                <Input
                  id="llm-api-key"
                  type="password"
                  value={config.llmApiKey}
                  onChange={(e) => setConfig({ ...config, llmApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="llm-model" className="text-right">
                  模型
                </Label>
                <Input
                  id="llm-model"
                  value={config.llmModel}
                  onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                  placeholder="Qwen/Qwen2.5-7B-Instruct"
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inspiration" className="mt-2">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inspiration-prompt" className="text-right">
                  灵感提示词
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="inspiration-prompt"
                    value={config.inspirationPrompt}
                    onChange={(e) => setConfig({ ...config, inspirationPrompt: e.target.value })}
                    placeholder="请输入灵感生成提示词，使用{note}作为笔记内容占位符"
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    使用 {'{note}'} 作为笔记内容的占位符
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? '检查中...' : '保存设置'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
