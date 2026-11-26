import { useEffect, useState } from 'react'
import { RemoveIcon } from '../components/icons'
import { APP_UPDATE_COPY } from './copy'
import { useAppUpdate } from './useAppUpdate'
import './appUpdate.css'

export function UpdateBar() {
  const [dismissed, setDismissed] = useState(false)
  const { updateWaiting, applyUpdate } = useAppUpdate()

  useEffect(() => {
    function offerAgain() {
      if (document.visibilityState === 'visible') {
        setDismissed(false)
      }
    }

    document.addEventListener('visibilitychange', offerAgain)

    return () => document.removeEventListener('visibilitychange', offerAgain)
  }, [])

  if (!updateWaiting || dismissed) {
    return null
  }

  return (
    <div slot="bottom" className="update-bar">
      <div className="update-bar-card">
        <button
          type="button"
          className="update-bar-dismiss"
          aria-label={APP_UPDATE_COPY.dismissUpdate}
          onClick={() => setDismissed(true)}
        >
          <RemoveIcon />
        </button>
        <span className="update-bar-text">{APP_UPDATE_COPY.newVersionReady}</span>
        <button type="button" className="update-bar-apply" onClick={applyUpdate}>
          {APP_UPDATE_COPY.update}
        </button>
      </div>
    </div>
  )
}
