# Pixl Chat - Frontend

The frontend implementation of the Pixl Chat application, built with Next.js and modern web technologies.

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [TailwindCSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [Eden](https://elysiajs.com/eden/treaty/overview.html#eden-treaty) - Type-safe API calls to Elysia backend
- [Shadcn UI](https://ui.shadcn.com/) - Accessible and customizable UI components
- [@Tanstack/form](https://tanstack.com/form/latest/docs/overview) - Form handling for authentication
- [SWR](https://swr.vercel.app/) - Data fetching and caching

## Features

### Real-time Chat
- Instant message delivery using WebSocket
- Message history with timestamps
- Message editing with edit history
- Message deletion
- Chat deletion
- Optimistic UI updates

### User Interface
- Modern and responsive design
- Accessible components from Shadcn UI
- Loading states and error handling
- Clean and intuitive chat interface

### Authentication
- User registration with username
- User login with credentials
- Protected chat routes
- Session management

## Project Structure

```
frontend/
├── src/
│   ├── api/          # Eden API client setup
│   ├── components/
│   │   ├── chats/    # Chat-specific components
│   │   ├── forms/    # Forms
│   │   └── ui/       # Shadcn UI components
│   ├── contexts/     # React contexts (Auth, Chat)
│   ├── hooks/        # Custom hooks
│   ├── lib/          # WebSocket manager, utilities
│   ├── app/          # Next.js app router pages
│   └── types/        # TypeScript types
└── public/           # Static assets
```

## Development

### Prerequisites

- Bun runtime
- Node.js 18 or higher

### Setup

1. Install dependencies:
```bash
bun install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:6969
```

3. Start the development server:
```bash
bun dev
```

### WebSocket Integration

The application uses a custom `WebSocketManager` class for real-time features:

```typescript
interface WSMessage {
    type: 'chat' | 'edit' | 'system';
    message: string;
    receiver: number;
    messageId?: string;
    timestamp: string;
}
```

Key features:
- Automatic reconnection
- Message type handling
- Edit message support
- System messages

### State Management

The application uses:
- `ChatContext` for chat state and actions
- `AuthContext` for user authentication
- Local state for UI components
- SWR for API data caching

### Component Architecture

- Modular components for reusability
- Composition over inheritance
- Accessible UI elements
- Responsive design patterns

### Type Safety

- Full TypeScript support
- Type-safe API calls with Eden
- Shared types with backend
- Strict type checking

## Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun type-check` - Run TypeScript checks
