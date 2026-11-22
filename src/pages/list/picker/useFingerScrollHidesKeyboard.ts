import { type RefObject, type TouchEvent, useCallback, useRef } from 'react'

export function useFingerScrollHidesKeyboard(searchInput: RefObject<HTMLInputElement | null>) {
  const isFingerDown = useRef(false)

  const liftFinger = useCallback(() => {
    isFingerDown.current = false
  }, [])

  return {
    scrollEvents: true,
    onTouchStart: ({ target }: TouchEvent) => {
      isFingerDown.current = true
      target.addEventListener('touchend', liftFinger, { once: true })
      target.addEventListener('touchcancel', liftFinger, { once: true })
    },
    onIonScrollStart: () => {
      if (isFingerDown.current) {
        searchInput.current?.blur()
      }
    },
  }
}
