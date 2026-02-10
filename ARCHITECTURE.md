# School AI Avatar - Architecture Documentation

## 1. Project Overview
School AI Avatar is an educational platform featuring an interactive AI avatar. It provides specialized support in three areas:
- **General AI Knowledge**
- **AI Tools**
- **Cybersecurity**

The platform is designed to be multilingual (IT, EN, ES) and uses **RAG (Retrieval-Augmented Generation)** to provide accurate, context-aware answers based on uploaded documentation, minimizing hallucinations.

## 2. Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
  - *Theme*: "Warm Professional" (Earth tones, calming, premium).
- **Routing**: React Router v7
- **Internationalization**: i18next / react-i18next
- **Icons**: Lucide React

### Backend (Planned)
- **Runtime**: Node.js / Python (TBD)
- **Vector Database**: Pinecone or ChromaDB (for RAG)
- **LLM Integration**: OpenAI API / Anthropic API
- **Embeddings**: `text-embedding-3-small` (or similar)

## 3. Project Structure
```
/src
  /assets        # Static assets (images, global styles)
  /components    # Reusable UI components (Sidebar, Buttons, etc.)
  /layouts       # Page layouts (DashboardLayout)
  /pages         # Main view components (Dashboard, AvatarPage, etc.)
  i18n.ts        # Internationalization configuration
  main.tsx       # Entry point
  App.tsx        # Main Router configuration
```

## 4. Design System
The design philosophy is **"Warm Professionalism"**.
- **Goal**: Avoid aggressive "hacker" aesthetics. Create a relaxing, trustworthy learning environment.
- **Palette**:
  - `Primary`: Warm Taupe / Muted Bronze
  - `Background`: Off-White / Cream (Avoid pure white)
  - `Text`: Deep Coffee (Avoid pure black)
  - `Accents`: Muted Sage (Security), Dusty Blue (Tools), Terra Cotta (Avatar)

## 5. RAG Architecture (Planned)
To ensure high-quality answers and zero hallucinations:
1.  **Ingestion**: Admin uploads documents (PDF/MD).
2.  **Processing**: Text is chunked and embedded via an Embedding Model.
3.  **Storage**: Vectors stored in Vector DB.
4.  **Retrieval**: User query is embedded -> Top K relevant chunks retrieved.
5.  **Generation**: LLM answers *only* using the retrieved context.

## 6. Developing
- `npm run dev`: Start local server.
- `npm run build`: Production build.
- `npm run lint`: Run ESLint.
