# Graph Report - minigames-hima-ti  (2026-09-15)

## Corpus Check
- 32 files · ~152,461 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 304 nodes · 486 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddeaaf3f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Badge.tsx
- server.js
- FlashcardGame.tsx
- BgmEngine
- devDependencies
- compilerOptions
- compilerOptions
- dependencies
- package.json
- backend/package.json
- 📋 SPESIFIKASI & ATURAN SISTEM MINIGAMES FLASHCARD HIMA PRODI TI
- plugins
- ⚡ Website Minigames Flashcard HIMA TI
- React + TypeScript + Vite
- tsconfig.json
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `BgmEngine` - 31 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 15 edges
4. `react` - 14 edges
5. `QuizConfig` - 13 edges
6. `Question` - 10 edges
7. `GameResult` - 9 edges
8. `📋 SPESIFIKASI & ATURAN SISTEM MINIGAMES FLASHCARD HIMA PRODI TI` - 8 edges
9. `App()` - 7 edges
10. `clearActiveQuiz()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `RestoredState` --references--> `StoredAnswer`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/lib/session.ts
- `WelcomeScreenProps` --references--> `QuizConfig`  [EXTRACTED]
  frontend/src/components/game/WelcomeScreen.tsx → frontend/src/types.ts
- `StoredAnswer` --references--> `Question`  [EXTRACTED]
  frontend/src/lib/session.ts → frontend/src/types.ts
- `ResultScreen()` --references--> `react`  [EXTRACTED]
  frontend/src/components/game/ResultScreen.tsx → frontend/package.json
- `RestoredState` --references--> `GameResult`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/types.ts

## Import Cycles
- None detected.

## Communities (17 total, 3 thin omitted)

### Community 1 - "server.js"
Cohesion: 0.07
Nodes (30): checkSetting, db, dbPath, defaultSettings, __dirname, __filename, insertSetting, uploadsDir (+22 more)

### Community 2 - "FlashcardGame.tsx"
Cohesion: 0.09
Nodes (42): RestoredState, AdminDashboardProps, ANIMATION_CHOICES, AudioMixerModal(), AudioMixerModalProps, FlashcardCard(), FlashcardCardProps, FlashcardGameProps (+34 more)

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (24): devDependencies, oxlint, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react (+16 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (18): canvas-confetti, framer-motion, dependencies, canvas-confetti, framer-motion, lucide-react, react, react-dom (+10 more)

### Community 8 - "package.json"
Cohesion: 0.12
Nodes (16): author, description, keywords, license, name, scripts, build, dev (+8 more)

### Community 9 - "backend/package.json"
Cohesion: 0.12
Nodes (15): dependencies, cors, express, multer, description, main, name, scripts (+7 more)

### Community 10 - "📋 SPESIFIKASI & ATURAN SISTEM MINIGAMES FLASHCARD HIMA PRODI TI"
Cohesion: 0.14
Nodes (13): 1. 🎯 Ringkasan & Konsep Permainan, 2. ⚡ Arsitektur & Tech Stack: Cepat, Ringan & Kokoh, 3. 🎖️ Sistem Penentuan Pemenang & Mekanisme Cap Stand, 4. 🎮 Gameplay & Animasi Flashcard (Framer Motion), 5. ⚙️ Fitur Dashboard Admin Stand, 6. 📁 Struktur Folder Proyek, 7. 📜 Ringkasan Aturan Main Stand (Rules Sheet untuk Panitia), A. Fitur Animasi Interaktif (+5 more)

### Community 11 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 12 - "⚡ Website Minigames Flashcard HIMA TI"
Cohesion: 0.22
Nodes (8): 1. Jalankan Mode Siap Pakai (Rekomendasi untuk Hari-H Stand), 2. Jalankan Mode Development, 🚀 Cara Menjalankan di Laptop Stand, ⚙️ Command Center Admin Stand, Fitur Admin:, 🎮 Fitur Utama & Validasi Sesi, 📱 Responsif di Smartphone Maba (Opsional), ⚡ Website Minigames Flashcard HIMA TI

### Community 13 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 16 - "App.tsx"
Cohesion: 0.24
Nodes (14): App(), AdminDashboard(), FlashcardGame(), LeaderboardModal(), LeaderboardModalProps, clearActiveQuiz(), clearAllSessions(), clearResultSession() (+6 more)

## Knowledge Gaps
- **139 isolated node(s):** `__filename`, `__dirname`, `dbPath`, `uploadsDir`, `defaultSettings` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `ResultScreen()` connect `dependencies` to `App.tsx`, `FlashcardGame.tsx`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `dbPath` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06756756756756757 - nodes in this community are weakly interconnected._
- **Should `FlashcardGame.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0936026936026936 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._