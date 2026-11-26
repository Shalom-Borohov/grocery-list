import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { seedItem } from '../helpers/seed'
import { leaveAndComeBack } from '../helpers/visibility'

const pwa = vi.hoisted(() => ({ needRefresh: true, updateServiceWorker: vi.fn(async () => {}) }))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwa.needRefresh, vi.fn()],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}))

const READY = 'גרסה חדשה זמינה'

const NOW = 1_700_000_000_000

beforeEach(async () => {
  await resetDb()
  pwa.needRefresh = true
  pwa.updateServiceWorker.mockClear()
})

describe('a new version of the app', () => {
  it.each(['/tabs/list', '/tabs/trips', '/tabs/items', '/tabs/settings'])('is offered on %s', async (path) => {
    renderAt(path)

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('is offered on an item page', async () => {
    const milk = await seedItem('חלב')

    renderAt(`/tabs/items/item/${milk}`)

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('is offered while a trip is open', async () => {
    const milk = await seedItem('חלב')

    await toggleTaken(await addToList(milk, NOW), NOW)

    renderAt('/tabs/list')

    expect(await screen.findByRole('button', { name: 'נלקח: חלב' })).toBeInTheDocument()
    expect(screen.getByText(READY)).toBeInTheDocument()
  })

  it('hides the dismiss icon from screen readers', async () => {
    renderAt('/tabs/list')

    const dismiss = await screen.findByRole('button', { name: 'לא עכשיו' })

    expect(dismiss.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('updates when עדכון is tapped', async () => {
    renderAt('/tabs/list')

    fireEvent.click(await screen.findByRole('button', { name: 'עדכון' }))

    expect(pwa.updateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('can be put off until the app comes back from the background', async () => {
    renderAt('/tabs/list')

    fireEvent.click(await screen.findByRole('button', { name: 'לא עכשיו' }))
    await waitFor(() => expect(screen.queryByText(READY)).not.toBeInTheDocument())

    await leaveAndComeBack()

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('shows nothing while there is no new version', async () => {
    pwa.needRefresh = false
    renderAt('/tabs/list')

    expect(await screen.findByRole('heading', { level: 1, name: 'רשימה' })).toBeInTheDocument()
    expect(screen.queryByText(READY)).not.toBeInTheDocument()
  })
})
