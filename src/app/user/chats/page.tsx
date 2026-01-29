"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useToast } from "@/lib/hooks/useToast";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// Using div with overflow instead of ScrollArea
import { Send, Paperclip, Image as ImageIcon, X, Search } from "lucide-react";
import { motion } from "framer-motion";
import DashboardCard from "@/components/shared/DashboardCard";
import { getInitials } from "@/lib/utils/user";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatMessageTime, formatMessageDate, shouldShowDateSeparator } from "@/lib/utils/chat";

interface Conversation {
  _id: string;
  type: "direct" | "group";
  name?: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessage?: {
    _id: string;
    content?: string;
    senderId: {
      _id: string;
      name: string;
    };
    createdAt: string;
  };
  lastMessageAt?: string;
  createdAt?: string;
  currentUserParticipant?: {
    isArchived: boolean;
    isFavorited: boolean;
    isBanner: boolean;
    lastReadAt?: string;
  };
  unreadCount?: number;
}

interface Message {
  _id: string;
  conversationId?: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    role: string;
  };
  content?: string;
  attachments?: Array<{
    type: "image" | "file" | "document";
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
  }>;
  createdAt: string;
  isUnread?: boolean;
}

export default function UserChatsPage() {
  const toast = useToast();
  const { user: currentUser } = useUserProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastReadAt, setLastReadAt] = useState<Date | null>(null);
  const [draftAttachments, setDraftAttachments] = useState<Array<{
    file: File;
    preview?: string;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasMarkedAsReadRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Always call hook to maintain hook order
  const chatSocket = useChatSocket({
    conversationId: selectedConversation?._id,
    onNewMessage: (message) => {
      // Always check if message is for current conversation
      const messageConversationId = message.conversationId || (message as any).conversationId;
      
      // Update conversation list to show latest message
      if (messageConversationId) {
        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv._id === messageConversationId) {
              return {
                ...conv,
                lastMessage: {
                  _id: message._id,
                  content: message.content,
                  senderId: message.senderId,
                  createdAt: message.createdAt,
                },
                lastMessageAt: message.createdAt,
              };
            }
            return conv;
          });
        });
      }
      
      // Add message if it's for the current conversation
      if (selectedConversation && (
        messageConversationId === selectedConversation._id ||
        (!messageConversationId && selectedConversation._id)
      )) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          const newMessage = {
            ...message,
            isUnread: message.senderId._id !== currentUser?._id && 
                     (!lastReadAt || new Date(message.createdAt) > lastReadAt),
          };
          return [...prev, newMessage];
        });
        // Scroll to bottom when new message arrives (only if user is near bottom)
        scrollToBottom(false);
        
        // Mark as read if it's the current conversation and not from current user
        if (message.senderId._id !== currentUser?._id && !hasMarkedAsReadRef.current) {
          // Delay mark as read to avoid scroll conflicts
          setTimeout(() => markAsRead(), 1000);
        }
      }
    },
    onNotification: (data) => {
      // Update conversation list when new message arrives
      fetchConversations();
      
      // If this is for the current conversation, add the message
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) {
            return prev;
          }
          return [...prev, data.message];
        });
        // Scroll to bottom when new message arrives via notification (only if user is near bottom)
        scrollToBottom(false);
      } else if (selectedConversation?._id !== data.conversationId) {
        // Show toast notification for other conversations
        toast.info(`New message from ${data.message.senderId.name}`);
      }
    },
  });

  const sendMessage = chatSocket.sendMessage;
  const isConnected = chatSocket.isConnected || false;

  const scrollToBottom = useCallback((force = false) => {
    // Clear any pending scroll to prevent multiple scrolls
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.parentElement?.parentElement;
        if (container) {
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
          const isNearBottom = distanceFromBottom < 200; // Increased threshold
          
          // Only scroll if forced or user is near bottom
          if (force || isNearBottom) {
            messagesEndRef.current.scrollIntoView({ 
              behavior: force ? "auto" : "smooth", 
              block: "end",
              inline: "nearest"
            });
          }
        } else {
          // Fallback if container not found
          messagesEndRef.current.scrollIntoView({ 
            behavior: force ? "auto" : "smooth",
            block: "end"
          });
        }
      }
      scrollTimeoutRef.current = null;
    }, force ? 0 : 150); // Longer delay for non-forced scrolls
  }, []);

  const markAsRead = useCallback(async () => {
    if (!selectedConversation || hasMarkedAsReadRef.current) return;
    
    hasMarkedAsReadRef.current = true;
    
    try {
      await apiClient.post(`/api/chat/conversations/${selectedConversation._id}/read`);
      const now = new Date();
      setLastReadAt(now);
      
      // Update messages to mark as read (without triggering scroll)
      setMessages(prev => prev.map(msg => ({ ...msg, isUnread: false })));
      
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      // Reset after a delay to allow re-marking if needed
      setTimeout(() => {
        hasMarkedAsReadRef.current = false;
      }, 2000);
    }
  }, [selectedConversation]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<{ conversations: Conversation[] }>("/api/chat/conversations");
      setConversations(data.conversations || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load conversations";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await apiClient.get<{ messages: Message[] }>(
        `/api/chat/conversations/${conversationId}/messages?limit=50`
      );
      const fetchedMessages = data.messages || [];
      
      // Mark messages as read/unread based on lastReadAt
      const conversation = conversations.find(c => c._id === conversationId);
      const lastRead = conversation?.currentUserParticipant?.lastReadAt 
        ? new Date(conversation.currentUserParticipant.lastReadAt) 
        : null;
      
      const messagesWithUnread = fetchedMessages.map(msg => ({
        ...msg,
        isUnread: msg.senderId._id !== currentUser?._id && 
                 (!lastRead || new Date(msg.createdAt) > lastRead),
      }));
      
      setMessages(messagesWithUnread);
      setLastReadAt(lastRead);
      // Reset mark as read flag when loading new conversation
      hasMarkedAsReadRef.current = false;
      
      // Scroll to bottom when initially loading messages (only once, after render)
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        }, 200);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load messages";
      toast.error(message);
    }
  }, [toast, scrollToBottom, conversations, currentUser?._id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages([]); // Clear messages when switching conversations
      hasMarkedAsReadRef.current = false; // Reset flag
      fetchMessages(selectedConversation._id);
    } else {
      setMessages([]); // Clear messages when no conversation selected
      setLastReadAt(null);
      hasMarkedAsReadRef.current = false;
    }
  }, [selectedConversation?._id, fetchMessages]);
  
  // Mark as read when viewing conversation (only once when conversation is selected)
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && !hasMarkedAsReadRef.current) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 2000); // Delay to ensure user is viewing and avoid scroll conflicts
      return () => clearTimeout(timer);
    }
  }, [selectedConversation?._id]); // Only depend on conversation ID to avoid loops

  const handleSendMessage = async () => {
    if (!selectedConversation || (!messageInput.trim() && sending)) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      if (isConnected && selectedConversation._id) {
        try {
          await sendMessage(content);
          // Message will be added via WebSocket onNewMessage callback
        } catch (wsError) {
          console.error("WebSocket send failed, using REST API:", wsError);
          // Fallback to REST API if WebSocket fails
          await apiClient.post(`/api/chat/conversations/${selectedConversation._id}/messages`, {
            content,
          });
          // Refresh messages to show the new one
          await fetchMessages(selectedConversation._id);
        }
      } else {
        // Fallback to REST API if WebSocket not connected
        await apiClient.post(`/api/chat/conversations/${selectedConversation._id}/messages`, {
          content,
        });
        // Refresh messages to show the new one
        await fetchMessages(selectedConversation._id);
      }
    } catch (error) {
      toast.error("Failed to send message");
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) return;

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setDraftAttachments((prev) => [...prev, { file, preview }]);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-images, add to draft without preview
      setDraftAttachments((prev) => [...prev, { file }]);
    }
  };

  const removeDraftAttachment = (index: number) => {
    setDraftAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendDraftAttachments = async () => {
    if (!selectedConversation || draftAttachments.length === 0) return;

    setSending(true);
    try {
      // Upload all draft attachments
      const uploadedAttachments = await Promise.all(
        draftAttachments.map(async (draft) => {
          const formData = new FormData();
          formData.append("file", draft.file);
          const uploadRes = await apiClient.upload<{ attachment: any }>("/api/chat/upload", formData);
          return uploadRes.attachment;
        })
      );

      if (isConnected && selectedConversation._id) {
        try {
          await sendMessage(undefined, uploadedAttachments);
          setDraftAttachments([]);
        } catch (wsError) {
          console.error("WebSocket send failed, using REST API:", wsError);
          await apiClient.post(`/api/chat/conversations/${selectedConversation._id}/messages`, {
            attachments: uploadedAttachments,
          });
          await fetchMessages(selectedConversation._id);
          setDraftAttachments([]);
        }
      } else {
        await apiClient.post(`/api/chat/conversations/${selectedConversation._id}/messages`, {
          attachments: uploadedAttachments,
        });
        await fetchMessages(selectedConversation._id);
        setDraftAttachments([]);
      }
    } catch (error) {
      console.error("File upload error:", error);
      const message = error instanceof Error ? error.message : "Failed to upload file";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const otherParticipants = conv.participants.filter((p) => p._id !== currentUser?._id);
    return (
      conv.name?.toLowerCase().includes(query) ||
      otherParticipants.some((p) => p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query))
    );
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.type === "group" && conv.name) return conv.name;
    const otherParticipants = conv.participants.filter((p) => p._id !== currentUser?._id);
    return otherParticipants[0]?.name || "Unknown";
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === "group") return null;
    const otherParticipants = conv.participants.filter((p) => p._id !== currentUser?._id);
    return otherParticipants[0]?.profileImage;
  };

  const getUnreadCount = (conv: Conversation) => {
    if (!conv.lastMessage) return 0;
    if (!lastReadAt) {
      // If no lastReadAt, check if last message is from someone else
      return conv.lastMessage.senderId._id !== currentUser?._id ? 1 : 0;
    }
    const lastMessageTime = new Date(conv.lastMessageAt || conv.lastMessage.createdAt);
    return lastMessageTime > lastReadAt && conv.lastMessage.senderId._id !== currentUser?._id ? 1 : 0;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?._id === conv._id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {getConversationAvatar(conv) && (
                        <AvatarImage src={getConversationAvatar(conv)!} alt={getConversationName(conv)} />
                      )}
                      <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                        {getInitials(getConversationName(conv))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-medium truncate ${getUnreadCount(conv) > 0 ? "font-bold" : ""}`}>
                          {getConversationName(conv)}
                        </p>
                        <div className="flex items-center gap-1">
                          {getUnreadCount(conv) > 0 && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                          {conv.currentUserParticipant?.isFavorited && (
                            <Badge variant="outline" className="text-xs">⭐</Badge>
                          )}
                        </div>
                      </div>
                      {conv.lastMessage && (
                        <p className={`text-xs truncate ${getUnreadCount(conv) > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {conv.lastMessage.content || "Attachment"}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {getConversationAvatar(selectedConversation) && (
                    <AvatarImage
                      src={getConversationAvatar(selectedConversation)!}
                      alt={getConversationName(selectedConversation)}
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white">
                    {getInitials(getConversationName(selectedConversation))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{getConversationName(selectedConversation)}</p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const previousMessage = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
                  const isUnread = message.isUnread && message.senderId._id !== currentUser?._id;
                  const isMyMessage = message.senderId._id === currentUser?._id;
                  const showSeenIndicator = isMyMessage && 
                    lastReadAt && 
                    new Date(message.createdAt) <= lastReadAt &&
                    index === messages.length - 1;

                  return (
                    <div key={message._id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                            {formatMessageDate(message.createdAt)}
                          </div>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 items-start ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMyMessage && (
                          <Avatar className="h-8 w-8">
                            {message.senderId.profileImage && (
                              <AvatarImage src={message.senderId.profileImage} alt={message.senderId.name} />
                            )}
                            <AvatarFallback className="bg-gradient-to-r from-[#B260E6] to-[#ED84A5] text-white text-xs">
                              {getInitials(message.senderId.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col max-w-[70%]">
                          <div
                            className={`rounded-lg p-3 relative ${
                              isMyMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            } ${isUnread ? "ring-2 ring-primary/50" : ""}`}
                          >
                            {!isMyMessage && (
                              <p className="text-xs mb-1 font-medium">
                                {message.senderId.name}
                              </p>
                            )}
                            {isUnread && !isMyMessage && (
                              <div className="mb-1">
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                  New message
                                </Badge>
                              </div>
                            )}
                            {message.content && (
                              <p className="text-sm">
                                {message.content}
                              </p>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((att, idx) => (
                                  <div key={idx} className="space-y-1">
                                    {att.type === "image" ? (
                                      <img
                                        src={att.url}
                                        alt={att.filename}
                                        className="max-w-full rounded-lg max-h-64 object-cover"
                                      />
                                    ) : (
                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm underline"
                                      >
                                        <Paperclip className="h-4 w-4" />
                                        {att.filename}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className={`text-xs mt-1 ${isMyMessage ? "opacity-70" : "opacity-60"}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                          {showSeenIndicator && (
                            <p className="text-xs text-muted-foreground mt-1 text-right">Seen</p>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Draft Attachments Preview */}
            {draftAttachments.length > 0 && (
              <div className="p-4 border-t bg-muted/50">
                <div className="flex flex-wrap gap-2 mb-2">
                  {draftAttachments.map((draft, idx) => (
                    <div key={idx} className="relative">
                      {draft.preview ? (
                        <div className="relative">
                          <img
                            src={draft.preview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => removeDraftAttachment(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative border rounded-lg p-2 bg-background">
                          <Paperclip className="h-4 w-4" />
                          <p className="text-xs truncate max-w-[60px]">{draft.file.name}</p>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => removeDraftAttachment(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDraftAttachments([])}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={sendDraftAttachments}
                    disabled={sending}
                  >
                    {sending ? "Sending..." : `Send ${draftAttachments.length} file${draftAttachments.length > 1 ? "s" : ""}`}
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    // Reset input
                    if (e.target) e.target.value = "";
                  }}
                  accept="image/*,application/pdf,.doc,.docx"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={(!messageInput.trim() && draftAttachments.length === 0) || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
