import { create } from 'zustand'
import type { Message, ToolCall } from '@/types'

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  partialMessage: string | null
  currentToolCalls: ToolCall[]

  addUserMessage: (text: string) => void
  updateStreamingMessage: (text: string) => void
  finalizeAssistantMessage: (text: string, toolCalls?: ToolCall[]) => void
  addToolCall: (toolCall: ToolCall) => void
  setStreaming: (streaming: boolean) => void
  clearMessages: () => void
  loadMessages: (msgs: Message[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  partialMessage: null,
  currentToolCalls: [],

  addUserMessage: (text) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  updateStreamingMessage: (text) =>
    set({ partialMessage: text }),

  finalizeAssistantMessage: (text, toolCalls) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: text,
          toolCalls: toolCalls || (s.currentToolCalls.length > 0 ? [...s.currentToolCalls] : undefined),
          timestamp: new Date().toISOString(),
        },
      ],
      partialMessage: null,
      currentToolCalls: [],
      isStreaming: false,
    })),

  addToolCall: (toolCall) =>
    set((s) => ({ currentToolCalls: [...s.currentToolCalls, toolCall] })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  clearMessages: () => set({ messages: [], partialMessage: null, currentToolCalls: [] }),

  loadMessages: (messages) => set({ messages, partialMessage: null, currentToolCalls: [] }),
}))
