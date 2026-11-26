import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FILE_KEPT_FOR_SECOND_TAP_MS, useFileDelivery } from '../../src/components/useFileDelivery'
import { expiredTap, removeShare, stubShare } from '../helpers/share'

const backup = new File(['zip'], 'groceries-backup-2026-11-26.zip', { type: 'application/zip' })

const prepareBackup = () => Promise.resolve(backup)

describe('delivering a file', () => {
  afterEach(() => {
    vi.useRealTimers()
    removeShare()
  })

  it('keeps a file whose share tap expired for a minute, then forgets it', async () => {
    vi.useFakeTimers()
    stubShare(expiredTap)

    const { result } = renderHook(() => useFileDelivery(prepareBackup, vi.fn()))

    await act(() => result.current.exportData())
    expect(result.current.fileAwaitingTap).toBe(backup)

    act(() => vi.advanceTimersByTime(FILE_KEPT_FOR_SECOND_TAP_MS - 1))
    expect(result.current.fileAwaitingTap).toBe(backup)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.fileAwaitingTap).toBeUndefined()
  })

  it('shares the kept file again and forgets it once shared', async () => {
    const share = stubShare(expiredTap)
    const { result } = renderHook(() => useFileDelivery(prepareBackup, vi.fn()))

    await act(() => result.current.exportData())
    share.mockResolvedValue(undefined)
    await act(() => result.current.shareAgain(backup))

    expect(share).toHaveBeenLastCalledWith({ files: [backup] })
    expect(result.current.fileAwaitingTap).toBeUndefined()
  })

  it('reports a failure and forgets the kept file', async () => {
    const share = stubShare(expiredTap)
    const onFailure = vi.fn()
    const { result } = renderHook(() => useFileDelivery(prepareBackup, onFailure))

    await act(() => result.current.exportData())
    share.mockRejectedValue(new Error('share failed'))
    await act(() => result.current.shareAgain(backup))

    expect(onFailure).toHaveBeenCalledOnce()
    expect(result.current.fileAwaitingTap).toBeUndefined()
  })
})
