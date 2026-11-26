import {
  array,
  boolean,
  check,
  custom,
  type InferOutput,
  integer,
  is,
  literal,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  transform,
  trim,
  variant,
} from 'valibot'
import { isPriceAmount } from './price'

const MINIMUM_NAME_LENGTH = 1

const SMALLEST_QUANTITY = 0.001

export const LARGEST_QUANTITY = 10_000

const MEASURED_UNITS = ['unit', 'kilogram', 'gram', 'liter'] as const

export type MeasuredUnit = (typeof MEASURED_UNITS)[number]

export const UNITS = ['unit', 'pack', 'kilogram', 'gram', 'liter'] as const

export type Unit = (typeof UNITS)[number]

export const SMALLEST_PACK_SIZE = 2

const LARGEST_PACK_SIZE = 99

export const VERDICTS = ['again', 'never'] as const

export type Verdict = (typeof VERDICTS)[number]

const ENTRY_STATES = ['waiting', 'taken', 'missing'] as const

export type EntryState = (typeof ENTRY_STATES)[number]

const TRIP_LINE_STATES = ['taken', 'missing'] as const

const nameSchema = pipe(string(), trim(), minLength(MINIMUM_NAME_LENGTH))

export const isName = (text: string) => is(nameSchema, text)

const optionalTextSchema = optional(
  pipe(
    string(),
    trim(),
    transform((text) => text || undefined),
  ),
)

const priceSchema = pipe(number(), check(isPriceAmount))

const quantitySchema = pipe(number(), minValue(SMALLEST_QUANTITY), maxValue(LARGEST_QUANTITY))

const packSizeSchema = pipe(number(), integer(), minValue(SMALLEST_PACK_SIZE), maxValue(LARGEST_PACK_SIZE))

export const isPackSize = (packSize: number) => is(packSizeSchema, packSize)

export const amountSchema = variant('unit', [
  object({ quantity: quantitySchema, unit: picklist(MEASURED_UNITS) }),
  object({ quantity: pipe(quantitySchema, integer()), unit: literal('pack'), packSize: packSizeSchema }),
])

export type Amount = InferOutput<typeof amountSchema>

export type PackAmount = Extract<Amount, { unit: 'pack' }>

export const itemSchema = object({
  id: string(),
  name: nameSchema,
  createdAt: number(),
  note: optionalTextSchema,
  verdict: optional(picklist(VERDICTS)),
  usualAmount: optional(amountSchema),
  photoId: optional(string()),
})

export type Item = InferOutput<typeof itemSchema>

export const listEntrySchema = object({
  id: string(),
  itemId: string(),
  amount: amountSchema,
  state: picklist(ENTRY_STATES),
  addedAt: number(),
  price: optional(priceSchema),
  missedLastTrip: optional(boolean()),
  takenAt: optional(number()),
  takenFromMissing: optional(boolean()),
})

export type ListEntry = InferOutput<typeof listEntrySchema>

export const tripLineSchema = object({
  itemId: string(),
  name: nameSchema,
  amount: amountSchema,
  state: picklist(TRIP_LINE_STATES),
  price: optional(priceSchema),
})

export type TripLine = InferOutput<typeof tripLineSchema>

export const tripSchema = object({
  id: string(),
  startedAt: number(),
  finishedAt: number(),
  receiptPhotoIds: array(string()),
  lines: array(tripLineSchema),
  total: optional(priceSchema),
  note: optionalTextSchema,
})

export type Trip = InferOutput<typeof tripSchema>

export const setEntrySchema = object({
  itemId: string(),
  amount: amountSchema,
})

export type SetEntry = InferOutput<typeof setEntrySchema>

export const savedSetSchema = object({
  id: string(),
  name: nameSchema,
  entries: array(setEntrySchema),
  createdAt: number(),
})

export type SavedSet = InferOutput<typeof savedSetSchema>

export type Records = {
  items: Item[]
  entries: ListEntry[]
  trips: Trip[]
  sets: SavedSet[]
}

const ARRAY_BUFFER_TAG = '[object ArrayBuffer]'

const isArrayBuffer = (bytes: unknown) => Object.prototype.toString.call(bytes) === ARRAY_BUFFER_TAG

const storedPhotoSchema = object({
  id: string(),
  bytes: custom<ArrayBuffer>(isArrayBuffer),
})

export type StoredPhoto = InferOutput<typeof storedPhotoSchema>

export const isStoredPhoto = (row: unknown): row is StoredPhoto => is(storedPhotoSchema, row)

export type ShrunkPhoto = {
  photo: ArrayBuffer
  thumbnail: ArrayBuffer
}
