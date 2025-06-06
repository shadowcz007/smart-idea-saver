import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LightbulbIcon, SaveIcon } from 'lucide-react';
import ProcessingStatus, { ProcessStage } from './ProcessingStatus';
import SettingsDialog from './SettingsDialog';
import mcpService from '@/services/MCPService';
import { toast } from 'sonner';

const NoteTaking: React.FC = () => {
  const [noteText, setNoteText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<ProcessStage>(ProcessStage.Idle);
  const [isInspiration, setIsInspiration] = useState(false);
  const [result, setResult] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [streamingData, setStreamingData] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(300, textarea.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [noteText]);

  const processNote = async () => {
    if (!noteText.trim()) {
      toast.error('请输入笔记内容');
      return;
    }

    setIsInspiration(false);
    setProcessing(true);
    setStage(ProcessStage.Understanding);
    setResult(undefined);
    setError(undefined);
    setStreamingData('');

    try {

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 调用 MCP 服务处理笔记
      const response = await mcpService.processNote(noteText, (data: any) => {
        if (data.status === 'function_call_start') {
          console.log('开始处理知识工具')
          // 进入参数生成阶段
          setStage(ProcessStage.GeneratingParameters);
        } else if (data.status === 'function_call') {
          console.log('处理知识工具中', data.data)
          // 继续保持在参数生成阶段
          setStage(ProcessStage.GeneratingParameters);
          // 更新流式数据
          if (data.data) {
            setStreamingData(prev => prev ? `${prev + data.data}` : data.data);
          }
        } else if (data.status === 'save') {
          console.log('保存知识工具', data.data)
          // 进入保存阶段
          setStage(ProcessStage.Saving);
        }
      });

      // 完成
      setStage(ProcessStage.Done);
      setResult(response);
    } catch (error) {
      console.error('Failed to process note:', error);
      setStage(ProcessStage.Error);
      setError(error instanceof Error ? error.message : '处理笔记失败');
      toast.error('处理笔记时出错');
    } finally {
      setProcessing(false);
    }
  };

  const generateInspiration = async () => {
    // if (!noteText.trim()) {
    //   toast.error('请输入笔记内容');
    //   return;
    // }

    setIsInspiration(true);
    setProcessing(true);
    setStage(ProcessStage.FetchingKnowledge);
    setResult(undefined);
    setError(undefined);
    setStreamingData('');

    try {
      // 从 MCP 获取知识
      const knowledge = await mcpService.getKnowledge();
      console.log('获取知识', knowledge)
      // 生成灵感
      setStage(ProcessStage.GeneratingInspiration);
      const inspiration = await mcpService.generateInspiration(noteText||'', knowledge);

      // 完成
      setStage(ProcessStage.Done);
      setResult(inspiration);
    } catch (error) {
      console.error('Failed to generate inspiration:', error);
      setStage(ProcessStage.Error);
      setError(error instanceof Error ? error.message : '生成灵感失败');
      toast.error('生成灵感时出错');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SettingsDialog />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-center">笔记处理工具</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：文本输入区 */}
          <div className="flex flex-col space-y-4">
            <Textarea
              ref={textareaRef}
              placeholder="在此输入你的笔记..."
              className="flex-1 min-h-[300px] p-4 overflow-hidden"
              value={noteText}
              onChange={handleNoteChange}
              disabled={processing}
            />

            <div className="flex space-x-4">
              <Button
                className="flex-1"
                onClick={processNote}
                disabled={processing}
              >
                <SaveIcon className="mr-2 h-4 w-4" />
                处理笔记
              </Button>

              <Button
                className="flex-1"
                variant="secondary"
                onClick={generateInspiration}
                disabled={processing}
              >
                <LightbulbIcon className="mr-2 h-4 w-4" />
                获取灵感
              </Button>
            </div>
          </div>

          {/* 右侧：处理状态区 */}
          <div className="min-h-[400px]">
            <ProcessingStatus
              stage={stage}
              isInspiration={isInspiration}
              result={result}
              error={error}
              streamingData={streamingData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTaking;
