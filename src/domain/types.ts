import {
  array,
  boolean,
  check,
  type InferOutput,
  is,
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
} from 'valibot'
import { isPriceAmount } from './price'

const MINIMUM_NAME_LENGTH = 1

const SMALLEST_QUANTITY = 0.001

export const LARGEST_QUANTITY = 10_000

export const UNITS = ['unit', 'kilogram', 'gram', 'liter'] as const

export type Unit = (typeof UNITS)[number]

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

export const amountSchema = object({
  quantity: pipe(number(), minValue(SMALLEST_QUANTITY), maxValue(LARGEST_QUANTITY)),
  unit: picklist(UNITS),
})

export type Amount = InferOutput<typeof amountSchema>

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

export type StoredPhoto = {
  id: string
  bytes: ArrayBuffer
}

export type ShrunkPhoto = {
  photo: ArrayBuffer
  thumbnail: ArrayBuffer
}
