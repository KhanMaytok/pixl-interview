# Pixl - Challenge
---

A modern real-time chat application built with Next.js, Elysia.js, and WebSocket technology. This project demonstrates a full-stack implementation of a chat system with real-time message updates, message editing, and user management.

## Tech Stack

### Frontend:
- [Next.js 15](https://nextjs.org/)
- [TailwindCSS v4](https://tailwindcss.com/)
- [Eden (for api calls)](https://elysiajs.com/eden/treaty/overview.html#eden-treaty)
- [Shadcn UI (for UI components)](https://ui.shadcn.com/)
- [@Tanstack/form (for auth forms)](https://tanstack.com/form/latest/docs/overview)
- [SWR](https://swr.vercel.app/)

### Backend:
- [Elysia (as the server)](https://elysiajs.com/)
- [Prisma](https://www.prisma.io/)
- [Neon (as the DB)](https://console.neon.tech/)

## Features

- 🔄 Real-time messaging with WebSocket support
- ✏️ Message editing with edit history tracking
- 🗑️ Message and chat deletion
- 👤 User authentication and management
- 💅 Modern UI with Shadcn components
- 🌐 Type-safe API calls with Eden
- 🔒 Secure authentication with JWT
- 📱 Responsive design for all devices

## Project Structure

The project is organized as a monorepo with two main packages:

- `frontend/`: Next.js application
- `backend/`: Elysia.js server

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd pixl-interview
```

2. Install dependencies:
```bash
# Install all dependencies as workspace
bun install
```

3. Configure environment variables:

For backend (backend/.env):
```env
DATABASE_URL="your-neon-database-url"
JWT_SECRET="your-jwt-secret"
```

For frontend (frontend/.env.local):
```env
NEXT_PUBLIC_API_URL="http://localhost:6969"
```

4. Start the development servers:

```bash
# Start both frontend and backend
bun dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Development

- Frontend runs on port 3000
- Backend runs on port 6969
- WebSocket server is integrated with the backend
- Database is hosted on Neon (serverless PostgreSQL)
