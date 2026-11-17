import { IonApp } from '@ionic/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMessageToast } from '../../src/components/useMessageToast'
import { toastMessages } from '../helpers/overlays'

function TwoMessages() {
  const toast = useMessageToast()

  return (
    <button type="button" onClick={() => void toast('ראשון').then(() => toast('שני'))}>
      שתי הודעות
    </button>
  )
}

describe('message toast', () => {
  it('shows a second message even while the first is still on screen', async () => {
    render(
      <IonApp>
        <TwoMessages />
      </IonApp>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'שתי הודעות' }))

    await waitFor(() => expect(toastMessages()).toContain('שני'))
  })
})
