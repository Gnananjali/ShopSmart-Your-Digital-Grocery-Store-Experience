# ShopSmart - Grocery Web Application

## Overview

ShopSmart is a modern full-stack grocery web application built with React, Express.js, and PostgreSQL. The application provides a seamless online shopping experience for customers to browse, search, and purchase grocery items across various categories including vegetables, fruits, dairy products, spices, household items, and snacks.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for cart management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Session-based cart storage using localStorage session IDs
- **API Pattern**: RESTful API endpoints under `/api` prefix

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Database Schema (Drizzle ORM)
- **Categories**: Product categorization (id, name, slug, description, imageUrl)
- **Products**: Product information with pricing, stock, and metadata
- **Cart Items**: Session-based cart storage linking products to user sessions

### Frontend Components
- **Header**: Search functionality, cart icon, and navigation
- **Product Grid**: Filterable and sortable product display
- **Category Grid**: Category navigation with visual icons
- **Cart Modal**: Shopping cart management with quantity controls
- **Floating Cart**: Persistent cart indicator

### Backend Services
- **Storage Interface**: Abstracted data access layer with in-memory fallback
- **Route Handlers**: RESTful endpoints for categories, products, and cart operations
- **Session Management**: Client-side session ID generation for cart persistence

## Data Flow

1. **Product Browsing**: Categories and products are fetched via React Query from API endpoints
2. **Search & Filter**: Client-side filtering combined with server-side search functionality
3. **Cart Management**: Session-based cart operations with optimistic updates
4. **State Synchronization**: React Query handles caching and synchronization between client and server

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with Zod schema validation
- **UI Library**: Radix UI primitives via shadcn/ui
- **HTTP Client**: Native fetch API wrapped in React Query
- **Form Handling**: React Hook Form with Zod resolvers

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Database**: Drizzle Kit for schema management and migrations
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer
- **Development**: TSX for TypeScript execution in development

## Deployment Strategy

### Development
- **Server**: TSX runs the Express server with hot reloading
- **Client**: Vite dev server with HMR and React Fast Refresh
- **Database**: Drizzle push for schema synchronization

### Production Build
- **Client**: Vite builds optimized React bundle to `dist/public`
- **Server**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Migrations applied via Drizzle Kit
- **Serving**: Express serves both API routes and static React app

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable for PostgreSQL connection
- **Session Storage**: localStorage for client-side session management
- **CORS**: Configured for cross-origin requests in development

## Changelog
- June 29, 2025: Initial setup with React/Express grocery store
- June 29, 2025: Added PostgreSQL database integration with Drizzle ORM
- June 29, 2025: Added checkout and login pages with complete navigation
- June 29, 2025: Fixed cart functionality with session-based persistence

## User Preferences

Preferred communication style: Simple, everyday language.