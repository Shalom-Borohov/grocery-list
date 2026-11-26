import { vi } from 'vitest'

export const expiredTap = () => Promise.reject(new DOMException('tap expired', 'NotAllowedError'))

export function stubShare(share: (data: ShareData) => Promise<void> = () => Promise.resolve()) {
  const stub = vi.fn(share)

  Object.assign(navigator, { share: stub, canShare: () => true })

  return stub
}

export function removeShare() {
  Object.assign(navigator, { share: undefined, canShare: undefined })
}
