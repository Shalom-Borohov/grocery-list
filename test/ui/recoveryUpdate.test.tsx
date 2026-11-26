import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LIST_HASH,
  listItemWithUnreadableName,
  openAppAt,
  prepareRecoveryScreen,
  RELOAD_BUTTON,
} from '../helpers/recovery'
import { UPDATE_TAKEOVER_WAIT_MS } from '../../src/recovery/startAgain'
import { spyOnReload } from '../helpers/reload'

const pwa = vi.hoisted(() => ({ needRefresh: true, updateServiceWorker: vi.fn(async () => {}) }))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwa.needRefresh, vi.fn()],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}))

async function openOnBadItem() {
  await listItemWithUnreadableName()
  await openAppAt(LIST_HASH)
}

describe('reloading from the recovery screen', () => {
  prepareRecoveryScreen()

  beforeEach(() => {
    pwa.needRefresh = true
    pwa.updateServiceWorker.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies a waiting version at the start, under the same reload button', async () => {
    const reload = spyOnReload()

    await openOnBadItem()
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    fireEvent.click(screen.getByRole('button', { name: RELOAD_BUTTON }))

    expect(pwa.updateServiceWorker).toHaveBeenCalledOnce()
    expect(window.location.hash).toBe('')
    expect(reload).not.toHaveBeenCalled()
  })

  it('reloads at the start anyway when the waiting version never takes over', async () => {
    const reload = spyOnReload()

    await openOnBadItem()
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    fireEvent.click(screen.getByRole('button', { name: RELOAD_BUTTON }))

    vi.advanceTimersByTime(UPDATE_TAKEOVER_WAIT_MS - 1)
    expect(reload).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(reload).toHaveBeenCalledOnce()
    expect(window.location.hash).toBe('')
  })

  it('says nothing about versions', async () => {
    await openOnBadItem()

    expect(screen.queryByText(/גרסה/)).not.toBeInTheDocument()
  })

  it('reloads at the start while nothing is waiting', async () => {
    pwa.needRefresh = false

    const reload = spyOnReload()

    await openOnBadItem()
    fireEvent.click(screen.getByRole('button', { name: RELOAD_BUTTON }))

    expect(window.location.hash).toBe('')
    expect(reload).toHaveBeenCalledOnce()
    expect(pwa.updateServiceWorker).not.toHaveBeenCalled()
  })
})
