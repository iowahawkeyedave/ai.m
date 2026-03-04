 "use client";

import { useEffect, useState } from "react";
import { BuddyList } from "@/components/buddies/BuddyList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Buddy, Conversation, ConversationEvent, Message } from "@/lib/types";

interface BuddiesResponse {
  buddies: Buddy[];
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface CreateConversationResponse {
  conversation: Conversation;
}

interface MessagesResponse {
  messages: Message[];
}

interface CreateMessageResponse {
  message: Message;
}

interface UpdateBuddyResponse {
  buddy: Buddy;
}

interface EventsResponse {
  events: ConversationEvent[];
}

interface OpenClawProxyResponse {
  assistantText: string;
  modelUsed: string;
  events: Array<{
    kind: ConversationEvent["kind"];
    payload: Record<string, unknown>;
  }>;
}

export default function Home() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [activeBuddyId, setActiveBuddyId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    null,
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<ConversationEvent[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBuddies() {
      try {
        const response = await fetch("/api/buddies");
        if (!response.ok) {
          throw new Error(`Failed to load buddies (${response.status})`);
        }

        const data = (await response.json()) as BuddiesResponse;
        setBuddies(data.buddies);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load buddies";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadBuddies();
  }, []);

  async function openOrCreateConversation(buddyId: string) {
    setActiveBuddyId(buddyId);
    setError(null);
    setMessages([]);
    setEvents([]);
    setDraftMessage("");
    setIsLoadingMessages(true);

    try {
      const listResponse = await fetch(
        `/api/conversations?buddyId=${encodeURIComponent(buddyId)}`,
      );
      if (!listResponse.ok) {
        throw new Error(`Failed to load conversations (${listResponse.status})`);
      }

      const listData = (await listResponse.json()) as ConversationsResponse;
      const existing = listData.conversations[0];
      if (existing) {
        setActiveConversation(existing);
        setActiveConversationId(existing.id);
        return;
      }

      const createResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ buddyId }),
      });
      if (!createResponse.ok) {
        throw new Error(`Failed to create conversation (${createResponse.status})`);
      }

      const createData = (await createResponse.json()) as CreateConversationResponse;
      setActiveConversation(createData.conversation);
      setActiveConversationId(createData.conversation.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to open conversation";
      setError(message);
    } finally {
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `/api/conversations/${encodeURIComponent(activeConversationId)}/messages`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load messages (${response.status})`);
        }

        const data = (await response.json()) as MessagesResponse;
        setMessages(data.messages);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load messages";
        setError(message);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    async function loadEvents() {
      if (!activeConversationId) {
        setEvents([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/conversations/${encodeURIComponent(activeConversationId)}/events`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load events (${response.status})`);
        }

        const data = (await response.json()) as EventsResponse;
        setEvents(data.events);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load events";
        setError(message);
      }
    }

    void loadEvents();
  }, [activeConversationId]);

  const activeBuddy = buddies.find((buddy) => buddy.id === activeBuddyId) ?? null;

  async function sendMessage() {
    if (!activeConversationId || !activeBuddy || isSendingMessage) {
      return;
    }

    const content = draftMessage.trim();
    if (!content) {
      return;
    }

    setIsSendingMessage(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/conversations/${encodeURIComponent(activeConversationId)}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role: "user", content }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }

      const data = (await response.json()) as CreateMessageResponse;
      setMessages((current) => [...current, data.message]);
      setDraftMessage("");

      const proxyResponse = await fetch("/api/proxy/openclaw", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: content,
          buddyModel: activeBuddy.model,
        }),
      });

      if (!proxyResponse.ok) {
        throw new Error(`OpenClaw proxy failed (${proxyResponse.status})`);
      }

      const proxyData = (await proxyResponse.json()) as OpenClawProxyResponse;

      if (proxyData.assistantText.trim()) {
        const assistantResponse = await fetch(
          `/api/conversations/${encodeURIComponent(activeConversationId)}/messages`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              role: "assistant",
              content: proxyData.assistantText,
              modelUsed: proxyData.modelUsed,
            }),
          },
        );

        if (!assistantResponse.ok) {
          throw new Error(
            `Failed to persist assistant message (${assistantResponse.status})`,
          );
        }

        const assistantData =
          (await assistantResponse.json()) as CreateMessageResponse;
        setMessages((current) => [...current, assistantData.message]);
      }

      for (const event of proxyData.events) {
        await fetch(
          `/api/conversations/${encodeURIComponent(activeConversationId)}/events`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              kind: event.kind,
              payload: event.payload,
            }),
          },
        );
      }

      const eventsResponse = await fetch(
        `/api/conversations/${encodeURIComponent(activeConversationId)}/events`,
      );
      if (eventsResponse.ok) {
        const eventsData = (await eventsResponse.json()) as EventsResponse;
        setEvents(eventsData.events);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function switchModel(next: { model: string; provider: string }) {
    if (!activeBuddy || isSwitchingModel) {
      return;
    }

    const previousModel = activeBuddy.model;
    if (previousModel === next.model && activeBuddy.provider === next.provider) {
      return;
    }

    setIsSwitchingModel(true);
    setError(null);

    try {
      const response = await fetch(`/api/buddies/${encodeURIComponent(activeBuddy.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: next.model, provider: next.provider }),
      });

      if (!response.ok) {
        throw new Error(`Failed to switch model (${response.status})`);
      }

      const data = (await response.json()) as UpdateBuddyResponse;
      setBuddies((current) =>
        current.map((buddy) => (buddy.id === data.buddy.id ? data.buddy : buddy)),
      );

      if (activeConversationId) {
        const eventResponse = await fetch(
          `/api/conversations/${encodeURIComponent(activeConversationId)}/events`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              kind: "model_switch",
              payload: {
                buddyId: activeBuddy.id,
                fromModel: previousModel,
                toModel: next.model,
              },
            }),
          },
        );
        if (eventResponse.ok) {
          const eventsResponse = await fetch(
            `/api/conversations/${encodeURIComponent(activeConversationId)}/events`,
          );
          if (eventsResponse.ok) {
            const data = (await eventsResponse.json()) as EventsResponse;
            setEvents(data.events);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to switch model";
      setError(message);
    } finally {
      setIsSwitchingModel(false);
    }
  }

  const latestFallbackEvent = [...events]
    .reverse()
    .find((event) => event.kind === "fallback");

  const fallbackBanner = (() => {
    if (!latestFallbackEvent) {
      return null;
    }

    try {
      const payload = JSON.parse(latestFallbackEvent.payloadJson) as {
        reason?: string;
        fromModel?: string;
        toModel?: string;
      };
      const reason = payload.reason ?? "unknown_reason";
      const fromModel = payload.fromModel ?? "unknown";
      const toModel = payload.toModel ?? "unknown";
      return `${fromModel} -> ${toModel} (${reason})`;
    } catch {
      return latestFallbackEvent.payloadJson;
    }
  })();

  return (
    <div className="min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 md:px-6">
      <main className="mx-auto grid max-w-6xl gap-3 md:grid-cols-[280px_minmax(0,1fr)] md:gap-4">
        <BuddyList
          buddies={buddies}
          activeBuddyId={activeBuddyId}
          onSelectBuddy={openOrCreateConversation}
        />
        <div className="min-w-0 space-y-2 sm:space-y-3">
          <ChatWindow
            buddy={activeBuddy}
            conversation={activeConversation}
            messages={messages}
            events={events}
            fallbackBanner={fallbackBanner}
            isLoadingMessages={isLoadingMessages}
            isSwitchingModel={isSwitchingModel}
            draftMessage={draftMessage}
            isSendingMessage={isSendingMessage}
            onDraftMessageChange={setDraftMessage}
            onSendMessage={sendMessage}
            onModelSwitch={switchModel}
          />
          {loading ? <p className="text-xs text-zinc-500">Loading buddies...</p> : null}
          {activeConversationId ? (
            <p className="truncate text-xs text-zinc-500">
              Active conversation id: {activeConversationId}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
