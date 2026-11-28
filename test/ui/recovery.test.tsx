import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { shrunkPhoto } from '../helpers/photo'
import {
  EXPORT_BUTTON,
  itemWithUnreadableName,
  LIST_HASH,
  listItemWithUnreadableName,
  openAppAt,
  prepareRecoveryScreen,
  RECOVERY_HEADING,
  RELOAD_BUTTON,
  sharedArchive,
} from '../helpers/recovery'
import { spyOnReload } from '../helpers/reload'
import { expiredTap, stubShare } from '../helpers/share'

const NOW = new Date(2026, 10, 26, 9, 0).getTime()

const PHOTO = shrunkPhoto(new Uint8Array([255, 216, 7]).buffer, new Uint8Array([255, 216, 8]).buffer)

async function seedWithBadItem() {
  const milk = await createItem('חלב', NOW)

  await setItemPhoto(milk, PHOTO)
  await addToList(milk, NOW)
  await listItemWithUnreadableName()

  return milk
}

async function openOnBadItem() {
  const milk = await seedWithBadItem()

  await openAppAt(LIST_HASH)

  return milk
}

const tapExport = () => fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

describe('a page that cannot draw', () => {
  prepareRecoveryScreen()
  freezeDate(NOW)

  it('shows the recovery screen instead of a blank page', async () => {
    await seedWithBadItem()

    expect(await openAppAt(LIST_HASH)).toBeVisible()
    expect(screen.getByText('אי אפשר להציג את המסך. אפשר לייצא גיבוי של מה ששמור במכשיר.')).toBeVisible()
    expect(screen.getByRole('button', { name: EXPORT_BUTTON })).toBeVisible()
    expect(screen.getByRole('button', { name: RELOAD_BUTTON })).toBeVisible()
  })

  it('exports the same zip as settings, every record included, the bad one as it is', async () => {
    const share = stubShare()
    const milk = await openOnBadItem()
    const stored = await db.items.get(milk)

    tapExport()

    const { fileName, data, files } = await sharedArchive(share)

    expect(fileName).toBe('groceries-backup-2026-11-26.zip')
    expect(data.items).toHaveLength(2)
    expect(data.items).toContainEqual(stored)
    expect(data.items).toContainEqual(itemWithUnreadableName)
    expect(data.listEntries).toHaveLength(2)
    expect([...files[`photos/${stored?.photoId}.jpg`]]).toEqual([255, 216, 7])
    expect([...files[`thumbnails/${stored?.photoId}.jpg`]]).toEqual([255, 216, 8])
  })

  it('keeps the file for another tap when the share tap expired, and shares it again', async () => {
    const share = stubShare(expiredTap)

    await openOnBadItem()
    tapExport()

    expect(await screen.findByText('הגיבוי מוכן לשיתוף.')).toBeVisible()

    share.mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: 'שיתוף' }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(2))
    expect(share.mock.calls[1][0].files).toEqual(share.mock.calls[0][0].files)
    expect(await screen.findByRole('button', { name: EXPORT_BUTTON })).toBeVisible()
  })

  it('says so in a status line when the export fails', async () => {
    stubShare(() => Promise.reject(new Error('share failed')))

    await openOnBadItem()
    tapExport()

    expect(await screen.findByText('הפעולה לא הצליחה')).toBeVisible()
    expect(screen.getByText('הפעולה לא הצליחה').closest('[role="status"]')).not.toBeNull()
  })

  it('never changes what is stored', async () => {
    const share = stubShare()
    await seedWithBadItem()

    const before = { items: await db.items.toArray(), entries: await db.listEntries.toArray() }

    await openAppAt(LIST_HASH)
    tapExport()
    await sharedArchive(share)

    expect({ items: await db.items.toArray(), entries: await db.listEntries.toArray() }).toEqual(before)
    expect(await db.table(db.items.name).get(itemWithUnreadableName.id)).toEqual(itemWithUnreadableName)
  })

  it('reloads at the start, so the page that could not draw does not open again', async () => {
    const reload = spyOnReload()

    await openOnBadItem()
    fireEvent.click(screen.getByRole('button', { name: RELOAD_BUTTON }))

    expect(window.location.hash).toBe('')
    expect(reload).toHaveBeenCalledOnce()
  })
})

describe('the app with sound records', () => {
  beforeEach(resetDb)

  it('does not show the recovery screen', async () => {
    await createItem('חלב', NOW).then((milk) => addToList(milk, NOW))
    window.location.hash = LIST_HASH
    render(<App />)

    expect(await screen.findByText('חלב')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: RECOVERY_HEADING })).not.toBeInTheDocument()
    window.location.hash = ''
  })
})
