# Monopoly Banking Unit — App Plan

## What This App Is

A React Native (Expo) Android app that replaces the physical electronic banking unit included in the Israeli "מונופול סופר בנקאות אלקטרונית" board game (Hasbro).

The physical unit reads barcodes on player cards and street cards to process transactions. This app does the same using the phone camera, with a game-friendly UI designed for kids — colorful, simple, and supports Hebrew/English.

---

## Game Data (Pre-built)

All game data is hardcoded from the physical cards:

- **16 street cards** — 8 color groups (brown, light blue, pink, orange, red, yellow, green, dark blue), each with rent and full-group rent prices
- **20 surprise cards** — various effects: receive money, pay money, go to jail, move freely, pay/receive per player, etc.
- **Player cards** — each player has a personal card with a unique barcode, registered during admin setup

Data files:
- `cards/street-cards/street-cards.json`
- `cards/surprise-cards/surprise-cards.json`

---

## Implementation Plan

Each task = one small change, deployable and testable on phone.

---

### Phase 1 — Skeleton

- [ ] **Task 1** — Create Expo project. App launches and shows a basic screen with the game title. Load on phone via Expo Go.
- [ ] **Task 2** — Add bottom navigation bar with 3 tabs: Home, Admin, Game.
- [ ] **Task 3** — Add Hebrew text and RTL layout support across all screens.

---

### Phase 2 — Admin: Player Setup

- [ ] **Task 4** — "New Game" screen: add up to 6 players by entering name and choosing a color/avatar.
- [ ] **Task 5** — Player list screen showing each player's name, color, and starting balance (₪1500 default).
- [ ] **Task 6** — Admin settings screen: change starting balance, salary for passing Go (₪200 default), and other configurable values.

---

### Phase 3 — Camera & Barcode Scanning

- [ ] **Task 7** — Add camera screen with barcode scanning (using expo-camera). Display the raw scanned value on screen. Test with game cards.
- [ ] **Task 8** — Admin: scan each player's physical card to register their barcode → link to their player profile.
- [ ] **Task 9** — Admin: scan each street card to register its barcode → link to street data already in the JSON.

---

### Phase 4 — Core Game Transactions

- [ ] **Task 10** — "Pass Go" flow: select player → scan their card → add salary to balance.
- [ ] **Task 11** — "Buy Street" flow: scan player card + street card → deduct price, assign ownership, mark street as owned.
- [ ] **Task 12** — "Pay Rent" flow: scan payer card + street card → auto-detect owner, detect if full color group is owned, transfer correct rent amount.
- [ ] **Task 13** — Player balances screen: live view of all players and their current balance.

---

### Phase 5 — Surprise Cards

- [ ] **Task 14** — Surprise card screen: scan a surprise card → show card text and effect on screen.
- [ ] **Task 15** — Implement simple effects: receive, pay, payPerProperty.
- [ ] **Task 16** — Implement complex effects: payEachPlayer, receiveFromEachPlayer, receiveSharedWithChosenPlayer.
- [ ] **Task 17** — Implement jail effects: goToJailSelf, sendPlayerToJail, getOutOfJailFree.
- [ ] **Task 18** — Implement moveAnywhere: display board squares, player selects destination.

---

### Phase 6 — Polish & UX

- [ ] **Task 19** — Game-style visual design: custom fonts, colors, card animations, sound effects.
- [ ] **Task 20** — Transaction history log per player.
- [ ] **Task 21** — Bankruptcy detection: warn when a player's balance goes below zero.
- [ ] **Task 22** — End game screen: leaderboard showing final balances.
- [ ] **Task 23** — Reset/new game flow with confirmation.

---

## Tech Stack

| What | Choice |
|------|--------|
| Language | JavaScript / TypeScript |
| Framework | React Native + Expo |
| Barcode scanning | expo-camera + expo-barcode-scanner |
| Storage | AsyncStorage (local, on-device) |
| UI language | Hebrew (RTL) with English fallback |
| Target platform | Android (Expo Go for development) |

---

## Configurable Game Values (with defaults)

| Setting | Default |
|---------|---------|
| Starting balance | ₪1500 |
| Salary for passing Go | ₪200 |
| Max players | 6 |
