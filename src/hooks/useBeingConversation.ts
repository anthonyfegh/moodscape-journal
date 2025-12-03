import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BeingState } from "@/consciousness";

interface Message {
  id: string;
  role: "user" | "being";
  content: string;
  recalledMemories?: RecalledMemory[];
  timestamp: Date;
}

interface RecalledMemory {
  id: string;
  moment_id: string;
  text: string;
  timestamp: string;
  emotional_tone: string;
  similarity: number;
}

export const useBeingConversation = (userId: string | undefined, beingState: BeingState) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalling, setIsRecalling] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const recallMemories = useCallback(async (query: string): Promise<RecalledMemory[]> => {
    if (!userId) return [];
    
    setIsRecalling(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recall-memories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            query,
            userId,
            limit: 5,
            threshold: 0.3,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to recall memories:", response.status);
        return [];
      }

      const data = await response.json();
      return data.memories || [];
    } catch (error) {
      console.error("Error recalling memories:", error);
      return [];
    } finally {
      setIsRecalling(false);
    }
  }, [userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Recall relevant memories
    const recalledMemories = await recallMemories(content);

    // Create placeholder for being response
    const beingMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: beingMessageId,
      role: "being",
      content: "",
      recalledMemories,
      timestamp: new Date(),
    }]);

    // Prepare conversation history for context
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/being-conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: content,
            userId,
            conversationHistory,
            beingState,
            recalledMemories,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let beingContent = "";
      let textBuffer = "";
      let streamDone = false;

      const processLine = (line: string) => {
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") return;
        if (!line.startsWith("data: ")) return;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (deltaContent) {
            beingContent += deltaContent;
            setMessages(prev => prev.map(m => 
              m.id === beingMessageId 
                ? { ...m, content: beingContent }
                : m
            ));
          }
        } catch (e) {
          console.log("Parse error (likely incomplete JSON):", e);
        }
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          const line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          processLine(line);
          if (streamDone) break;
        }
      }

      // Final flush - process any remaining content
      if (textBuffer.trim()) {
        for (const line of textBuffer.split("\n")) {
          if (line.trim()) processLine(line);
        }
      }

      // Store messages in database
      const stateJson = JSON.parse(JSON.stringify(beingState));
      await supabase.from("conversation_messages").insert([
        {
          user_id: userId,
          role: "user",
          content: userMessage.content,
          being_state_at_message: stateJson,
        },
        {
          user_id: userId,
          role: "being",
          content: beingContent,
          recalled_memories: recalledMemories.map(m => m.id),
          being_state_at_message: stateJson,
        },
      ]);

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error in conversation:", error);
        setMessages(prev => prev.map(m => 
          m.id === beingMessageId 
            ? { ...m, content: "I'm having trouble connecting right now. Can we try again?" }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [userId, messages, beingState, recallMemories]);

  const loadConversationHistory = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as "user" | "being",
        content: m.content,
        timestamp: new Date(m.created_at),
      })));
    }
  }, [userId]);

  const cancelResponse = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    isRecalling,
    sendMessage,
    loadConversationHistory,
    cancelResponse,
  };
};
