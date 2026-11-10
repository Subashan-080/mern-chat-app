# MERN Chat Backend

Node.js + Express + MongoDB/Mongoose + Socket.IO backend for a real-time chat application.

## 1. Requirements

- Node.js 18+
- MongoDB local service or MongoDB Atlas
- npm

## 2. Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set:
- `MONGO_URI`
- `JWT_SECRET` (use a long, random secret)
- `CLIENT_URL` (your React app origin)

Run development server:

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## 3. Authentication

Register: `POST /api/auth/register`
```json
{ "name": "Arun", "email": "arun@example.com", "password": "password123" }
```

Login: `POST /api/auth/login`
```json
{ "email": "arun@example.com", "password": "password123" }
```

Both return a `token` and `user`. Send the token on protected REST requests:
`Authorization: Bearer YOUR_TOKEN`

The backend also sets an HTTP-only cookie. For a frontend using bearer tokens, store the token according to your security requirements and send it in the Authorization header. For cookie auth, use `withCredentials: true` and configure CSRF protection before production deployment.

Current user: `GET /api/auth/me`
Logout: `POST /api/auth/logout`

## 4. User APIs

All require authentication.

- `GET /api/users/search?q=ar` — search users by name/email (minimum 2 characters)
- `GET /api/users/:userId` — get public user profile

## 5. Conversation APIs

All require authentication.

- `GET /api/conversations` — list conversations for logged-in user
- `POST /api/conversations/direct` — create or return a one-to-one conversation
  ```json
  { "userId": "OTHER_USER_OBJECT_ID" }
  ```
- `POST /api/conversations/group` — create group conversation
  ```json
  { "name": "Project Team", "memberIds": ["USER_ID_2", "USER_ID_3"] }
  ```
  The logged-in user is automatically added.
- `GET /api/conversations/:conversationId` — get one conversation (must be a member)

## 6. Message APIs

All require authentication.

- `GET /api/messages/conversation/:conversationId?limit=30&before=ISO_DATE` — fetch message history, oldest first
- `PATCH /api/messages/:messageId`
  ```json
  { "content": "Edited message" }
  ```
- `DELETE /api/messages/:messageId` — soft-delete your own message

New messages are created through Socket.IO and saved in MongoDB before being broadcast.

## 7. Socket.IO client integration

Install in the React project:

```bash
npm install socket.io-client
```

Connect using the JWT returned by login/register:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token }
});
```

### Events sent by client

| Event | Payload | Purpose |
|---|---|---|
| `conversation:join` | `{ conversationId }` | Join after membership verification |
| `message:send` | `{ conversationId, content, clientMessageId? }` | Save and send message |
| `typing:start` | `{ conversationId }` | Notify others that user is typing |
| `typing:stop` | `{ conversationId }` | Stop typing indicator |
| `message:read` | `{ conversationId, messageId }` | Mark message read |
| `presence:get` | callback | Get current online user IDs |

### Events received by client

| Event | Data |
|---|---|
| `message:new` | Saved message document |
| `typing:update` | `{ conversationId, user, isTyping }` |
| `message:read:update` | `{ messageId, conversationId, readBy }` |
| `presence:update` | `{ userId, isOnline, lastSeen? }` |

For acknowledgement-based events, pass a callback as the final argument:

```js
socket.emit("conversation:join", { conversationId }, (result) => {
  console.log(result);
});

socket.emit("message:send", {
  conversationId,
  content: "Hello!"
}, (result) => {
  if (result.success) console.log("Saved:", result.message);
});
```

## 8. Important implementation notes

- Socket authentication is required; pass the JWT in `handshake.auth.token`.
- The server verifies conversation membership before joining rooms, sending, typing, and reading.
- Message sending is persisted to MongoDB before the server broadcasts it.
- Presence is tracked per user across multiple tabs/sockets in this Node process.
- This in-memory presence map is not suitable for multiple backend instances. Use a shared adapter/store (such as the Socket.IO Redis adapter) for horizontal scaling.
- Group creation is included. Group admin management, member add/remove, attachments, push notifications, and message delivery receipts are not included in this starter.
- For production, add request validation (for example Zod/Joi), stronger authorization policies, logging, tests, CSRF protection if using cookies, HTTPS, and monitoring.
