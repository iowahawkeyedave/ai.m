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
  const onlineBuddyCount = buddies.filter((buddy) => buddy.statusFlavor !== "invisible").length;

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
      const streamResponse = await fetch(
        `/api/conversations/${encodeURIComponent(activeConversationId)}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content, stream: true }),
        },
      );

      if (!streamResponse.ok) {
        throw new Error(`Failed to stream assistant response (${streamResponse.status})`);
      }

      const reader = streamResponse.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        // Consume SSE until done; persisted messages/events are fetched below.
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          decoder.decode(value, { stream: true });
        }
      }

      const [messagesResponse, eventsResponse] = await Promise.all([
        fetch(`/api/conversations/${encodeURIComponent(activeConversationId)}/messages`),
        fetch(`/api/conversations/${encodeURIComponent(activeConversationId)}/events`),
      ]);

      if (messagesResponse.ok) {
        const messagesData = (await messagesResponse.json()) as MessagesResponse;
        setMessages(messagesData.messages);
      }

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
    <div className="min-h-screen px-2 py-3 sm:px-4 sm:py-5 md:px-6">
      <main className="aim-window mx-auto max-w-6xl p-2 md:p-3">
        <header className="aim-titlebar mb-2 rounded-[3px] px-2 py-1 text-xs font-semibold sm:text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate tracking-wide">
              AOL Instant Messenger for Models - Welcome, dave
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <span className="aim-system-btn" data-kind="min" aria-hidden="true" />
              <span className="aim-system-btn" data-kind="max" aria-hidden="true" />
              <span className="aim-system-btn" data-kind="close" aria-hidden="true" />
            </span>
          </div>
        </header>
        <div className="aim-menu mb-1 rounded-[2px] px-2 py-1 text-[11px] text-[#173b7f] sm:text-xs">
          <span className="aim-menu-item mr-1 font-semibold">File</span>
          <span className="aim-menu-item mr-1 font-semibold">Edit</span>
          <span className="aim-menu-item mr-1 font-semibold">People</span>
          <span className="aim-menu-item mr-1 font-semibold">Tools</span>
          <span className="aim-menu-item mr-1 font-semibold">Help</span>
        </div>
        <div className="aim-toolbar mb-3 flex flex-wrap items-center gap-1 rounded-[2px] px-2 py-1">
          <span className="aim-toolbar-btn px-2 py-0.5 text-[11px] font-semibold">IM</span>
          <span className="aim-toolbar-btn px-2 py-0.5 text-[11px] font-semibold">Info</span>
          <span className="aim-toolbar-btn px-2 py-0.5 text-[11px] font-semibold">Away</span>
          <span className="aim-toolbar-btn px-2 py-0.5 text-[11px] font-semibold">Prefs</span>
        </div>
        <div className="grid gap-3 md:grid-cols-[280px_minmax(0,1fr)] md:gap-4">
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
            {loading ? (
              <p className="px-1 text-xs text-[#213f7b]">Loading buddies...</p>
            ) : null}
            {activeConversationId ? (
              <p className="truncate px-1 text-xs text-[#213f7b]">
                Active conversation id: {activeConversationId}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-sm border border-[#b74f4f] bg-[#ffe6e6] px-3 py-2 text-sm text-[#7c1f1f]">
                {error}
              </p>
            ) : null}
          </div>
        </div>
        <footer className="aim-statusbar mt-3 grid gap-1 rounded-[2px] px-2 py-1 text-[11px] text-[#173b7f] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-2">
          <span className="aim-inset truncate bg-[#f5f8ff] px-2 py-0.5">
            {activeBuddy ? `Chatting with ${activeBuddy.displayName}` : "Ready"}
          </span>
          <span className="aim-inset bg-[#f5f8ff] px-2 py-0.5">Buddies online: {onlineBuddyCount}</span>
          <span className="aim-inset bg-[#f5f8ff] px-2 py-0.5 text-right">Secure connection</span>
        </footer>
      </main>
    </div>
  );
}
