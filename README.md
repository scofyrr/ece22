# Plataforma — Colegio José Carlos Mariátegui "El Amauta"

Red social educativa de trueque de conocimientos: los estudiantes publican aportes,
ganan puntos, suben de nivel y canjean esos puntos por libros en la biblioteca digital.
Incluye un chatbot con IA con contexto del colegio.

## Stack
- **TanStack Start** (React 19 + Vite 7)
- **Supabase** (base de datos, auth, storage)
- **Tailwind CSS v4** + **framer-motion** (animaciones)
- **AI SDK** para el chatbot

## Correr en local (VS Code)

1. Instala dependencias:
   ```bash
   bun install   # o: npm install
   ```
2. Copia las variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
   y rellena `.env.local` con tus claves de Supabase y de IA.
3. Aplica las migraciones SQL de `supabase/migrations/` en tu proyecto Supabase
   (SQL Editor del dashboard, en orden por fecha).
4. Arranca el servidor:
   ```bash
   bun run dev   # o: npm run dev
   ```

## Estructura clave (para debug rápido)
```
src/
  content/          → TEXTO editable centralizado (colegio, contexto IA)
    colegio.ts      → todos los textos de la página principal
    ai-context.ts   → contexto OCULTO que se inyecta a la IA (solo servidor)
  components/
    home/           → secciones de la landing del colegio (1 archivo por sección)
    library/        → tarjetas y formularios de la biblioteca
    chat/           → componentes del chatbot
  routes/
    index.tsx       → página principal del colegio
    feed.tsx        → feed de aportes
    biblioteca.tsx  → catálogo de libros
    chat.$threadId.tsx → chat con la IA (hilos)
    api/chat.ts     → endpoint servidor que llama a la IA
  lib/
    library.functions.ts → subir / comprar libros (regla 70/30)
    points.functions.ts  → economía de puntos
    chat.functions.ts    → hilos y mensajes del chat
```

## Economía de puntos
- **+10 puntos** al publicar en el feed.
- **+2 puntos** por cada like recibido.
- Al comprar un libro: el **70%** va al autor y el **30%** se quema (desaparece).
