import { vi } from 'vitest'

export function spyOnReload() {
  const realLocation = window.location
  const reload = vi.fn()

  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...realLocation,
    reload,
    get hash() {
      return realLocation.hash
    },
    set hash(hash: string) {
      realLocation.hash = hash
    },
  })

  return reload
}
