---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/pages"]
---

## Scope

The whole app shell and its screens: רשימה (the open list, ticked at home or in the shop; no shopping mode since spec 69), the add picker, the item page, קניות (trip history and spending), מצרכים (items and saved sets), הגדרות. Mode: Operate. Platform: iOS Home Screen web app, Ionic iOS mode, Hebrew RTL, designed at 375×647 first (iPhone SE). Build path: code-led; the chosen sketch is `.impeccable/mocks/decision/look-labels.html`.

## Audience and job

The owner. At home during the week: add what ran out. In the shop, phone in one hand and a cart or basket in the other: see what's left, take an item with one tap, and read what the last trips taught about it. After the till: total, receipt photo, a note.

## Direction contract

THESIS: Every item is a shelf label: a white card with the amount to take set big where the price would be, and the lesson from last time under the name. Refuses the category default of a grey checklist where the amount is a faint suffix and notes live on another screen.

OWN-WORLD: Cool grey shelf ground #e9ecef; white label cards #ffffff at 14px radius with one soft shadow; ink #14161a for text, outlines and the round add button; sale-tag yellow #ffd21f as the only accent (the count block, a filled tick, the active tab marker), always with ink on it; #b3261e only for the words "לא לקנות שוב" and "לא היה". Rubik throughout, weight 800 for numerals and titles. No paper texture, price-tag costume, patterns or dashed lines; navigation and controls stay standard iOS.

STORY: The owner sees how many items are left, runs an eye down one column of amounts, reads the note under a name at the shelf, taps once, and the label greys out and sinks.

FIRST VIEWPORT: 20px status strip on the grey ground; a 96px header with a 72px yellow block holding the items-left numeral at 46px, "נשארו" at 28px beside it and "12 בעגלה · 1 לא היה" under it, then a "סיום" outline pill and a round ink add button; a column of 60px label rows with 8px gaps, each with a fixed 58px amount column (26px numeral, unit under it), the name at 17px, one 13px line of note or verdict, a 28px tick ring and, at the row's end, a 40px photo square (a camera on grey when there's no photo) that opens the row's sheet (spec 84); a four-tab bar (רשימה, קניות, מצרכים, הגדרות) with a small yellow bar over the active tab.

Signature interaction: one tap anywhere on a label takes the item; the label turns grey, its name is struck through, its ring fills yellow with a tick, and it sinks under the waiting ones. Motion: the sink is a single 200ms slide, and a plain swap under reduce-motion.

Raises carried from the declined hand: the amount keeps one fixed column on every row; taken is struck through and ticked, not only dimmed; one big numeral per screen and everything else one size; "לא היה" is a word on the row and the row stays in the trip's record; an item's prices by date share one fixed scale.

FORM: Shelf labels (the label on a supermarket shelf edge), position 1 on the ordered list; the owner's rule ranks the page best first, so the roll's assigned index was not used. seed:c84fc99711e3b891

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Memorable moment

Standing at a shelf and seeing, under the item's name, the one line you wrote for yourself last time.

## Chosen sketches

Picked by the owner on impeccable's decision page on 2026-11-17. All are in `.impeccable/mocks/decision/`.

- רשימה in the shop (main screen): `look-labels.html`
- Add picker: `add-rows.html`
- Item page: `item-label.html`
- קניות: `trips-total.html`
- מצרכים: `items-rail.html`
- App icon: `icon-label.html`

## Unresolved

- רשימה with nothing taken yet (the plain list header, spec 71), the finish sheet, a finished trip's page, saved-set editing and הגדרות have no sketch; they inherit this system (spec 37).
- The main sketch's header says "סיום"; the spec's finish sheet opens from it.
- The sketches were drawn 390 wide and 647 tall; the build is checked at 375×647 (spec 23).
- The main sketch has no control for "לא היה"; the build puts it in a row swipe with a tap path on the row's sheet (spec 4), and no sketch shows it.
- An item with no verdict shows the two-part switch with neither half chosen (spec 33); no sketch shows that state.
