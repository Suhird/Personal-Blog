# gRPC vs GraphQL: Choosing the Right Protocol

Last month I was building a real-time collaboration tool — think shared documents, live cursors, the works. My first instinct was to just use REST everywhere. Clean, simple, everyone's familiar with it.

Then the performance tests hit. And I mean *hit*.

Loading a document with 50 concurrent users? My REST endpoints were dying. WebSocket connections for real-time updates were turning into a tangled mess of polling fallbacks. I needed a different approach.

That's when I finally sat down and deeply understood gRPC and GraphQL. Not just the buzzwords — actually *got* when to use each. Let me save you the weeks I spent on this.

## The Short Answer

gRPC and GraphQL solve different problems. Comparing them directly is like comparing a sports car to a bus — both are vehicles, but you'd be confused if someone asked "which is better?"

- **gRPC**: High-performance, low-latency communication between services. Your microservices talking to each other.
- **GraphQL**: Flexible data fetching for clients. Your mobile app talking to your backend.

Most companies with mature systems use *both*. gRPC for the plumbing inside the house, GraphQL for the front door where clients come in.

## The Real Difference

The fundamental distinction is this:

- **gRPC** is about *calling functions* on other services. "Give me a User" or "Process this Order" — clear operations with fixed inputs and outputs.
- **GraphQL** is about *querying data*. "I need the user's name, their recent orders, and the first product image from each order" — flexible, nested data requirements.

```
gRPC: Client says "do X" → Server does X → Returns result
GraphQL: Client says "give me A, B, C from X" → Server returns exactly A, B, C
```

## Building a Real Example: Chat Application

Let me walk through a chat application I built. This will show where each technology genuinely shines.

### The Problem

My chat app has:
- **Messages**: text, images, read receipts
- **Channels**: group conversations
- **Users**: profiles, presence, typing indicators
- **Real-time**: new messages, typing, presence updates

Internal services handle message delivery, notifications, and user presence. External clients (web, mobile) fetch history and receive real-time updates.

### Where gRPC Wins: Service-to-Service Communication

Inside my architecture, the notification service needs to talk to the message service constantly. It needs to know when a message arrives, who should be notified, and how to route push notifications.

Here's my message service proto file:

```protobuf:proto/message.proto
syntax = "proto3";

package chatservice;

service MessageService {
  rpc SendMessage(SendMessageRequest) returns (MessageResponse);
  rpc GetMessages(GetMessagesRequest) returns (MessagesResponse);
  rpc StreamMessages(StreamMessagesRequest) returns (stream Message);
}

message Message {
  string id = 1;
  string channel_id = 2;
  string sender_id = 3;
  string content = 4;
  MessageType type = 5;
  int64 timestamp = 6;
  bytes attachment = 7;  // Binary image data
  repeated string read_by = 8;
}

enum MessageType {
  TEXT = 0;
  IMAGE = 1;
  SYSTEM = 2;
}

message SendMessageRequest {
  string channel_id = 1;
  string sender_id = 2;
  string content = 3;
  MessageType type = 4;
  bytes attachment = 5;
}

message MessageResponse {
  Message message = 1;
  bool stored = 2;
}
```

The notification service calls this with a simple Go client:

```go:notification/service.go
func (n *NotificationService) OnNewMessage(ctx context.Context, msg *chatpb.Message) error {
    // Get channel participants who need notifications
    participants, err := n.userClient.GetChannelParticipants(ctx, msg.ChannelId)

    // Send push to each participant
    for _, user := range participants {
        if user.Id != msg.SenderId && user.PushToken != "" {
            push := &PushNotification{
                Token: user.PushToken,
                Title: fmt.Sprintf("New message from %s", msg.SenderName),
                Body:  truncateContent(msg.Content, 100),
                Data: map[string]string{
                    "message_id": msg.Id,
                    "channel_id": msg.ChannelId,
                },
            }
            n.SendPush(ctx, push)
        }
    }
    return nil
}
```

Why does this work so well?

1. **Binary protobuf** — Message payloads are tiny. My average message went from ~500 bytes JSON to ~80 bytes protobuf.
2. **HTTP/2 multiplexing** — The notification service maintains *one* TCP connection to the message service, handling thousands of concurrent message deliveries.
3. **Streaming** — When a channel has high message volume, gRPC streaming handles backpressure automatically. No polling, no hammering.
4. **Generated code** — My Go client was auto-generated from the proto file. No manual HTTP clients, no JSON serialization bugs.

### Where GraphQL Wins: The Client API

Now here's where gRPC falls apart: my mobile clients.

The mobile app needs to show a channel view. It needs:
- Channel metadata (name, participants, last message)
- Recent messages (varying counts depending on screen size)
- Participant details (name, avatar, online status)
- Unread counts

With gRPC, I'd need *multiple* RPC calls, or a bloated "get everything" endpoint that wastes bandwidth on smaller screens.

With GraphQL? One query, exactly what I need:

```graphql:queries.graphql
query GetChannelView($channelId: ID!, $messageLimit: Int) {
  channel(id: $channelId) {
    id
    name
    description
    unreadCount

    lastMessage {
      id
      content
      timestamp
      sender {
        id
        name
        avatarUrl
      }
    }

    participants {
      id
      name
      avatarUrl
      isOnline
    }
  }

  messages(channelId: $channelId, limit: $messageLimit) {
    id
    content
    timestamp
    type
    attachmentUrl
    readByCurrentUser

    sender {
      id
      name
      avatarUrl
    }
  }
}
```

And if I'm on a smart TV app that just needs recent messages?

```graphql:queries.graphql
query GetRecentMessages($channelId: ID!) {
  messages(channelId: $channelId, limit: 10) {
    id
    content
    timestamp
  }
}
```

The TV app gets *exactly* what it needs. The mobile app gets the full picture. Same backend, different clients asking for different data.

My GraphQL schema (using Strawberry):

```python:schema.py
import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class User:
    id: strawberry.ID
    name: str
    avatar_url: Optional[str]
    is_online: bool

@strawberry.type
class Message:
    id: strawberry.ID
    channel_id: str
    sender: User
    content: str
    message_type: str
    timestamp: datetime
    attachment_url: Optional[str]
    read_by_current_user: bool

@strawberry.type
class Channel:
    id: strawberry.ID
    name: str
    description: Optional[str]
    unread_count: int
    last_message: Optional[Message]
    participants: List[User]

@strawberry.type
class Query:
    @strawberry.field
    async def channel(self, id: strawberry.ID) -> Optional[Channel]:
        return await self.channel_service.get(id)

    @strawberry.field
    async def messages(
        self,
        channel_id: str,
        limit: int = 50,
        before: Optional[str] = None
    ) -> List[Message]:
        return await self.message_service.get_history(
            channel_id=channel_id,
            limit=limit,
            before_id=before
        )

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def send_message(
        self,
        channel_id: str,
        content: str,
        message_type: str = "TEXT"
    ) -> Message:
        return await self.message_service.create(
            channel_id=channel_id,
            content=content,
            message_type=message_type
        )

schema = strawberry.Schema(query=Query, mutation=Mutation)
```

## The Performance Reality

I benchmarked both in my chat app. Here's what I found:

| Operation | REST (JSON) | gRPC | GraphQL |
|-----------|-------------|------|---------|
| Service-to-service call | 8-15ms | 1-3ms | N/A |
| Mobile: Full channel load | 450ms | N/A | 120ms |
| Mobile: Recent messages only | 200ms | N/A | 45ms |
| Binary attachment upload | 2s | 300ms | N/A |

A few notes:
- "N/A" means I didn't use that technology for that scenario
- gRPC for internal calls was 5-6x faster than REST
- GraphQL on mobile was 3-4x faster than my old REST API because clients only fetched what they needed

## When to Use What

After shipping this chat app and later building several other systems, here's my mental model:

**Use gRPC when:**
- Services are talking to other services (not clients)
- You need streaming — real-time data, IoT sensors, live updates between servers
- You're sending binary data (images, files)
- Latency matters more than developer experience
- You want strict contracts between services (Protobuf schemas are enforced)

**Use GraphQL when:**
- Clients with different needs are querying the same API
- Mobile apps where bandwidth matters
- You want to ship fast and let clients evolve independently
- You need introspection and self-documenting APIs
- Over-fetching or under-fetching is causing problems

**Use both when:**
- You have internal microservices that need高性能 communication
- You have external clients (web, mobile, third-party) that need flexible data fetching

My chat app architecture:
```
[Mobile/Web Clients]
        ↓ GraphQL
   [API Gateway]
   /            \
[gRPC]        [GraphQL]
| Services      Resolvers
|                   |
[Message Service] ← → [User Service]
         ↑
    [Notification Service]
```

The clients talk GraphQL to my gateway. The gateway and internal services talk gRPC. Best of both worlds.

## The Tooling Reality

I'll be honest: gRPC has a steeper learning curve.

Getting started with GraphQL took me an afternoon. Define types, write resolvers, query them. The ecosystem (Apollo, GraphiQL, introspection) just works.

gRPC took me a week to really get comfortable. Protobuf compilation, generated code, HTTP/2 keepalives, streaming semantics — there's more to grok. But once you get it, the reliability is outstanding.

For my chat app, the gRPC services I wrote two years ago still work without changes. The Protobuf definitions are the contracts, and they don't lie.

## What I'd Tell My Past Self

If you're starting a new project and debating this: you're probably thinking about it wrong.

Ask not "which is better" but "what problem am I solving *right now*?"

- If you're building the internal plumbing first → start with gRPC. The performance gains are worth it, and you can always add a GraphQL layer later.
- If you're building for external clients first → start with GraphQL. The developer experience pays off early, and you can add gRPC for internal services later.

If you're at a company with existing REST services: don't rewrite them just to use gRPC or GraphQL. These tools solve problems — if you don't have those problems, don't create them.

But when you *do* hit scale issues, or your mobile clients are begging for a better API, that's when you reach for these tools. They're not silver bullets. They're precision instruments.

Go build something.
