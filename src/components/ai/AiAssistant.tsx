import { MessageCircleIcon } from 'lucide-react';
import { connection } from 'next/server';
import { isAiChatConfigured } from '@/lib/ai/config';
import { AISearch, AISearchPanel, AISearchTrigger } from './search';

export async function AiAssistant() {
  await connection();
  if (!isAiChatConfigured()) return null;

  return (
    <AISearch>
      <AISearchPanel />
      <AISearchTrigger position="float">
        <MessageCircleIcon className="size-4.5" aria-hidden />
        Ask AI
      </AISearchTrigger>
    </AISearch>
  );
}
