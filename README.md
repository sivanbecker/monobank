# מונופול — יחידת בנקאות דיגיטלית
# Monopoly Digital Banking Unit

An Android app that replaces the physical electronic banking unit from the Israeli edition of **מונופול סופר בנקאות אלקטרונית** (Monopoly Super Electronic Banking) by Hasbro.

---

## What It Does

The original game comes with a physical card reader that manages player balances and processes transactions by scanning barcodes on player and property cards. This app does the same thing using your phone's camera — no physical unit needed.

Designed to feel like a kids' game app: colorful, simple, and fully in Hebrew with RTL support.

---

## Features

- Scan player and street card barcodes using the phone camera
- Track each player's balance in real time
- Buy streets, pay rent, collect salary when passing Go
- Handle all 20 surprise card effects automatically
- Admin setup: register players, configure starting balance and game rules
- Supports 2–6 players

---

## Game Data

All card data is pre-loaded from the physical game cards:

- 16 street cards across 8 color groups (אילת, טבריה, באר-שבע, נתניה, רמת גן, ירושלים, חיפה, תל אביב)
- 20 surprise cards with various effects
- Player barcodes registered once during admin setup

---

## Tech Stack

- **React Native + Expo** — cross-platform, JS-based
- **expo-camera** — barcode scanning
- **AsyncStorage** — local on-device storage
- Target: Android (via Expo Go during development)

---

## Project Structure

```
monopolBankingUnit/
├── cards/
│   ├── street-cards/
│   │   └── street-cards.json     # All 16 street cards with rent data
│   └── surprise-cards/
│       └── surprise-cards.json   # All 20 surprise cards with effect types
├── game-instructions/            # Scanned game instruction pages
├── card-code-examples/           # Example card photos
├── PLAN.md                       # Full implementation plan with task list
└── README.md
```

---

## Status

In planning / early development. See [PLAN.md](PLAN.md) for the full task list.
