# CLAUDE.md

## What this is

מצרכים: a personal iPhone PWA for grocery shopping. One open list, with no shopping mode: one tap takes an item, at home or in the shop; while anything is taken or marked לא היה, "סיום" files the trip with an optional total, receipt photos and note. Every item keeps a note, a photo, a verdict (לקנות שוב / לא לקנות שוב) and the prices recorded on trips, so the next trip starts with what the last ones taught. Hebrew, RTL, always light. Everything lives in IndexedDB on the device, with a zip backup file (`data.json`, `photos/<photo id>.jpg`, `thumbnails/<photo id>.jpg`).

## Commands

- `npm run dev`: Vite at `http://localhost:5173/grocery-list/`. The app uses a hash router. Through portless: `portless run vite`.
- `npm test`: the Vitest suite (it already passes `--maxWorkers=25%`; don't add it again). One file: `npx vitest run test/unit/finishTrip.test.ts`.
- `npm run lint`: oxlint.
- `npm run build`: `tsc -b && vite build`. This is the type check. The editor's Dexie key-type diagnostics are noise; trust `tsc -b`.
- Run tests and browser jobs under `systemd-inhibit --what=sleep:idle`, or a suspending laptop breaks them.

## Sources of truth

- `docs/specs/2026-11-17-grocery-list-design.md`: numbered decisions. Add new behaviour there as a new numbered decision.
- `PRODUCT.md`: product principles.
- `.impeccable/surfaces/src-app-tsx.md` and the chosen sketches in `.impeccable/mocks/decision/`: the visual system ("Shelf labels"). Screens are checked at 375×647, the owner's iPhone SE as a Home Screen app.

## Architecture

Imports go downward only: `pages` → `components` → `photo` → `data` → `copy` → `domain`. A folder may skip levels downward, never import upward.

- `src/domain/`: pure functions, no React or Dexie. `types.ts` holds the valibot schemas. `listOrder` (waiting, then missing, then taken), `finishTrip` (entries → trip lines, what stays on the list, usual amounts), `usualHints` ("בדרך כלל"), `pickerOrder`, `itemHistory`, `spending`, `pourSet`, `setEntries` (set editing and order), `itemJoin` (records joined to their items), `amount` (defaults and stepping), `secondaryLine` (what shows under a name), `itemNames`.
- `src/data/`: the Dexie database and repos split by responsibility: `itemsRepo`, `listRepo`, `tripsRepo` (finish shopping, trip edits, receipts), `setsRepo`, `photosRepo`, `backup`. Writes parse with the schemas. Photos are keyed by their own id; an item has `photoId`, a trip has `receiptPhotoIds`. `photoUrls` caches object URLs by photo id and `deletePhotos` revokes them. `RecordsProvider` runs one live query per table and combines them into `{ items, entries, trips, sets }`; screens read it with `useRecords()`.
- `src/photo/`: shrinking photos (1600 px and a 240 px thumbnail) and `usePhotoUrl(photoId, 'photo' | 'thumbnail')`.
- `src/components/`: UI shared by several screens: `LabelRow` (the shelf label: a fixed amount column, name, one secondary line, optional photo, a trailing slot) and its `AmountColumn`, `SecondaryText`, `TickRing`, `ItemThumbnail`, `AmountField`, `PriceField`, `ChoiceGroup`, `TextField`, `NoteField`, `SearchField`, `VerdictSwitch`, `PhotoInputs`, `ReceiptStrip`, `PhotoViewer`, `SheetHeader` (sheets use it with `.sheet-body`), icons, and the hooks `useAction` (run an action, toast on failure), `useNamePrompt`, `usePhotoPick`, `usePourSet`, toast and delete-confirm.
- `src/navigation/paths.ts`: every route. An item page exists in three stacks (רשימה, קניות, מצרכים); `itemStackOf(pathname)` tells which one.
- `src/pages/<feature>/`: one folder per screen with its own `copy.ts` (`<FEATURE>_COPY`) and CSS. Features don't import from each other.
- Swipe actions use `IonItemOptions side="end"` and are never opened from code (`IonItemSliding.open()` was a silent no-op in RTL in אימונים). Every swipe has a tap path.

## Tests

- `test/unit` covers logic and data; `test/ui` renders screens with `renderAt(path)`. The test page is RTL, as the phone is.
- Storage isn't mocked: `fake-indexeddb` backs the real Dexie database. Call `resetDb` in `beforeEach`.
- `test/helpers/records.ts` builds items, entries, trips and sets; `seed.ts` writes them through the repos; `freezeDate` pins "today"; `overlays.ts` drives alerts, action sheets, modals and toasts; `ionic.ts` finds swipe options.
- jsdom has no canvas, so photo shrinking is stubbed in UI tests with `vi.mock('../../src/photo/shrink', ...)` returning `fakeShrunkPhoto()` from `test/helpers/photo.ts`. Check photo and CSS changes in a browser.
