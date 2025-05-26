# Project: Evenmate

## Authors
- **Martin Ševčík**
- **Jakub Lůčný**  
- *VUT FIT 2024/2025*

---

# Evenmate – Mobile Expense-Sharing App

A cross-platform (iOS / Android) application that helps friends **track, split and settle shared costs** in real time.  
Built during the *Mobile Applications* course (FIT VUT, 2024/25).

---

## ✨ Key Features
| Area | Highlights |
|------|------------|
| **Expense tracking** | Add expenses to friends or groups, auto-split by shares or custom amounts, view who owes whom. :contentReference[oaicite:0]{index=0} |
| **Groups & friends** | Create / join groups via QR code, keep personal friend lists with running balances. :contentReference[oaicite:1]{index=1} |
| **Settle debts** | One-tap **“Get Even”** button optimises repayments between users. :contentReference[oaicite:2]{index=2} |
| **Notes & To-do** | Group whiteboard and task list (CRUD, drag to complete) for event planning. :contentReference[oaicite:3]{index=3} |
| **User profile** | Avatar, bank account, editable bio, share profile as QR. :contentReference[oaicite:4]{index=4} |

---

## 🏗️ Tech Stack
- **React Native + Expo** for a single-codebase mobile UI :contentReference[oaicite:5]{index=5}  
- **Supabase (PostgreSQL, Auth, Realtime)** as the backend-as-a-service :contentReference[oaicite:6]{index=6}  
- **React-Query** data layer; TypeScript throughout  
- E2E tests in **Cypress** / Expo Go device runs

```

client ↔ REST API / Realtime ↔ Supabase

````
Architecture cleanly separates front-end and backend services :contentReference[oaicite:7]{index=7}.

### Selected API End-points
| Function | Purpose |
|----------|---------|
| `useExpenseInfo(id)` | fetch complete expense detail |
| `createMateRelationship(mateId)` | mutual friendship + zero balance |
| `useGroupMembersWithBalance(groupId)` | members & current debts | :contentReference[oaicite:8]{index=8} |

---

## 👤 My Contribution (Martin Ševčík)
- **User account module** – profile edit, authentication hooks, QR share   
- **Friends dashboard** – list with per-friend balance, add / accept requests :contentReference[oaicite:10]{index=10}  
- **Expense CRUD** – dialogs, custom split logic, *Get Even* settlement :contentReference[oaicite:11]{index=11}  
- Unit & UX tests; peer usability study and iteration after feedback :contentReference[oaicite:12]{index=12}  

---

## 🚀 Running Locally
```bash
# prerequisites: Node 20+, Expo CLI
npm install
expo start         # QR-launch on device or run in emulator
````

> Supabase keys are stored in `.env.example` – create `.env` with your own project keys.

---

## ✅ Testing

* **Cypress** workflows validate happy paths + edge cases (QR join, debt settle).
* Two hallway-tests uncovered navigation pain-points; moving the QR button to the
  group header improved discoverability .

## Directory Structure
The following is the structure of the Evenmate project:

```
Evenmate/                
├── api/                           # Backend API functions (Authors: Martin Ševčík, Jakub Lůčný)        
│   ├── expenses/      
│   │   └── index.ts
│   ├── getBalance/
│   │   └── index.ts 
│   ├── groups/
│   │   └── index.ts
│   ├── involvedUsers/
│   │   └── index.ts
│   ├── mates/
│   │   └── index.ts
│   ├── profiles/
│   │   └── index.ts
│   ├── Rel_inGroup/
│   │   └── index.ts
│   ├── sign-up/
│   │   └── index.ts
│   ├── updateBalances/
│   │   └── index.ts
│   ├── getCurrentUserId.ts      
│   
├── app/                            # Main Frontend app directory (Authors: Martin Ševčík, Jakub Lůčný)
│   └── (auth)/                     # Authentication-related components (Author: Jakub Lůčný)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   └── (shared)/                   # Shared components and functions (Authors: Martin Ševčík)
│   │   ├── account/                # Account settings
│   │   │   ├── _layout.tsx
│   │   │   ├── accountSettings.tsx
│   │   │   └── index.tsx
│   │   ├── expense/                # Expense management
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx
│   │   │   └── editExpense/
│   │   │       ├── _layout.tsx
│   │   │       └── [id].tsx
│   └── (user)/                     # User profile management, Core of the App
│   │   ├── expenseDetails/         # Expense details (Authors: Martin Ševčík)
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── selectMates.tsx
│   │   ├── friendDetails/          # Friend details (Authors: Martin Ševčík)
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   ├── addNewMate.tsx
│   │   │   └── getEvenMate.tsx
│   │   ├── groupDetails/           # Group details (Authors: Jakub Lůčný)
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── createGroup.tsx
│   │   │   ├── joinGroup.tsx
│   │   │   └── group/
│   │   │       ├── _layout.tsx
│   │   │       ├── [id].tsx
│   │   │       ├── index.tsx
│   │   │       ├── getEvenGroup.tsx
│   │   │       ├── getEvenMate.tsx
│   │   │       ├── groupNotes.tsx
│   │   │       ├── groupTodo.tsx
│   │   │       ├── groupSettings.tsx
│   │   │       ├── groupOverview.tsx
│   │   │       └── todoDetails/
│   │   │           ├── _layout.tsx
│   │   │           └── [id].tsx
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── _layout.tsx
│   ├── +html.tsx
│   ├── +not_found.tsx
│   └── index.tsx
├── lib/                            # Authentication functions, Supabase (Authors: Martin Ševčík, Jakub Lůčný)
│   ├── auth.tsx
│   └── supabase.tsx
├── providers/                      # Context providers (Authors: Martin Ševčík, Jakub Lůčný)
│   ├── AuthProvider.tsx
│   └── QueryProvider.tsx
├── constants/                      # Constants (Authors: Martin Ševčík, Jakub Lůčný)
│   ├── Colors.ts                   # Predefined colors by Expo
│   └── styles.ts                   # Shared styles across _layouts
├── assets/                         # Images and other assets
│   └── images/
│       ├── cat-png.png
│       ├── defaultProfilePic.png
│       ├── defaultGroupPic.png
│       └── Evenmatelogo_1.png
```

---
