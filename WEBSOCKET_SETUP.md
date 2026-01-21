# WebSocket Setup Guide

This guide explains how the WebSocket (Socket.io) real-time communication system is set up for JobSync.

## Overview

The application now uses WebSocket for real-time two-way communication for:
- **Chat**: Real-time messaging between users, employers, and admins
- **Blogs**: Real-time blog creation, likes, and comments
- **Success Stories**: Real-time comments and interactions

## Architecture

### Server-Side (`src/lib/websocket/server.ts`)

The Socket.io server is initialized in a custom Next.js server (`server.js`) and handles:
- Authentication via JWT tokens
- Chat events (join, leave, send message, typing indicators)
- Blog events (create, like, comment)
- Success story events (comment, like)

### Client-Side Hooks

- **`useSocket`** (`src/hooks/useSocket.ts`): Base hook for Socket.io connection
- **`useChatSocket`** (`src/hooks/useChatSocket.ts`): Chat-specific WebSocket functionality
- **`useBlogSocket`** (`src/hooks/useBlogSocket.ts`): Blog-specific WebSocket functionality
- **`useStorySocket`** (`src/hooks/useStorySocket.ts`): Success story-specific WebSocket functionality

## File Storage

### Chat Files/Photos

All files and photos sent in chat are stored in **Supabase Storage**:
- Location: `chat/{userId}/` folder in Supabase bucket
- Chat history (messages, metadata) is stored in **MongoDB**
- The upload route (`src/app/api/chat/upload/route.ts`) uses the unified `uploadFile` function which automatically uses Supabase if configured

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# App URL (for WebSocket CORS)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=jobsync-uploads
```

### 2. Running the Server

The application now uses a custom server (`server.js`) that integrates Socket.io:

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 3. Using WebSocket in Components

#### Chat Example

```tsx
import { useChatSocket } from "@/hooks/useChatSocket";

function ChatComponent({ conversationId }: { conversationId: string }) {
  const { sendMessage, setTyping, isConnected } = useChatSocket({
    conversationId,
    onNewMessage: (message) => {
      console.log("New message:", message);
      // Update UI with new message
    },
    onTyping: (data) => {
      console.log("User typing:", data);
      // Show typing indicator
    },
  });

  const handleSend = async () => {
    try {
      await sendMessage("Hello!", []);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={handleSend}>Send Message</button>
      ) : (
        <p>Connecting...</p>
      )}
    </div>
  );
}
```

#### Blog Example

```tsx
import { useBlogSocket } from "@/hooks/useBlogSocket";

function BlogComponent() {
  const { createBlog, likeBlog, commentOnBlog } = useBlogSocket({
    onNewBlog: (blog) => {
      console.log("New blog:", blog);
      // Add to blog list
    },
    onBlogLikeUpdate: (data) => {
      console.log("Blog like updated:", data);
      // Update blog in UI
    },
    onNewComment: (data) => {
      console.log("New comment:", data);
      // Add comment to blog
    },
  });

  const handleCreateBlog = async () => {
    try {
      const blog = await createBlog({
        title: "My Blog Post",
        content: "Blog content...",
        tags: ["tech", "jobs"],
      });
      console.log("Blog created:", blog);
    } catch (error) {
      console.error("Failed to create blog:", error);
    }
  };

  return <button onClick={handleCreateBlog}>Create Blog</button>;
}
```

## WebSocket Events

### Chat Events

**Client → Server:**
- `chat:join` - Join a conversation room
- `chat:leave` - Leave a conversation room
- `chat:message` - Send a message
- `chat:typing` - Send typing indicator

**Server → Client:**
- `chat:joined` - Confirmation of joining
- `chat:message:new` - New message received
- `chat:typing` - User typing indicator
- `chat:notification` - New message notification (when not in room)
- `chat:error` - Error occurred

### Blog Events

**Client → Server:**
- `blog:create` - Create a new blog post
- `blog:like` - Like/unlike a blog
- `blog:comment` - Comment on a blog

**Server → Client:**
- `blog:new` - New blog created (broadcast to all)
- `blog:created` - Confirmation of blog creation
- `blog:like:update` - Blog like status updated (broadcast)
- `blog:liked` - Confirmation of like action
- `blog:comment:new` - New comment added (broadcast)
- `blog:commented` - Confirmation of comment
- `blog:error` - Error occurred

### Success Story Events

**Client → Server:**
- `story:comment` - Comment on a success story
- `story:like` - Like/unlike a success story

**Server → Client:**
- `story:comment:new` - New comment added (broadcast)
- `story:commented` - Confirmation of comment
- `story:error` - Error occurred

## Authentication

WebSocket connections are authenticated using JWT tokens:
1. Client sends token in `auth.token` during connection
2. Server verifies token using `verifyTokenEdge`
3. If valid, connection is established with `userId` and `userRole` attached to socket
4. If invalid, connection is rejected

## Data Storage

- **MongoDB**: All chat messages, blog posts, comments, and conversation metadata
- **Supabase Storage**: All files and photos sent in chat (stored in `chat/{userId}/` folder)

## Migration from REST API

The REST API endpoints are still available for backward compatibility, but new features should use WebSocket for real-time updates. To migrate:

1. Replace API calls with WebSocket events
2. Use the appropriate hooks (`useChatSocket`, `useBlogSocket`, `useStorySocket`)
3. Handle real-time updates via event listeners

## Troubleshooting

### Connection Issues

1. Check that `NEXT_PUBLIC_APP_URL` is set correctly
2. Verify JWT token is being sent in connection
3. Check server logs for authentication errors
4. Ensure custom server (`server.js`) is running

### File Upload Issues

1. Verify Supabase credentials are set
2. Check Supabase bucket exists and is public
3. Verify file size limits (max 10MB for chat files)
4. Check file type restrictions

## Next Steps

To fully migrate to WebSocket:
1. Update chat UI components to use `useChatSocket`
2. Update blog pages to use `useBlogSocket`
3. Update success story pages to use `useStorySocket`
4. Remove REST API calls where WebSocket is used
