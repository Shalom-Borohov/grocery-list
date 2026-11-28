const START_HASH = ''

export const UPDATE_TAKEOVER_WAIT_MS = 5000

export function startAgain(updateWaiting: boolean, applyUpdate: () => void) {
  window.location.hash = START_HASH

  if (updateWaiting) {
    applyUpdate()
    setTimeout(() => window.location.reload(), UPDATE_TAKEOVER_WAIT_MS)

    return
  }

  window.location.reload()
}
