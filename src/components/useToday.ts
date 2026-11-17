import { useEffect, useState } from 'react'
import { dayDateOf } from '../domain/dayDate'

const VISIBILITY_EVENT = 'visibilitychange'

const readToday = () => dayDateOf(Date.now())

export function useToday() {
  const [today, setToday] = useState(readToday)

  useEffect(() => {
    const refresh = () => setToday(readToday())

    document.addEventListener(VISIBILITY_EVENT, refresh)

    return () => document.removeEventListener(VISIBILITY_EVENT, refresh)
  }, [])

  return today
}
