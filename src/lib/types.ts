export type BuddyStatus = "online" | "away" | "busy" | "invisible";

export interface Buddy {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  provider: string;
  model: string;
  systemPrompt: string | null;
  statusFlavor: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  buddyId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  modelUsed: string | null;
  createdAt: string;
}

export type EventKind =
  | "model_switch"
  | "fallback"
  | "tool_start"
  | "tool_end"
  | "error";

export interface ConversationEvent {
  id: string;
  conversationId: string;
  kind: EventKind;
  payloadJson: string;
  createdAt: string;
}
