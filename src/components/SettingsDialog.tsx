
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

const SettingsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<MCPConfig>(mcpService.getConfig());
  const [status, setStatus] = useState<MCPStatus>({ connected: false });
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
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

  const handleSave = () => {
    mcpService.saveConfig(config);
    checkStatus();
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
          <DialogTitle>MCP 设置</DialogTitle>
        </DialogHeader>
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
                <Label className="text-right">工具数量</Label>
                <div className="col-span-3">
                  <span className="text-sm text-muted-foreground">{status.toolCount || 0} 个工具</span>
                </div>
              </div>
            </>
          )}
        </div>
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
