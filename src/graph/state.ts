import { Annotation } from '@langchain/langgraph';

export const StateAnnotation = Annotation.Root({
  question: Annotation<string>(),

  answer: Annotation<string>(),

  next: Annotation<'rag' | 'mcp' | 'llm'>(),

  context: Annotation<string>(),

  toolName: Annotation<string>(),

  toolArgs: Annotation<
    Record<string, unknown> | Array<Record<string, unknown>>
  >(),

  toolResult: Annotation<string>(),

  // Apakah tool berhasil dieksekusi
  toolSuccess: Annotation<boolean>(),

  // Apakah proses MCP sudah selesai
  isCompleted: Annotation<boolean>(),

  // ini state validator 
  validator: Annotation<string>(),

  userId: Annotation<string>(),
});