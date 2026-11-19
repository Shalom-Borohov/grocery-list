---
name: מצרכים
description: A private Hebrew grocery list where every item is a shelf label that remembers the last trip.
colors:
  shelf-grey: "#e9ecef"
  label-white: "#ffffff"
  ink: "#14161a"
  ink-soft: "#555a61"
  sale-yellow: "#ffd21f"
  warning-red: "#b3261e"
  taken-grey: "#dde1e5"
  taken-text: "#5a5f66"
  divider: "#e3e6ea"
  taken-divider: "#cdd2d7"
typography:
  display:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "2.875rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
  numeral:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  title:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1.1
  body-strong:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
  body:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  caption:
    fontFamily: "Rubik, -apple-system, BlinkMacSystemFont, Arial Hebrew, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
rounded:
  thumb: "10px"
  row: "14px"
  control: "14px"
  button: "16px"
  tile: "18px"
  card: "20px"
  pill: "999px"
spacing:
  row-gap: "8px"
  gutter: "16px"
  tap: "44px"
  amount-column: "58px"
  row-height: "60px"
components:
  label-row:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    height: "{spacing.row-height}"
    padding: "8px 12px"
  label-row-taken:
    backgroundColor: "{colors.taken-grey}"
    textColor: "{colors.taken-text}"
    rounded: "{rounded.row}"
  count-tile:
    backgroundColor: "{colors.sale-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.tile}"
    size: "72px"
  spending-block:
    backgroundColor: "{colors.sale-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  panel:
    backgroundColor: "{colors.label-white}"
    rounded: "{rounded.card}"
    padding: "16px"
  button-primary:
    backgroundColor: "{colors.sale-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.button}"
    height: "50px"
    padding: "0 22px"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "{spacing.tap}"
    padding: "0 16px"
  button-quiet:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "{spacing.tap}"
    padding: "0 18px"
  button-round:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.pill}"
    size: "{spacing.tap}"
  button-danger:
    textColor: "{colors.warning-red}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 22px"
  tick-ring:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "28px"
  tick-ring-ticked:
    backgroundColor: "{colors.sale-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "28px"
  choice:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "{spacing.tap}"
    padding: "0 15px"
  choice-selected:
    backgroundColor: "{colors.sale-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  segmented:
    backgroundColor: "{colors.taken-grey}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.control}"
    padding: "3px"
  segmented-selected:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink}"
    rounded: "11px"
  field:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 14px"
  tab-bar:
    backgroundColor: "{colors.label-white}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
---

# Design System: מצרכים

## Overview

**Creative North Star: "Shelf Labels"**

Every item is the label on a supermarket shelf edge: a white card on a cool grey shelf, the amount to take set big in a fixed column where the price would be, and the lesson from last time on one line under the name. The system is built for a phone held in one hand in a shop aisle, so it reads in one glance down a single column of numerals, and one tap anywhere on a label takes the item.

The screens are calm and standard iOS underneath: Ionic iOS navigation, back buttons, sheets and a four-tab bar stay native. The world lives in the labels, in heavy Rubik numerals, and in one sale-tag yellow that only ever marks "this is the number that matters" or "this one is done". There is no costume: no paper texture, no price-tag die-cut, no patterns or dashed lines. Hebrew RTL throughout, with numerals isolated LTR and tabular.

**Key Characteristics:**
- White rounded labels (14px) on a cool grey ground, 8px apart, one soft shadow.
- A fixed 58px amount column with a divider on every row, so amounts line up down the screen.
- Rubik at three weights only (400, 500, 800); 800 for numerals and titles.
- One accent, sale-tag yellow, always carrying ink on top of it.
- Taken is grey, struck through and ticked, never colour alone.

## Colors

A cool, near-neutral shelf palette with one loud retail yellow and one red reserved for warnings.

### Primary
- **Sale-Tag Yellow** (sale-yellow): the only accent. The items-left tile, the spending total block, a filled tick ring, the selected choice chip, the primary button, the newest price bar and the active-tab marker. Ink always sits on it, never white.

### Neutral
- **Shelf Grey** (shelf-grey): the ground of every screen, toolbar and sheet; also the inset ground for notes and stepper buttons inside a white card.
- **Label White** (label-white): label rows, panels, fields, quiet buttons and the tab bar.
- **Shelf Ink** (ink): text, outlines (outline pill, tick ring), the round add button, price bars and the focus ring.
- **Soft Ink** (ink-soft): secondary lines, units, section headings, placeholders, inactive tabs.
- **Taken Grey** (taken-grey) with **Taken Text** (taken-text) and **Taken Divider** (taken-divider): the taken label, the segmented control track and empty price tracks.
- **Divider** (divider): the amount column rule and the tab bar's top border.

### Tertiary
- **Warning Red** (warning-red): the words "לא לקנות שוב" and "לא היה", field errors, and the destructive text button. Never a fill.

### Named Rules
**The Ink-On-Yellow Rule.** Anything yellow carries ink (#14161a) text or strokes; yellow never carries white and never appears as text colour.

**The One Accent Rule.** Yellow marks either the one number that matters on the screen or a done/selected state. It is not used for decoration, headings or borders.

**The Red Is A Word Rule.** Warning red is text only: a verdict, a "לא היה" mark, an error or a destructive action label. No red fills, badges or borders.

## Typography

**Display Font:** Rubik (with -apple-system, BlinkMacSystemFont, Arial Hebrew)
**Body Font:** Rubik
**Label/Mono Font:** Rubik, tabular numerals everywhere

**Character:** One rounded grotesque with Hebrew and Latin, loaded locally at 400, 500 and 800. The jump from 500 to 800 is the whole hierarchy: heavy numerals and titles, everything else plain.

### Hierarchy
- **Display** (800, 2.875rem, line-height 1): the one big numeral per screen: items left in the shop tile; the spending total and the item page amount use the 2.75rem step of the same role.
- **Headline** (800, 1.75rem, 1.15): page titles and the "נשארו" title.
- **Numeral** (800, 1.625rem, 1): the amount in each label's column, the stepper value, the item name on its page.
- **Title** (800, 1.375rem, 1.1): sheet titles (the add picker) and saved-set card names. Trip totals and line prices use 800 at 1–1.0625rem.
- **Body Strong** (500, 1.0625rem): the item name on a label row; sheet actions.
- **Body** (400, 1rem): fields, notes, buttons (buttons at 500).
- **Label** (400, 0.8125rem): the one secondary line under a name, quiet text, section headings (500, soft ink); field labels at 0.875rem.
- **Caption** (500, 0.6875rem): units under an amount and tab labels.

### Named Rules
**The One Big Numeral Rule.** Each screen has at most one display numeral; every other number is a row numeral or body size.

**The Three Weights Rule.** Only 400, 500 and 800 are loaded. Do not ask for 600 or 700.

**The Isolated Numeral Rule.** Numbers and prices sit in an LTR-isolated, tabular span inside RTL text.

## Layout

A single column at phone width (designed and checked at 375×647, iPhone SE as a Home Screen app). Every screen uses a 16px side gutter. Lists are stacks of label rows with an 8px gap, each row at least 60px tall. The amount column is fixed at 58px (64px on the item page card) on the inline-start side, so amounts form one readable column. Sheets use a 16px vertical rhythm between fields. Pages clear the tab bar with 64px plus the safe area plus 16px. Section headings sit 18px above and 6px below their block. Every tap target is at least 44px. One line per row: names and secondary lines truncate with an ellipsis rather than wrap; long text lives on the item page behind a tap.

## Elevation & Depth

Nearly flat. White labels lift off the grey ground by colour and one hairline-soft shadow; only the item page's main card is raised further. Taken labels drop their shadow and sink into the ground colour, so depth also means "still to do".

### Shadow Vocabulary
- **Label** (`box-shadow: 0 1px 2px rgba(20, 22, 26, 0.08)`): label rows, panels, set cards, receipt thumbnails, the selected segment.
- **Raised** (`box-shadow: 0 4px 14px rgba(20, 22, 26, 0.1)`): the item page's main card only.

### Named Rules
**The Taken Sinks Rule.** A taken label loses its shadow, takes the taken grey and moves below the waiting ones; it never floats.

## Shapes

Everything is rounded; nothing is square or edge to edge. Label rows and controls share 14px; primary buttons 16px; the yellow count tile and set cards 18px; panels, the spending block and sheets 20px. Pills (999px) for the outline button, choice chips and the add button circle. Photos inside a row use 10px; the inset note and stepper buttons inside a card use 12px. The only internal line is the 1px amount-column divider. No dashed lines, die-cut corners or notches.

## Components

### Label Row (signature)
The shelf label. A white 14px card, min 60px, with a fixed amount column (numeral at 1.625rem/800, unit as a caption beneath, 1px divider on its inline-end side), then the name (body strong, one line) and one secondary line (label size): the note, or the verdict as a word ("לקנות שוב" in ink 500, "לא לקנות שוב" in warning red 500), or "לא היה" in red. An optional 40px photo and a trailing slot (tick ring, chevron, or price) follow. The whole row is the tap target.
- **Taken:** taken grey ground, no shadow, taken text, name struck through, tick ring filled yellow with an ink tick; it sinks below waiting rows with a single 200ms ease-out slide (12px, from 0.6 opacity), a plain swap under reduced motion.
- **Swipe:** the row sits in an end-side swipe; every swipe action also has a tap path.
- **On the list:** the photo leaves the tap target and becomes a square at the row's end, after the tick ring: the 40px photo, or a 40px ground tile with a 20px soft-ink camera. It opens the row's sheet; the rest of the row still takes the item. It dims with a taken row.

### Tick Ring
28px circle with a 2px ink stroke; filled yellow with an ink tick when taken.

### Count Tile
72px yellow square at 18px radius holding the items-left display numeral, with the "נשארו" headline and one soft-ink detail line beside it. The yellow spending block on קניות is its wider sibling (20px radius, 16px padding, total at 2.75rem/800, the period named above it as data).

### Buttons
- **Primary:** sale yellow, ink text 1rem/500, 16px radius, 50px tall, 22px side padding; full-width in footers ("להוסיף לרשימה").
- **Outline:** 2px ink stroke pill, 44px, for a secondary action next to the primary one ("סיום").
- **Quiet:** white 14px block, 44px, for neutral actions on the grey ground.
- **Round:** 44px ink circle with a white solid plus; the add button.
- **Danger:** text-only warning red, 48px, centred under content.
- **Press:** all buttons and links dim to 0.65 opacity on press (120ms ease-out); disabled at 0.35–0.45.

### Chips
- **Choice:** white pill, 44px, 0.9375rem; selected turns yellow with weight 500.
- **Segmented:** taken-grey 14px track with 3px padding; the selected segment is a white 11px block with the label shadow and ink text. The verdict switch is a segmented pair; its "לא לקנות שוב" half turns red text when chosen; neither half is chosen when there is no verdict.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** white on the shelf grey; inner insets use the shelf grey.
- **Shadow Strategy:** the label shadow; the item card alone uses the raised shadow.
- **Border:** none.
- **Internal Padding:** 16px (14px for trip fields and set cards).

### Inputs / Fields
- **Style:** white, no border, 14px radius, 48px tall, 14px side padding, 1rem text, soft-ink placeholder. Inside a white card the field takes the shelf grey instead. Labels sit above at 0.875rem soft ink; errors below at 0.8125rem warning red. Prices are LTR with a ₪ prefix inside the box.
- **Search:** same block with a solid magnifier, 48px.
- **Stepper:** white 14px track holding two 44px grey 12px-radius buttons and a 1.625rem/800 value.
- **Focus:** a 2px ink outline, 2px offset (0 for the search block).

### Navigation
Standard Ionic iOS: grey toolbars with no border, ink back button, sheets on the grey ground. The tab bar is white with a 1px divider top border, four tabs (רשימה, קניות, מצרכים, הגדרות) with solid 26px icons; inactive tabs soft ink, the selected tab ink with a 24×4px yellow bar above its icon.

### Price Bars
One row per recorded price: date (soft ink, 0.875rem), a 10px rounded track on one fixed scale for the item, an ink bar, and the price (0.9375rem, 500). The newest price is a yellow bar with a 1.5px ink stroke.

## Do's and Don'ts

### Do:
- **Do** put every list item in a label row with the fixed amount column, even when the amount is empty, so the column stays aligned.
- **Do** keep the screen to one display numeral and one yellow focus.
- **Do** mark state with a shape or a word as well as colour: struck through and ticked for taken, the words "לא היה" and "לא לקנות שוב" in red.
- **Do** use solid filled SVG icons (`fill: currentColor`) at 16–30px.
- **Do** keep 44px minimum tap targets and a 16px gutter on every screen.
- **Do** put new screens on the shelf-grey ground with white 14–20px rounded blocks and native Ionic iOS navigation.

### Don't:
- **Don't** put white text on yellow, or use yellow for headings, borders or decoration.
- **Don't** use warning red as a fill, badge or border.
- **Don't** add paper texture, price-tag costume, patterns, dotted or dashed lines, or ornamental bands.
- **Don't** let a row wrap to a second secondary line; truncate and move the long text to the item page.
- **Don't** use font weights other than 400, 500 and 800.
- **Don't** put a decorative kicker or eyebrow above a title; a small line above a number is allowed only when it is data (the spending period).
