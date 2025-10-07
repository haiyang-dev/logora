# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneNote BlackNote is a local Markdown note management application similar to Obsidian, built with React + TypeScript frontend and Node.js + Express backend. The application uses BlockNote editor for rich text editing and stores notes as JSON files in a local workspace directory.

## Common Development Commands

```bash
# Development - runs both frontend (port 5173) and backend (port 3001) concurrently
npm run dev

# Backend only - development server with auto-reload
npm run server

# Backend only - production build and run
npm run server:prod

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture & Key Components

### Frontend Structure (`src/`)
- **App.tsx** - Main application with provider setup for context management
- **components/** - React UI components
  - **Sidebar.tsx** - File navigation and search interface
  - **Editor.tsx** - BlockNote editor integration
- **context/** - React Context for state management
  - **AppContext.tsx** - Global application state (notes, search, folders)
  - **EditorContext.tsx** - Editor-specific state management
- **utils/** - Utility functions for file operations, markdown conversion, etc.
- **config/** - Configuration constants and settings
- **shared/** - Shared utilities and schema definitions

### Backend Structure (`src/server/`)
- **index.ts** - Express server with REST API endpoints
- **search.ts** - Search engine with indexing capabilities
- Key API endpoints:
  - `GET /api/notes` - List all notes/folders
  - `GET /api/notes/:filePath` - Read note content
  - `POST /api/notes/:filePath` - Save note content
  - `POST /api/notes/rename` - Rename notes
  - `DELETE /api/notes/:filePath` - Delete notes
  - `GET /api/search` - Search notes
  - `POST /api/upload-image` - Upload images to `.resources/images/`

### Data Storage
- **workspace/** - Main workspace directory for user notes
  - All notes stored as `.json` files containing BlockNote editor state
  - Supports nested folder structure
- **workspace/.resources/images/** - Image storage for uploaded files
- Notes are referenced by file paths (using forward slashes for web compatibility)

### Key Technologies
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Editor**: BlockNote with code block syntax highlighting
- **Syntax Highlighting**: Shiki (pre-bundled in `shiki.bundle.ts`)
- **Backend**: Express.js with TypeScript
- **State Management**: React Context API + useReducer pattern
- **File Upload**: Multer for image handling
- **Security**: Path traversal protection and file type validation
- **Notifications**: Custom ProgressAlert system for user feedback

## Important Security Considerations

- All file operations are restricted to the `workspace/` directory
- Path traversal protection is implemented in all file-related API endpoints
- Only `.json` files are allowed for note storage
- Image uploads are restricted to common image formats
- CORS is configured for development ports (5173, 5174, 5175)
- File names are hashed for security and duplicate prevention

## Development Patterns

### File Path Handling
- Use forward slashes (`/`) for all API paths and frontend references
- Backend converts between forward slashes and system path separators
- File paths are relative to the `workspace/` directory

### State Management
- Use React Context for global state (notes, search, folder expansion)
- Editor state is managed separately in EditorContext
- Use TypeScript interfaces defined in `types/index.ts`

### Error Handling
- Backend includes comprehensive error handling with proper HTTP status codes
- Frontend includes console logging for debugging file system operations
- Graceful fallbacks when files don't exist (return empty content)

### Image Handling
- Images are uploaded via multer middleware with memory storage
- Files are hashed using SHA-256 to prevent duplicates
- Supported formats: jpg, jpeg, png, gif, webp, svg
- Images stored in `workspace/.resources/images/` with hash-based filenames

### Progress Alerts
- Use `ProgressAlert` singleton from `src/utils/progressAlert.ts` for user notifications
- Supports success, error, warning, and info alert types
- Automatic positioning and styling, with optional button support
- Use `show()`, `update()`, and `hide()` methods for alert lifecycle management

## Build Configuration

- **Vite** for frontend development and building
- **TypeScript** with multiple config files for different parts of the application
- **ESLint** with TypeScript, React Hooks, and React Refresh rules
- Development server proxies `/api/*` requests to backend on port 3001
- **Nodemon** for backend development with auto-reload
- **Concurrently** for running frontend and backend together

## Testing

Currently minimal testing infrastructure:
- Manual testing files in root directory
- No automated test framework configured
- Consider adding Jest/Vitest for unit testing when expanding

## Key File Locations

- **Constants**: `src/config/constants.ts` - File configuration, API endpoints, UI limits, and error messages
- **Types**: `src/types/index.ts` - TypeScript interfaces
- **Schema**: `src/shared/schema.ts` - BlockNote schema configuration with code block support and syntax highlighting
- **Bundle**: `src/shiki.bundle.ts` - Pre-bundled syntax highlighter
- **File Utils**: `src/utils/fileSystem.ts` - File system operations
- **Import/Export**: `src/utils/importExport.ts` - Markdown conversion utilities
- **Progress Alert**: `src/utils/progressAlert.ts` - Reusable notification system with support for multiple alert types