import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { startTrip } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { modalDismissed, toastMessages } from '../helpers/overlays'
import { cameraPhoto, PHOTO_URL, stubObjectUrls } from '../helpers/photo'
import { renderAt } from '../helpers/renderAt'

vi.mock('../../src/photo/shrink', async () => {
  const { fakeShrunkPhoto } = await import('../helpers/photo')

  return { shrinkPhoto: async () => fakeShrunkPhoto() }
})

const NOW = 1_700_000_000_000

async function shopTakingMilkWithoutCoffee() {
  const milk = await createItem('חלב', NOW)
  const coffee = await createItem('קפה', NOW)

  await addToList(await createItem('ביצים', NOW), NOW)
  await toggleTaken(await addToList(milk, NOW + 1), NOW)
  await toggleMissing(await addToList(coffee, NOW + 2))
  await startTrip(NOW)
}

async function openFinishSheet() {
  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: 'סיום' }))
  await screen.findByText('סיום הקנייה')
}

function pickReceipt() {
  fireEvent.change(screen.getByLabelText('צילום קבלה'), { target: { files: [cameraPhoto()] } })
}

describe('finishing a trip', () => {
  stubObjectUrls()

  beforeEach(resetDb)

  it('cannot save while the total is not a valid price, so a number nobody sees is never filed', async () => {
    await shopTakingMilkWithoutCoffee()
    await openFinishSheet()

    const total = screen.getByRole('textbox', { name: 'סכום' })

    fireEvent.change(total, { target: { value: '12.34' } })
    fireEvent.change(total, { target: { value: '12.345' } })
    expect(screen.getByRole('button', { name: 'שמירה' })).toBeDisabled()

    fireEvent.change(total, { target: { value: '12.35' } })
    expect(screen.getByRole('button', { name: 'שמירה' })).toBeEnabled()
  })

  it('files the trip with its total, receipt and note, and leaves shopping mode', async () => {
    await shopTakingMilkWithoutCoffee()
    await openFinishSheet()

    expect(screen.getByText('נלקחו 1 · לא היה 1')).toBeVisible()

    fireEvent.change(screen.getByRole('textbox', { name: 'סכום' }), { target: { value: '84.5' } })
    pickReceipt()
    expect(await screen.findByRole('img', { name: 'קבלה 1' })).toHaveAttribute('src', PHOTO_URL)
    fireEvent.change(screen.getByRole('textbox', { name: 'הערה' }), { target: { value: 'תור ארוך בקופה' } })

    const dismissed = modalDismissed()

    fireEvent.click(screen.getByRole('button', { name: 'שמירה' }))
    await dismissed

    const { trips, activeTrip } = await allRecords()

    expect(activeTrip).toBeUndefined()
    expect(trips).toHaveLength(1)
    expect(trips[0]).toMatchObject({ total: 84.5, note: 'תור ארוך בקופה' })
    expect(trips[0].receiptPhotoIds).toHaveLength(1)
    expect(trips[0].lines.map((tripLine) => [tripLine.name, tripLine.state])).toEqual([
      ['חלב', 'taken'],
      ['קפה', 'missing'],
    ])
    await waitFor(() => expect(toastMessages()).toContain('הקנייה נשמרה'))
    expect(await screen.findByRole('button', { name: 'התחלת קנייה' })).toBeInTheDocument()
  })

  it('saves with one tap and nothing filled in', async () => {
    await shopTakingMilkWithoutCoffee()
    await openFinishSheet()

    fireEvent.click(screen.getByRole('button', { name: 'שמירה' }))

    await waitFor(async () => expect((await allRecords()).trips).toHaveLength(1))
    expect((await allRecords()).trips[0]).toMatchObject({ total: undefined, note: undefined, receiptPhotoIds: [] })
  })

  it('removes a receipt photo before saving', async () => {
    await shopTakingMilkWithoutCoffee()
    await openFinishSheet()

    pickReceipt()
    fireEvent.click(await screen.findByRole('button', { name: 'הסרת קבלה 1' }))

    await waitFor(() => expect(screen.queryByRole('img', { name: 'קבלה 1' })).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'שמירה' }))

    await waitFor(async () => expect((await allRecords()).trips).toHaveLength(1))
    expect((await allRecords()).trips[0].receiptPhotoIds).toEqual([])
  })

  it('with nothing taken and nothing missing, only leaves shopping mode', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await startTrip(NOW)
    await openFinishSheet()

    expect(screen.getByText(/לא תישמר קנייה/)).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'סכום' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('צילום קבלה')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'שמירה' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'יציאה ממצב קנייה' }))

    await waitFor(async () => expect((await allRecords()).activeTrip).toBeUndefined())
    expect((await allRecords()).trips).toEqual([])
    expect((await allRecords()).entries).toHaveLength(1)
  })
})
