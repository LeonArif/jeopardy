# 🎯 Jeopardy Web App — Project Documentation

> Next.js + Firebase | Self-hosted multiplayer Jeopardy platform

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Feature Summary](#3-feature-summary)
4. [Database Schema (Firebase)](#4-database-schema-firebase)
5. [Folder Structure](#5-folder-structure)
6. [Authentication & Security](#6-authentication--security)
7. [Page & Route Breakdown](#7-page--route-breakdown)
8. [Game Flow & State Machine](#8-game-flow--state-machine)
9. [Real-time Architecture](#9-real-time-architecture)
10. [Firebase Storage — Media Upload Strategy](#10-firebase-storage--media-upload-strategy)
11. [Privilege Escalation Prevention](#11-privilege-escalation-prevention)
12. [Component Architecture](#12-component-architecture)
13. [Environment Variables](#13-environment-variables)
14. [Deployment Notes](#14-deployment-notes)

---

## 1. Project Overview

A web-based Jeopardy game platform where users can:
- **Register & login** with email/password (Firebase Auth)
- **Host** their own Jeopardy games: create templates with custom categories, text-only questions and answers (v1)
- **Join** a hosted game session as a player using a 4-digit code
- **Play in real-time** with live score management and a buzzer system

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Auth | Firebase Authentication (email/password) |
| Database | Firebase Firestore (NoSQL, real-time) |
| File Storage | Optional (deferred in v1) |
| Real-time Sync | Firestore `onSnapshot` listeners |
| Styling | Tailwind CSS |
| State Management | React Context + `useReducer` (client-side) |
| Hosting | Vercel (recommended) |

---

## 3. Feature Summary

### Game Creation
- Define grid size (rows × columns) freely
- Set category name per column
- Set point value per row (e.g., 100, 200, 300, …)
- Each cell contains:
  - **Question**: text only (media deferred for later)
  - **Answer**: text only (media deferred for later)
- Partial save is allowed (save in-progress templates)
- A template is only **playable** when all cells are filled

### Hosting a Session
- Select a completed template to host
- System generates a random **4-digit session code**
- Board starts with all cells **hidden/covered**
- Host clicks a cell → reveals **question**
- Host clicks again → reveals **answer**
- Host manages player scores with `+100` / `-100` buttons or manual input
- Players shown horizontally below the board
- Host can **finish session** (deletes session from Firestore)

### Joining as a Player
- Enter 4-digit code + display name
- View same board as host (read-only)
- Click own name = **activate buzzer**
- Buzzer order (1st, 2nd, 3rd…) shown above each player's name
- Own name is highlighted when buzzer is active

### Security
- Players cannot escalate to host view by changing URL segments
- Session ownership verified server-side via Firestore rules and middleware
- Firebase Security Rules enforce role-based access

---

## 4. Database Schema (Firebase)

### 4.1 Firebase Authentication

Managed entirely by Firebase Auth.  
Relevant fields exposed per user:

```
uid         : string   (Firebase UID — used as FK everywhere)
email       : string
displayName : string (optional)
```

No separate `users` collection is required. For this project, Firebase Auth is the source of truth for identity, and `uid` is used to link the user to Firestore documents in other collections.

---

### 4.2 Collection: `gameTemplates`

Stores game templates created by users. Each document represents one Jeopardy board configuration.

```
/gameTemplates/{templateId}

Field         Type              Description
─────────────────────────────────────────────────────────────────
id            string            Auto-generated Firestore doc ID
ownerUid      string            Firebase Auth UID of creator
title         string            Display name of the game/template
rows          number            Number of rows (question difficulty tiers)
cols          number            Number of columns (categories)
pointValues   number[]          Array of point values per row, length = rows
                                e.g. [100, 200, 300, 400, 500]
categories    string[]          Array of category names, length = cols
                                e.g. ["Science", "History", "Pop Culture"]
cells         Cell[][]          2D array [rowIndex][colIndex] of Cell objects
isComplete    boolean           true if all cells have both question & answer filled
createdAt     timestamp         Firestore server timestamp
updatedAt     timestamp         Updated on every save
```

#### Cell Object (nested in `cells`)

```
Cell {
  question: {
    text     : string | null     Plain text question (optional)
  }
  answer: {
    text     : string | null
  }
  isFilled : boolean             true if both question and answer have text
}
```

> **Media note:** Image/video fields are deferred in v1. If media is enabled later, add `imageUrl` and `videoUrl` fields back into the cell schema.

---

### 4.3 Collection: `sessions`

Stores active game sessions. A session is created when a host starts a game and deleted when the host ends it.

```
/sessions/{sessionCode}   ← sessionCode is the 4-digit string (e.g. "4821")

Field            Type              Description
──────────────────────────────────────────────────────────────────────
sessionCode      string            4-digit unique code (also the document ID)
templateId       string            Reference to gameTemplates/{templateId}
hostUid          string            Firebase Auth UID of the host
status           string            "waiting" | "playing" | "finished"
currentCell      string | null     Currently revealed cell, e.g. "1-2" (row-col), null if none
cellStates       object            Map of cell state per coordinate:
                                   { "0-0": "hidden" | "question" | "answer", ... }
createdAt        timestamp
updatedAt        timestamp
```

#### Sub-collection: `sessions/{sessionCode}/players`

Each document in this sub-collection represents one player in the session.

```
/sessions/{sessionCode}/players/{playerId}   ← playerId = Firestore auto-ID

Field         Type        Description
──────────────────────────────────────────────────────────────
playerId      string      Auto-generated Firestore doc ID
name          string      Display name entered by player on join
score         number      Current score (can be negative)
buzzerOrder   number | null   Position in current buzzer queue (1 = first), null = not buzzed
buzzedAt      timestamp | null  Server timestamp of when player buzzed (used for ordering)
joinedAt      timestamp   When player joined the session
isHost        boolean     Always false for players (true only set by host logic, never by player)
```

> **Note:** The host is **not** stored as a player document. The host is identified solely by `sessions/{sessionCode}.hostUid` matching `firebase.auth().currentUser.uid`.

---

### 4.4 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Game Templates ─────────────────────────────────────
    match /gameTemplates/{templateId} {
      // Only owner can read/write their own templates
      allow read: if request.auth != null
        && request.auth.uid == resource.data.ownerUid;

      // Allow create: ownerUid must match auth uid
      allow create: if request.auth != null
        && request.resource.data.ownerUid == request.auth.uid;

      // Only owner can update or delete their own templates
      allow update, delete: if request.auth != null
        && resource.data.ownerUid == request.auth.uid;
    }

    // ── Sessions ───────────────────────────────────────────
    match /sessions/{sessionCode} {
      // Anyone authenticated can read a session (needed for join)
      allow read: if request.auth != null;

      // Only host can create or update the session document
      allow create: if request.auth != null
        && request.resource.data.hostUid == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.hostUid == request.auth.uid;

      // Only host can delete (finish) the session
      allow delete: if request.auth != null
        && resource.data.hostUid == request.auth.uid;

      // ── Players Sub-collection ──────────────────────────
      match /players/{playerId} {
        // Anyone authenticated can read players list
        allow read: if request.auth != null;

        // Player can only create their own document
        allow create: if request.auth != null;

        // Player can only update their own document (buzzer click)
        // Host (identified by sessionCode.hostUid) can update score fields
        allow update: if request.auth != null && (
          // The player updating their own buzzer
          request.auth.uid == resource.data.uid
          // Or the host updating score
          || get(/databases/$(database)/documents/sessions/$(sessionCode)).data.hostUid == request.auth.uid
        );

        // Only host can delete player documents
        allow delete: if request.auth != null
          && get(/databases/$(database)/documents/sessions/$(sessionCode)).data.hostUid == request.auth.uid;
      }
    }
  }
}
```

---

### 4.5 Firebase Storage Security Rules

> **Optional:** Storage is deferred in v1. Enable this only when image/video uploads are added.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gameTemplates/{templateId}/{allPaths=**} {
      // Only authenticated users can upload
      // Ideally verify ownerUid via Firestore lookup (requires callable function)
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

> **Recommendation:** For stricter storage rules, use a Firebase Cloud Function to handle media uploads and verify ownership before writing to Storage.

---

## 5. Folder Structure

```
/
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Root layout (AuthProvider, fonts)
│   ├── page.tsx                  ← Landing page (login/register + Host/Join CTA)
│   │
│   ├── dashboard/
│   │   └── page.tsx              ← Protected: list of user's game templates
│   │
│   ├── editor/
│   │   ├── new/
│   │   │   └── page.tsx          ← Grid config (rows × cols input) → redirect to editor
│   │   └── [templateId]/
│   │       └── page.tsx          ← Template editor (categories, cells, popup, save)
│   │
│   ├── host/
│   │   └── [sessionCode]/
│   │       └── page.tsx          ← Host game view (board + score management)
│   │
│   └── player/
│       └── [sessionCode]/
│           └── page.tsx          ← Player game view (board read-only + buzzer)
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── dashboard/
│   │   ├── TemplateCard.tsx      ← Card for each saved game
│   │   └── EmptyState.tsx
│   │
│   ├── editor/
│   │   ├── BoardGrid.tsx         ← Visual grid of cells
│   │   ├── CellButton.tsx        ← Individual cell in editor
│   │   ├── CellEditModal.tsx     ← Popup for question/answer input (text-only v1)
│   │   ├── CategoryInput.tsx     ← Input for column category name
│   │   └── RowPointInput.tsx     ← Input for row point value
│   │
│   ├── game/
│   │   ├── JeopardyBoard.tsx     ← Shared board display (host & player)
│   │   ├── GameCell.tsx          ← Cell with hidden/question/answer states
│   │   ├── PlayerStrip.tsx       ← Horizontal player list with scores & buzzer
│   │   ├── PlayerCard.tsx        ← Individual player card (score, buzzer rank, highlight)
│   │   ├── ScoreControls.tsx     ← +/- buttons + manual input (host only)
│   │   └── SessionCodeBadge.tsx  ← Displays the 4-digit code for sharing
│   │
│   └── ui/
│       ├── Modal.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ProtectedRoute.tsx    ← Wraps pages requiring auth
│
├── lib/
│   ├── firebase.ts               ← Firebase app init (auth, db; storage optional later)
│   ├── firestore/
│   │   ├── templates.ts          ← CRUD helpers for gameTemplates
│   │   └── sessions.ts           ← CRUD helpers for sessions + players
│   └── utils/
│       ├── generateCode.ts       ← 4-digit session code generator (collision-checked)
│       ├── cellHelpers.ts        ← isCellFilled, isBoardComplete, etc.
│       └── roleGuard.ts          ← Server/client-side host vs player role checking
│
├── hooks/
│   ├── useAuth.ts                ← Auth state, login, register, logout
│   ├── useSession.ts             ← onSnapshot listener for session doc
│   ├── usePlayers.ts             ← onSnapshot listener for players sub-collection
│   └── useTemplate.ts            ← Fetch + update a game template
│
├── context/
│   └── AuthContext.tsx           ← Global auth state provider
│
├── middleware.ts                 ← Next.js middleware for route protection
├── .env.local                    ← Firebase config secrets
└── JEOPARDY_PROJECT.md           ← This file
```

---

## 6. Authentication & Security

### Auth Flow

1. User visits `/` (landing page)
2. If not authenticated → show Login/Register form
3. On successful auth → redirect to `/dashboard`
4. All `/dashboard`, `/editor/*`, `/host/*`, `/player/*` routes are protected
5. No separate `users` collection is created; the app uses Firebase Auth `uid` directly in Firestore documents

### Next.js Middleware (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/editor', '/host', '/player']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseAuthToken')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/host/:path*', '/player/:path*']
}
```

> Use `firebase-admin` with a session cookie strategy (via API route) or a client-verified JWT to populate the cookie.

---

## 7. Page & Route Breakdown

### `/` — Landing Page
- Shows app name and description
- Login form + Register form (toggle)
- On auth success → `/dashboard`

### `/dashboard` — Protected
- Fetches all `gameTemplates` where `ownerUid == currentUser.uid`
- If empty → "You haven't created any games yet" + Create New button
- Each template card shows: title, grid size, completion status
- Actions per card: **Play** (if `isComplete === true`), **Edit**, **Delete**
- Clicking Play → creates a new session → redirects to `/host/{sessionCode}`

### `/editor/new` — Protected
- Form: enter number of rows, number of columns, and game title
- On submit → creates a blank template in Firestore → redirects to `/editor/{templateId}`

### `/editor/[templateId]` — Protected
- Displays the Jeopardy grid
- Category name inputs above each column
- Point value inputs beside each row
- Each cell is clickable → opens `CellEditModal`
- `CellEditModal`: two panels (Question | Answer), text inputs only (v1)
- Auto-saves on modal close (or explicit Save button inside modal)
- Top-level **Save Game** button persists entire template state to Firestore
- Breadcrumb / back link → `/dashboard`

### `/host/[sessionCode]` — Protected
- **Role verified**: `session.hostUid` must match `auth.currentUser.uid`; if not → redirect to `/`
- Displays full Jeopardy board in covered state
- Top: Session code badge (shareable 4-digit code)
- Click a cell → state transitions: `hidden → question → answer`
- Bottom: horizontal player strip
  - Each player card: name, score, buzzer position badge
  - Score controls: `−100` button, score display (editable text input), `+100` button
- **Finish Session** button: sets `status: "finished"`, then deletes session document

### `/player/[sessionCode]` — Protected
- **Role verified**: `session.hostUid` must NOT match `auth.currentUser.uid`; if it does → redirect to `/host/{sessionCode}` (or block)
- Same board display as host (read-only; no cell-click handling)
- Player strip same as host view but **without** score controls
- Own player card has a **Buzz** button (clicking own name)
- Buzzer state shows ordered badges (1st, 2nd, 3rd…) above names
- Own card highlighted when buzzer is active

---

## 8. Game Flow & State Machine

### Session Status

```
         [Host selects template]
                  │
                  ▼
           status: "waiting"
          (players can join)
                  │
         [Host clicks "Start"]
                  ▼
           status: "playing"
          (board is interactive)
                  │
         [Host clicks "Finish"]
                  ▼
           status: "finished"
          (session deleted from Firestore)
```

### Cell State Machine

```
"hidden"  ──[host click]──▶  "question"  ──[host click]──▶  "answer"
```

Cell states are stored in `sessions/{sessionCode}.cellStates`:
```json
{
  "0-0": "hidden",
  "0-1": "question",
  "1-2": "answer"
}
```

### Buzzer State Machine

```
All players: buzzerOrder = null, buzzedAt = null

[Player clicks own name]
  → player doc updated: buzzedAt = serverTimestamp()

[All players' buzzedAt sorted ascending]
  → buzzerOrder assigned: 1st, 2nd, 3rd...

[Host reveals answer OR manually resets]
  → all players: buzzerOrder = null, buzzedAt = null
```

Buzzer reset is triggered by the host when `cellState` transitions to `"answer"` or via an explicit Reset Buzzer button.

---

## 9. Real-time Architecture

All real-time updates use Firestore `onSnapshot` listeners, which push changes to all connected clients instantly.

### Listeners per page

| Page | Listener |
|---|---|
| `/host/[code]` | `onSnapshot(doc("sessions", code))` → board state, cellStates, status |
| `/host/[code]` | `onSnapshot(collection("sessions", code, "players"))` → player list, scores, buzzer |
| `/player/[code]` | Same two listeners as host (read-only rendering) |

### Write operations (host only)

| Action | Firestore Write |
|---|---|
| Click cell | `updateDoc(session, { cellStates: { ...prev, "r-c": nextState } })` |
| Add score | `updateDoc(playerDoc, { score: increment(100) })` |
| Subtract score | `updateDoc(playerDoc, { score: increment(-100) })` |
| Manual score | `updateDoc(playerDoc, { score: newValue })` |
| Finish session | `deleteDoc(sessionDoc)` (after setting status finished) |

### Write operations (player only)

| Action | Firestore Write |
|---|---|
| Buzz | `updateDoc(playerDoc, { buzzedAt: serverTimestamp() })` |

---

## 10. Firebase Storage — Media Upload Strategy

> **Deferred for now:** v1 is text-only. Storage and media uploads can be added later without changing the core game flow.

When enabled later:
1. Add `imageUrl` and `videoUrl` fields back into the `Cell` schema.
2. Enable Firebase Storage and set rules.
3. Add upload UI and save URLs into Firestore.

---

## 11. Privilege Escalation Prevention

### Problem
A player at `/player/4821` could manually navigate to `/host/4821` and gain host controls.

### Mitigations (layered defense)

#### Layer 1: Firestore Security Rules
- `sessions/{code}` update/delete only allowed if `request.auth.uid == resource.data.hostUid`
- Player score writes only allowed by host UID
- Even if a player reaches the host page, all write operations will be rejected by Firestore

#### Layer 2: Client-side Route Guard (in `/host/[sessionCode]/page.tsx`)

```typescript
useEffect(() => {
  if (!session) return
  if (session.hostUid !== currentUser?.uid) {
    // This user is not the host — redirect to player view
    router.replace(`/player/${sessionCode}`)
  }
}, [session, currentUser])
```

#### Layer 3: Next.js Middleware
- Middleware can check a session cookie + validate role before rendering the page
- Prevents flash-of-host-UI before client-side guard fires

#### Layer 4: UI Controls Never Rendered for Non-Hosts
- Score controls (`+`/`-`/input) are conditionally rendered only when `isHost === true`
- Cell click handlers only attached in host view
- Even if JS is manipulated client-side, Firestore rules block the actual write

#### Layer 5: Player `isHost` field always `false`
- Player documents in Firestore always have `isHost: false`
- The system never reads `isHost` from the player doc to grant privileges
- Host status is derived **only** from `sessions/{code}.hostUid === auth.currentUser.uid`

---

## 12. Component Architecture

### Shared between Host & Player

```
JeopardyBoard
├── CategoryHeader[]        (one per column)
└── BoardRow[]              (one per row)
    ├── RowPointLabel       (point value on left)
    └── GameCell[]          (one per column)
        ├── CoverState      (hidden — shows point value)
        ├── QuestionState   (shows question text)
        └── AnswerState     (shows answer text)

PlayerStrip
└── PlayerCard[]
    ├── BuzzerBadge         (1st / 2nd / 3rd — shown if buzzedAt set)
    ├── PlayerName          (highlighted if buzzedAt set)
    ├── ScoreDisplay
    └── ScoreControls       (rendered only for host)
```

### Editor-only

```
EditorGrid
├── CategoryInput[]         (editable, above each column)
└── EditorRow[]
    ├── RowPointInput       (editable point value)
    └── CellButton[]
        └── CellEditModal   (popup on click)
            ├── QuestionPanel
            │   └── TextInput
            └── AnswerPanel
                └── TextInput
```

---

## 13. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com # optional, only if Storage is enabled later
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side only (for middleware auth verification via firebase-admin)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 14. Deployment Notes

### Vercel (Recommended)

1. Push repo to GitHub
2. Import to Vercel, add all env vars from `.env.local`
3. Vercel auto-detects Next.js — no extra config needed

### Firebase Project Setup Checklist

- [ ] Enable **Authentication** → Email/Password provider
- [ ] Create **Firestore** database (production mode)
- [ ] Apply Firestore Security Rules from section 4.4
- [ ] (Optional) Enable **Storage** and apply Storage rules from section 4.5
- [ ] (Optional) Enable CORS on Storage bucket for your Vercel domain
- [ ] Create service account key for `firebase-admin` (middleware auth)

### 4-digit Session Code Collision Prevention

```typescript
// lib/utils/generateCode.ts
async function generateUniqueCode(db: Firestore): Promise<string> {
  while (true) {
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const docRef = doc(db, 'sessions', code)
    const snap = await getDoc(docRef)
    if (!snap.exists()) return code
    // Collision → retry
  }
}
```

---

## Quick Reference: Firestore Document Examples

### `gameTemplates/abc123`
```json
{
  "id": "abc123",
  "ownerUid": "user_uid_here",
  "title": "Anime Trivia Night",
  "rows": 6,
  "cols": 5,
  "pointValues": [100, 200, 300, 400, 500, 1000],
  "categories": ["MATAMATA", "MATAMATA DOBEL POIN", "mulut nyenyenye", "YUM YUM", "AMONG US"],
  "cells": [
    [
      {
        "question": { "text": "Siapa ninja dari Konoha yang memakai baju oranye?" },
        "answer": { "text": "Naruto" },
        "isFilled": true
      }
    ]
  ],
  "isComplete": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T12:00:00Z"
}
```

### `sessions/4821`
```json
{
  "sessionCode": "4821",
  "templateId": "abc123",
  "hostUid": "user_uid_here",
  "status": "playing",
  "currentCell": "0-2",
  "cellStates": {
    "0-0": "answer",
    "0-2": "question",
    "1-3": "hidden"
  },
  "createdAt": "2025-01-01T20:00:00Z",
  "updatedAt": "2025-01-01T20:15:00Z"
}
```

### `sessions/4821/players/player456`
```json
{
  "playerId": "player456",
  "name": "epan",
  "score": 4500,
  "buzzerOrder": 1,
  "buzzedAt": "2025-01-01T20:16:03Z",
  "joinedAt": "2025-01-01T20:01:00Z",
  "isHost": false
}
```

---

*Last updated: May 2025 — v1.0*
