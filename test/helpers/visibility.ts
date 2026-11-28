import { act } from '@testing-library/react'
import { vi } from 'vitest'

export function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  document.dispatchEvent(new Event('visibilitychange'))
}

export async function leaveAndComeBack() {
  await act(async () => {
    setVisibility('hidden')
    setVisibility('visible')
  })
}
