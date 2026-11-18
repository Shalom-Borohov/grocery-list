# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Stack

React + TypeScript + Vite, Ionic React forced to iOS mode, Dexie (IndexedDB), `vite-plugin-pwa`, `fflate` for a zip backup that holds the photos. The same stack as the owner's רכישות app, chosen by the owner on 2026-11-17. Hosted on GitHub Pages; no server.

## Users

One person, the owner, who does the household's grocery shopping. Nobody else looks at the app. They add to the list at home during the week, tick it off in the shop, and want each trip to go better than the last one.

## Product Purpose

Keep the grocery list, and remember what each trip taught. Success means that in the shop the owner sees what's left to take and, at the shelf, what they learned about that item last time: was it good, how much to take, what it cost. Afterwards they can see what a trip cost and look at its receipt.

## Positioning

A private grocery list that learns from the owner's own trips. Notes apps and list apps forget an item once it's ticked; here the item keeps its note, photo, verdict and prices and brings them back the next time it's on the list. No account, no sharing, no shop catalogue.

## Operating Context

- The owner shops both ways: a big supermarket trip with a cart every week or two (20 to 50 items), and short top-up trips in between (5 to 15 items, often with a basket).
- At home the list grows a few items at a time, whenever something runs out.
- In the shop the phone is in one hand and the cart or basket in the other; attention is on the shelves, and reception can be poor.
- After the till: the total, a photo of the receipt, maybe a note about the trip.
- Installed as an iPhone Home Screen web app on an iPhone SE (375×647 as a Home Screen app); works offline.

## Capabilities and Constraints

- One open list; saved sets of items can be poured into it. Items are ticked straight on the list, and finishing files the trip.
- In the shop an item is waiting, taken or "לא היה" (the shop didn't have it). What wasn't taken stays on the list for next time.
- An item keeps a name, a note, one photo, a usual quantity, an optional verdict ("לקנות שוב" / "לא לקנות שוב") and the prices the owner chose to record.
- The lessons the owner asked for: whether an item was good or bad, and how much to buy.
- A finished trip keeps its taken items, its "לא היה" marks, and an optional total, receipt photos and note.
- Prices are optional per item and never asked for while ticking. Spending is summed from trip totals, by month and year.
- Items the owner usually buys and hasn't listed are offered first when adding.
- Hebrew UI, full RTL. Brand names are often in English, so screens mix RTL and LTR text.
- Photos and data live on the device only, with a zip backup exported by hand.
- Out of the first version: the shop per trip, sending the list as text, aisles or categories, reading receipts automatically, barcodes, sharing between phones.
- Behaviour is decided in `docs/specs/2026-11-17-grocery-list-design.md`.

## Brand Commitments

- Name: מצרכים. Folder: `grocery-list`.
- Must feel at home as an iPhone app.
- Owner's standing taste: rounded corners and panels, calm screens with little text at once, one accent, no decorative patterns or ornamental bands.

## Evidence on Hand

- Single-user tool: no testimonials, customers or metrics exist, and none should be invented.
- Item and receipt photos are the owner's own, taken at runtime; design mockups use labelled placeholder photos and invented sample groceries.

## Product Principles

1. One tap at the shelf: taking an item is a single tap, and nothing else is ever required in the shop.
2. The lesson is where the item is: what the owner learned shows on the item when they reach for it, not in a separate place they'd have to look up.
3. Never blocked: a list, a trip and an item can each be saved with only a name; totals, receipts, prices and notes can wait or be skipped.
4. The app reminds, it doesn't decide: a "לא לקנות שוב" item can still be added, and a usual item is only offered.
5. Money stays quiet: totals are there when asked for, and the app never scolds about spending.

## Accessibility & Inclusion

Touch targets of at least 44pt, usable one-handed. Follows the system text size where Ionic allows. Nothing relies on colour alone: taken, "לא היה" and the verdicts each have a shape or a word. Photos carry the item name as their text alternative.
