# מצרכים: design

A personal iPhone PWA for grocery shopping. The owner keeps one open list, ticks items off in the shop, and each finished trip is filed with its total, receipt and a note. Every item remembers its own note, photo and prices, so the next trip starts with what the last ones taught. This file is the source of truth for product behaviour. New behaviour is added as a new numbered decision: "(added YYYY-MM-DD, extends/clarifies N)".

Items marked **(assumed)** were settled without asking the owner and can be struck by number. The owner approved the build plan that lists them (`~/.claude-personal/plans/2026-11-17-grocery-list-new-iphone-pwa.md`) on 2026-11-17 without striking any.

## Decisions

### The list and the trip

1. **The flow is list → trip → history.** The owner builds a list, ticks it off in the shop, and the finished trip lands in a history. Decided by the owner on 2026-11-17.
2. **There is one open list, and saved sets can be poured into it.** The owner adds to the list during the week as things run out. A saved set (for example "בסיס" or "שישי") is a named group of items with quantities; pouring it adds the items that aren't on the list yet. Why: you don't buy the same things every trip, so a fixed template would need pruning before each one. Decided by the owner on 2026-11-17 ("Both").
3. **The trip is the open list in shopping mode.** "Start shopping" records the start time and turns the list into the shop view; there is no copy. Only one trip runs at a time. Items can still be added during it. Why: one list means nothing to prepare or keep in step. (assumed)
4. **In the shop an item is waiting, taken, or "לא היה".** One tap marks it taken and a second tap takes that back. "לא היה" is for an item the shop didn't have. Decided by the owner on 2026-11-17 (the third state); the one tap is assumed.
5. **Taken items drop to the bottom of the list, dimmed.** Why: what's left to find stays under the thumb. (assumed)
6. **Finishing a trip files the taken items and the "לא היה" marks. Waiting and "לא היה" items stay on the open list for next time,** the "לא היה" ones with a small "לא היה בפעם שעברה". (assumed)
7. **Finishing opens a sheet with the total, receipt photos and a note, all optional.** Saving takes one tap with nothing filled in. Each can be added or changed later on the trip's page. Decided by the owner on 2026-11-17 (receipt and total, trip note); "all optional" is assumed.
8. **A trip can hold several receipt photos.** Why: a supermarket receipt is often too long for one readable photo. (assumed)
9. **A trip's photos are its receipt photos; it has no other photos.** (assumed)
10. **Adding opens a picker: a search field over the items bought before, most often bought first.** Tapping one adds it and the picker stays open; typing a name that doesn't exist offers to create it. (assumed)
11. **"בדרך כלל" hints:** items taken on at least half of the last six trips that aren't on the list come first in the picker, under their own heading. With fewer than three trips there are no hints. Decided by the owner on 2026-11-17; the numbers are assumed.
12. **A saved set is made from scratch, from the open list or from a finished trip,** and can be edited, renamed and deleted. (assumed)

### Items

13. **Every item is a record of its own: a name (required) and an optional note, photo and usual quantity.** Renaming an item keeps its history. Names are trimmed, and two items can't share a name. (assumed)
14. **The note and photo belong to the item and carry over** to every list and trip it appears on, until the owner changes them. In the shop, the note shows in one line under the name, with the photo's thumbnail beside it. Why: the lesson has to be in view at the shelf. Decided by the owner on 2026-11-17.
15. **One photo per item.** (assumed, same as רכישות)
16. **Quantity is a number and a unit: יח׳, ק״ג, גרם or ליטר.** It starts from the item's quantity on its last trip, or 1 יח׳, and "1 יח׳" isn't shown. Decided by the owner on 2026-11-17 (quantity); the units are assumed.
17. **A price is optional and per item.** It is in ₪, may have agorot, and means the price of one unit (one יח׳, one ק״ג), as on the shelf label. The last price is shown as a hint, and it is recorded for this trip only when the owner confirms or types it. Why: ticking stays one tap, and a price nobody checked never enters the history. Decided by the owner on 2026-11-17; the unit price and the confirm step are assumed.
18. **An item's page shows its photo, note, when it was last bought, how many times, how many times it wasn't there, and its prices by date.** (assumed)

28. **An item can carry a verdict: "לקנות שוב" or "לא לקנות שוב".** It is optional and set on the item's page or from the trip's page after shopping. The verdict shows next to the item in the picker, on the list and in the shop, always as words and not only a colour. Adding a "לא לקנות שוב" item is still allowed. Why: the owner wants to see whether something was good or bad before buying it again, and the app reminds without blocking. Decided by the owner on 2026-11-17 (good or bad); the two values and where they show are assumed.
29. **"How much to buy" is carried by the quantity and the note.** The quantity starts from last time (16), and the note, in view at the shelf (14), says when that was too much or too little. There is no separate field. Decided by the owner on 2026-11-17 (the lesson); the mechanism is assumed.

### Screens

19. **The tabs are רשימה, קניות, מצרכים and הגדרות.** רשימה is the open list and the shop view; קניות is the trip history; מצרכים is the items and the saved sets. (assumed; every chosen sketch draws these four)
20. **Spending sits at the top of קניות:** a חודש / שנה switch, the period's total, the number of trips and the average per trip. A trip without a total counts as a trip and is left out of the money, and the summary says how many those are. There are no budgets or warnings. Decided by the owner on 2026-11-17 (the summary); its place and contents are assumed.
21. **Everything can be edited and deleted; deleting asks first** and removes the record's photos. Deleting an item keeps it, by name, in the trips it was bought on. (assumed)
22. **הגדרות has "דיווח על באג / הצעה":** a sheet for the text, then a prefilled GitHub issue with the version and device details and none of the owner's data. Decided by the owner on 2026-11-17.
23. **Screens are designed and checked at 375×647 first,** the owner's iPhone SE as a Home Screen app. (assumed, same as אימונים)

30. **The look is "Shelf labels".** Every item is a white label card on a cool grey ground, with the amount in one fixed column where a shelf label has its price, the name beside it and one line of note or verdict under the name. Yellow is the only accent; red is used only for the words "לא לקנות שוב" and "לא היה". The header of the shop view shows the number of items left as the one big numeral. Layout: `.impeccable/mocks/decision/look-labels.html`, picked by the owner on impeccable's decision page on 2026-11-17. The full contract is in `.impeccable/surfaces/src-app-tsx.md`.
31. **A taken item is struck through and ticked as well as greyed,** and "לא היה" is a word on the row. Why: a state is never shown by colour alone. (assumed, from the look's contract; clarifies 4 and 5)
32. **The add picker is one list in a sheet:** a search field, then "בדרך כלל" as label rows, then the saved sets as buttons that pour the set, then "כל המצרכים". A row's ring fills when the item is added, a second tap takes it back off, and the header counts what was added ("נוספו 3"). Layout: `.impeccable/mocks/decision/add-rows.html`, picked by the owner on impeccable's decision page on 2026-11-17 (clarifies 10, 11 and 2; the second tap is assumed).
33. **An item's page is its label, enlarged:** one card with the usual amount, the name, the photo, the verdict as a two-part switch and the note; under it "מחירים", one bar per recorded price, newest first, each as long as its price relative to the highest one shown; and "הוספה לרשימה" pinned above the tab bar. Tapping the chosen half of the switch clears the verdict. Layout: `.impeccable/mocks/decision/item-label.html`, picked by the owner on impeccable's decision page on 2026-11-17 (clarifies 18 and 28; clearing by a second tap and "relative to the highest" are assumed).
34. **קניות shows the period's total on a yellow block with the number of trips and the average, then each trip as a label row** with its day in the fixed column, its item count, the words "קבלה" and "לא היה N" when they apply, and its total at the end. Layout: `.impeccable/mocks/decision/trips-total.html`, picked by the owner on impeccable's decision page on 2026-11-17 (clarifies 20).
35. **מצרכים has the saved sets as a sideways row of cards on top, then a search field and every item as a label row** with its usual amount, its note or verdict and its photo. Items are in alphabetical order. The + button offers "מצרך חדש" and "ערכה חדשה". Layout: `.impeccable/mocks/decision/items-rail.html`, picked by the owner on impeccable's decision page on 2026-11-17 (clarifies 19; the order and what + offers are assumed).
36. **The app icon is a white shelf label on yellow with a heavy ink tick and two bars,** drawn as solid shapes with soft depth. Drawing: `.impeccable/mocks/decision/icon-label.html`, picked by the owner on impeccable's decision page on 2026-11-17.
37. **Screens without a sketch inherit the look:** the list at home is the same label rows without tick rings, with "התחלת קנייה" as the yellow button; the finish sheet is a plain sheet with the total field, receipt photos and note; a finished trip's page lists its items as label rows with its total, receipts and note above them; הגדרות is a standard grouped list. (assumed)

38. **A row's amount column opens that row's sheet:** amount and unit, price, "לא היה", "הסרה מהרשימה" and a link to the item's page. In the shop, swiping a row offers "לא היה" as a shortcut. Why: a tap anywhere else on the row takes the item, and every swipe needs a visible tap path. (added 2026-11-17, extends 4 and 17; assumed in the approved plan)
39. **At home, before "התחלת קנייה", rows have no tick ring;** tapping a row opens the same sheet, and swiping offers "הסרה". (added 2026-11-17, extends 37; assumed in the approved plan)
40. **Finishing a trip with nothing taken and nothing marked "לא היה" files no trip;** it only leaves shopping mode. Why: it is the way out of an accidental start. (added 2026-11-17, extends 7; assumed in the approved plan)
41. **The app is always light; there is no dark mode in the first version.** Why: the look was chosen as a light one, and shop lighting favours it. (added 2026-11-17, extends 30; assumed in the approved plan)
42. **There is no update bar and no "מה חדש";** the app updates itself on the next launch, as רכישות does. הגדרות shows the version and build time. (added 2026-11-17, extends 22; assumed in the approved plan)
43. **Prices and totals are amounts in ₪ with up to two decimals,** from 0 up to 100,000. (added 2026-11-17, clarifies 17 and 7; assumed in the approved plan)

44. **A set made from the list keeps the amounts on the list,** not the items' usual amounts. Why: the list holds the amounts the owner just tuned. (added 2026-11-17, extends 12; assumed during the build)
45. **Set cards are in the order they were made, oldest first; a set's items are alphabetical.** (added 2026-11-17, extends 35; assumed during the build)
46. **In the shop, swiping a row the shop didn't have offers "היה בכל זאת",** matching the row sheet's button; a taken row has no swipe. (added 2026-11-17, extends 38; assumed during the build)
47. **In the picker, "בדרך כלל" leaves out what was on the list when the sheet opened, but keeps what was added in this opening, ticked,** so a row doesn't vanish under the finger. A row already taken or marked "לא היה" in the shop isn't taken off by a tap there. (added 2026-11-17, extends 11 and 32; assumed during the build)
48. **With no finished trips, קניות shows only a line saying finished trips appear there,** with no ₪0 block. (added 2026-11-17, extends 34; assumed during the build)
49. **On a trip's page each taken line shows the item's note or verdict under it, and a deleted item shows the name stored on the trip.** Only the row's body opens the line sheet. (added 2026-11-17, extends 21; assumed during the build)
50. **Money shows whole shekels without agorot and agorot always as two digits** (₪875, ₪412.30). (added 2026-11-17, clarifies 43; assumed during the build)
51. **When a second message comes while one is showing, the first one closes and the second shows.** Why: Ionic dropped the second, so pouring two sets quickly showed only one result. (added 2026-11-17; assumed during the build)

52. **Every name prompt (a new item, a new set, renaming a set, saving a trip as a set) trims the name; a blank name closes the prompt and saves nothing.** Why: one behaviour across screens; before, one prompt stayed open and another closed. (added 2026-11-17; assumed during the build)

53. **"לא היה בפעם שעברה" lasts one trip:** when the next trip is filed and the item was neither taken nor marked missing again, the words go. Why: after another trip it is no longer true of the last time. (added 2026-11-17, clarifies 6; from code review)
54. **The finish sheet can't be saved while the total isn't a valid price;** the field says why. On a row or a trip's page, invalid text is simply not saved. Why: a total the owner can't see must never be filed. (added 2026-11-17, extends 7 and 43; from code review)
55. **A trip's note saves as it is typed,** like its total. Why: on iOS, leaving the page doesn't always end editing, so a note saved on leaving the field could be lost. (added 2026-11-17, clarifies 7; from code review)

56. **A price typed on a row is for this trip only:** finishing a trip drops it from every row that stays on the list, and the row sheet offers last time's price as a one-tap "כמו בפעם שעברה: ₪9.90" button beside the hint. (added 2026-11-17, clarifies 17; from spec review)
57. **Removing an item's photo asks first,** as every delete does. (added 2026-11-17, applies 21; from spec review)
58. **The + on מצרכים offers "מצרך חדש", "ערכה ריקה" and "ערכה מהרשימה" (the last only when the list has items),** the two kinds of new set from 12. (added 2026-11-17, clarifies 35; from spec review)
59. **The one line under a name shows, in order of priority: "לא היה", "לא היה בפעם שעברה", "לא לקנות שוב", the note, "לקנות שוב".** Why: there is room for one line; warnings come first; the note is the lesson, so it beats the friendly verdict. (added 2026-11-17, resolves 14, 28 and 30; from spec review)
60. **In the picker, a tap on an item waiting on the list takes it off, whenever it was added.** Why: its ring is ticked, so a tap unticks it. (added 2026-11-17, extends 32; from spec review)
61. **Taking an item off the list doesn't ask;** the item and its history stay, and adding it back undoes it. (added 2026-11-17, clarifies 21; from spec review)
62. **At home the row sheet has no "לא היה";** it only means something in the shop. (added 2026-11-17, clarifies 39; from spec review)
63. **A set made from a trip holds the items taken on it that still exist, with the amounts bought on it.** (added 2026-11-17, extends 12 and 44; from spec review)
64. **On a trip's page, a line's price and its item's verdict can be changed; its amount, its state and the trip's times are a record and stay fixed.** (added 2026-11-17, narrows 21; from spec review)
65. **With fewer than six trips, "half" in 11 means half of the trips there are.** (added 2026-11-17, clarifies 11; from spec review)

66. **On a trip's page the total is the page's one big numeral, edited in place, and an empty note is a single "הוספת הערה" row until tapped.** Why: one big numeral per screen, and a calm page. (added 2026-11-17, clarifies 37; from the finish review)
67. **When an item is already on the list, its page says "כבר ברשימה" with a tick in place of the add button.** Why: a disabled yellow button read as broken. (added 2026-11-17, clarifies 33; from the finish review)

### Data

24. **Everything lives on the phone only, with a zip backup exported and imported by hand** from הגדרות. No account, no server, no sharing. Decided by the owner on 2026-11-17 (only me, on my phone); the zip is assumed, same as רכישות.
25. **Photos are stored twice, at most 1600 px and as a 240 px thumbnail.** (assumed, same as רכישות)
26. **The stack is the one רכישות uses:** React, Ionic in iOS mode, Dexie, valibot, Vite with the PWA plugin, Vitest, oxlint, GitHub Pages from a public repo. The folder and repo are `grocery-list`. (assumed)

### Not in the first version

27. The shop per trip, sending the list as text, aisles or categories, reading a receipt automatically, barcodes, a backup reminder, sharing a list between phones.
