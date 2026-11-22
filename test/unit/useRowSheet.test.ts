import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useRowSheet } from '../../src/pages/list/useRowSheet'

describe('the row sheet state', () => {
  it('still opens a row when a close lands after the sheet has already gone', () => {
    const { result } = renderHook(() => useRowSheet())

    act(() => result.current.open('milk'))
    act(() => result.current.modalProps.onDidDismiss())
    act(() => result.current.close())
    act(() => result.current.open('eggs'))

    expect(result.current.entryId).toBe('eggs')
    expect(result.current.modalProps.isOpen).toBe(true)
  })
})
