import { parse } from 'valibot'
import { finishTrip } from '../domain/finishTrip'
import { ACTIVE_TRIP_KEY, type ShrunkPhoto, type Trip, type TripLine, tripSchema } from '../domain/types'
import { db } from './db'
import { existing } from './errors'
import { deletePhotos, photoTables, storePhoto } from './photosRepo'

type FinishDetails = Pick<Trip, 'total' | 'note'> & { receipts: ShrunkPhoto[] }

export type TripChanges = Partial<Pick<Trip, 'total' | 'note'>>

type LineChanges = Partial<Pick<TripLine, 'price'>>

const tripTables = () => [db.items, db.listEntries, db.trips, db.settings, ...photoTables()]

const existingTrip = async (tripId: string) => existing(await db.trips.get(tripId), 'trip', tripId)

const putTrip = (trip: Trip) => db.trips.put(parse(tripSchema, trip))

export const startTrip = (now: number) =>
  db.transaction('rw', db.settings, async () => {
    if (!(await db.settings.get(ACTIVE_TRIP_KEY))) {
      await db.settings.put({ key: ACTIVE_TRIP_KEY, startedAt: now })
    }
  })

export const finishShopping = ({ total, note, receipts }: FinishDetails, now: number) =>
  db.transaction('rw', tripTables(), async () => {
    const [entries, items, activeTrip] = await Promise.all([
      db.listEntries.toArray(),
      db.items.toArray(),
      db.settings.get(ACTIVE_TRIP_KEY),
    ])

    const finished = finishTrip({
      entries,
      items,
      tripId: crypto.randomUUID(),
      startedAt: activeTrip?.startedAt ?? now,
      finishedAt: now,
      details: { total, note },
    })

    if (finished.trip) {
      const receiptPhotoIds = await Promise.all(receipts.map(storePhoto))

      await db.trips.add(parse(tripSchema, { ...finished.trip, receiptPhotoIds }))
      await db.listEntries.bulkDelete(finished.removedEntryIds)
      await db.listEntries.bulkPut(finished.keptEntries)
      await db.items.bulkUpdate(
        finished.usualAmounts.map(({ itemId, amount }) => ({ key: itemId, changes: { usualAmount: amount } })),
      )
    }

    await db.settings.delete(ACTIVE_TRIP_KEY)

    return finished.trip?.id
  })

export const updateTrip = (tripId: string, changes: TripChanges) =>
  db.transaction('rw', db.trips, async () => {
    await putTrip({ ...(await existingTrip(tripId)), ...changes })
  })

export const updateTripLine = (tripId: string, lineIndex: number, changes: LineChanges) =>
  db.transaction('rw', db.trips, async () => {
    const trip = await existingTrip(tripId)

    const lines = trip.lines.map((tripLine, index) =>
      index === lineIndex && tripLine.state === 'taken' ? { ...tripLine, ...changes } : tripLine,
    )

    await putTrip({ ...trip, lines })
  })

const receiptTables = () => [db.trips, ...photoTables()]

export const addTripReceipt = (tripId: string, receipt: ShrunkPhoto) =>
  db.transaction('rw', receiptTables(), async () => {
    const trip = await existingTrip(tripId)

    await putTrip({ ...trip, receiptPhotoIds: [...trip.receiptPhotoIds, await storePhoto(receipt)] })
  })

export const removeTripReceipt = (tripId: string, photoId: string) =>
  db.transaction('rw', receiptTables(), async () => {
    const trip = await existingTrip(tripId)

    await putTrip({ ...trip, receiptPhotoIds: trip.receiptPhotoIds.filter((id) => id !== photoId) })
    await deletePhotos([photoId])
  })

export const deleteTrip = (tripId: string) =>
  db.transaction('rw', receiptTables(), async () => {
    const trip = await existingTrip(tripId)

    await db.trips.delete(tripId)
    await deletePhotos(trip.receiptPhotoIds)
  })

export const cancelShopping = () => db.settings.delete(ACTIVE_TRIP_KEY)
