import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { line, trip } from '../helpers/records'

const NOVEMBER = 10

const OCTOBER = 9

const at = (month: number, day: number, year = 2026) => new Date(year, month, day, 18).getTime()

const TODAY = new Date(2026, NOVEMBER, 17, 9).getTime()

describe('קניות', () => {
  beforeEach(resetDb)
  freezeDate(TODAY)

  it('shows the month total, its trips and the average, and how many trips have no total', async () => {
    await db.trips.bulkAdd([
      trip({ id: 'nov-12', finishedAt: at(NOVEMBER, 12), total: 412.3 }),
      trip({ id: 'nov-8', finishedAt: at(NOVEMBER, 8), total: 74.9 }),
      trip({ id: 'nov-5', finishedAt: at(NOVEMBER, 5), total: 388 }),
      trip({ id: 'nov-2', finishedAt: at(NOVEMBER, 2) }),
      trip({ id: 'oct-29', finishedAt: at(OCTOBER, 29), total: 356.4 }),
    ])

    renderAt('/tabs/trips')

    expect(await screen.findByRole('heading', { level: 1, name: 'קניות' })).toBeInTheDocument()

    const block = await screen.findByRole('region', { name: 'נובמבר' })

    expect(within(block).getByText('₪875.20')).toBeVisible()
    expect(within(block).getByText('4 קניות · ממוצע ₪291.73')).toBeVisible()
    expect(screen.getByText('קנייה אחת בלי סכום')).toBeVisible()
  })

  it('switches to the year', async () => {
    await db.trips.bulkAdd([
      trip({ id: 'nov-12', finishedAt: at(NOVEMBER, 12), total: 400 }),
      trip({ id: 'oct-29', finishedAt: at(OCTOBER, 29), total: 300 }),
      trip({ id: 'last-year', finishedAt: at(NOVEMBER, 20, 2025), total: 99 }),
    ])

    renderAt('/tabs/trips')
    await screen.findByRole('region', { name: 'נובמבר' })
    fireEvent.click(screen.getByRole('button', { name: 'שנה' }))

    const block = await screen.findByRole('region', { name: '2026' })

    expect(within(block).getByText('₪700')).toBeVisible()
    expect(within(block).getByText('2 קניות · ממוצע ₪350')).toBeVisible()
    expect(screen.queryByText(/בלי סכום$/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'שנה' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('leaves out the average when no trip in the period has a total', async () => {
    await db.trips.bulkAdd([
      trip({ id: 'nov-12', finishedAt: at(NOVEMBER, 12) }),
      trip({ id: 'nov-8', finishedAt: at(NOVEMBER, 8) }),
    ])

    renderAt('/tabs/trips')

    const block = await screen.findByRole('region', { name: 'נובמבר' })

    expect(within(block).getByText('₪0')).toBeVisible()
    expect(within(block).getByText('2 קניות')).toBeVisible()
    expect(screen.getByText('2 קניות בלי סכום')).toBeVisible()
  })

  it('lists every trip newest first with its day, item count, receipt, missing items and total', async () => {
    await db.trips.bulkAdd([
      trip({ id: 'oct-29', finishedAt: at(OCTOBER, 29), total: 356.4 }),
      trip({
        id: 'nov-12',
        finishedAt: at(NOVEMBER, 12),
        total: 412.3,
        receiptPhotoIds: ['receipt'],
        lines: [line({ itemId: 'milk', name: 'חלב' }), line({ itemId: 'eggs', name: 'ביצים' })],
      }),
      trip({
        id: 'nov-5',
        finishedAt: at(NOVEMBER, 5),
        receiptPhotoIds: ['receipt-2'],
        lines: [line({ itemId: 'milk', name: 'חלב' }), line({ itemId: 'bread', name: 'לחם', state: 'missing' })],
      }),
    ])

    renderAt('/tabs/trips')

    const rows = await screen.findAllByRole('link')

    expect(rows.map((row) => row.textContent)).toEqual([
      '12ה׳2 מצרכיםקבלה₪412.30',
      '5ה׳מצרך אחדלא היה 1 · קבלהבלי סכום',
      '29ה׳0 מצרכים₪356.40',
    ])
    expect(within(rows[1]).getByText('לא היה 1')).toHaveClass('warning-word')
    await expectInOrder(['5', 'אוקטובר', '29'])
  })

  it('opens a trip when its row is tapped', async () => {
    await db.trips.add(trip({ id: 'nov-12', finishedAt: at(NOVEMBER, 12) }))

    renderAt('/tabs/trips')
    fireEvent.click(await screen.findByRole('link'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/trips/nov-12'))
  })

  it('says finished trips show here when there are none', async () => {
    renderAt('/tabs/trips')

    expect(await screen.findByText('קניות שהסתיימו יופיעו כאן.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'שנה' })).not.toBeInTheDocument()
  })
})
