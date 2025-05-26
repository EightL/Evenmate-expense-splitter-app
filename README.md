# Project: Evenmate

## Authors
- **Martin Ševčík**
- **Jakub Lůčný**  
- *VUT FIT 2024/2025*

![Logo](/screenshots/image)

---
# Evenmate – Split-&-Settle Expenses with Friends

> **Cross-platform mobile app (React Native + Expo, TypeScript) that lets friends keep a shared ledger, optimise repayments and plan events – backed by Supabase (PostgreSQL, Auth, Realtime).**  

---

## 📑 Contents
1. [Key features](#key-features)  
2. [Tech stack](#tech-stack)  
3. [System architecture](#system-architecture)  
4. [Database & API highlights](#database--api-highlights)  
5. [UX research & testing](#ux-research--testing)  
6. [Directory Structure](#directory-structure)  

---

## Key features

| Domain | Details |
|--------|---------|
| **Expense tracking** | Add an expense, pick participants, choose *equal*, *shares* or custom split. The UI always shows *who owes whom* at a glance.|
| **Multi-group & friends ledger** | Keep personal friend balances and belong to multiple groups at once – each with its own currency and picture. |
| **Get Even optimiser** | Single-tap algorithm minimises the number of repayments between any two users. |
| **QR onboarding** | Join a group or add a mate by scanning a QR code – no e-mail search needed. |
| **Notes & To-Do** | Shared whiteboard and task list inside every group for packing lists or chores. Drag to complete. |
| **Realtime sync** | Supabase channel broadcasts instantly update all open devices. |

## Design

### Groups
![1](/screenshots/Evenmate_groups)
### Get Even, Expenses
![2](/screenshots/Evenmate_Geteven_expenses)
### Auth, Group
![3](/screenshots/Evenmate_authentication_group)
### Account, Mates
![4](/screenshots/Evenmate_Account_Mates)

---

## Tech stack

| Layer | Technology | Why |
|-------|------------|-----|
| **UI** | React Native + Expo | Single codebase, OTA updates, Expo Go for fast testing. |
| **State / Data** | React-Query | Typed hooks wrapping Supabase RPC / REST. |
| **Backend-as-a-Service** | Supabase (PostgreSQL + Auth + Realtime) | Open-source, instant REST endpoints, row-level security. |
---

## System architecture

```

┌──────────────┐        HTTPS / Realtime WS        ┌──────────────┐
│   Expo app   │  ───────────────────────────────► │  Supabase    │
│ (React Native│                                   │  (PostgreSQL │
│   + TypeScript)◄───────────────────────────────  │   + Auth)    │
└──────────────┘   Row Level Security + RPC       └──────────────┘

````

Front-end and back-end are completely decoupled. All data flows through typed
hooks (React-Query) that wrap Supabase RPC functions such as
`useGroupMembersWithBalance(groupId)` and `createMateRelationship(mateId)`.

---

## Database & API highlights

| Table / RPC | Purpose |
|-------------|---------|
| **`users`** | profile, avatar URL, IBAN, created_at |
| **`mates`** | mutual friendships with running balance |
| **`groups`** | name, currency, picture, owner_id |
| **`expenses`** | title, amount, group_id (nullable), payer_id, created_at |
| **`rel_owes`** | *n:m* bridge ⇒ who owes how much on each expense |
| **`createExpense()`** | inserts expense + bulk `rel_owes`, returns new balance snapshot |
| **`getEvenMate()`** | returns minimal repayment graph between two users  |


## UX research & testing

* Comparative analyses (Splitwise, Tricount, SettleUp) uncovered pain-points like hidden debt
overview and pay-walled features.  
* Hallway tests (1 × tech-savvy, 3 × average user) praised simplicity but flagged profile-edit
discoverability; button prominence fixed in v1.1.  

---

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
