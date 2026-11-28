const MINUTE_MS = 60_000

export const UPDATE_CHECK_MS = 60 * MINUTE_MS

interface UpdatableRegistration {
  readonly installing: object | null
  update(): Promise<object>
}

const FRESH_WORKER_REQUEST: RequestInit = { cache: 'no-store', headers: { 'cache-control': 'no-cache' } }

async function checkNow(swUrl: string, registration: UpdatableRegistration) {
  if (registration.installing || !navigator.onLine) {
    return
  }

  const response = await fetch(swUrl, FRESH_WORKER_REQUEST)

  if (response.ok) {
    await registration.update()
  }
}

export function checkForUpdates(swUrl: string, registration: UpdatableRegistration): () => void {
  const check = () => void checkNow(swUrl, registration).catch(() => {})

  function checkWhenVisible() {
    if (document.visibilityState === 'visible') {
      check()
    }
  }

  check()
  const timer = setInterval(check, UPDATE_CHECK_MS)
  document.addEventListener('visibilitychange', checkWhenVisible)

  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', checkWhenVisible)
  }
}
