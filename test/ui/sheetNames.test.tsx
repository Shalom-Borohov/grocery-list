import { IonApp } from '@ionic/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { SheetModal } from '../../src/components/SheetModal'
import { createItem } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { resetDb } from '../helpers/db'
import { alertDismissed, alertShown, answerAlert, modalDismissed, shownSheetName } from '../helpers/overlays'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

async function listMilkAndEggs() {
  await addToList(await createItem('חלב', NOW), NOW)
  await addToList(await createItem('ביצים', NOW), NOW + 1)
  renderAt('/tabs/list')
}

const openRowSheet = async (name: string) => fireEvent.click(await screen.findByRole('button', { name }))

async function closeSheet() {
  const dismissed = modalDismissed()

  fireEvent.click(screen.getByRole('button', { name: 'סגירה' }))
  await dismissed
}

async function renameFromTitle(name: string, typed: string) {
  const shown = alertShown()

  fireEvent.click(await screen.findByRole('button', { name: `עריכת שם: ${name}` }))
  await shown

  const dismissed = alertDismissed()

  answerAlert(typed, 'שינוי השם')
  await dismissed
}

describe('sheet names', () => {
  beforeEach(resetDb)

  it('names the open sheet for its title', async () => {
    render(
      <IonApp>
        <SheetModal isOpen name="חלב">
          <p>תוכן</p>
        </SheetModal>
      </IonApp>,
    )

    await waitFor(() => expect(shownSheetName()).toBe('חלב'))
  })

  it('names the row sheet for the row it opened on, each time it opens', async () => {
    await listMilkAndEggs()

    await openRowSheet('חלב')
    await waitFor(() => expect(shownSheetName()).toBe('חלב'))

    await closeSheet()
    await openRowSheet('ביצים')
    await waitFor(() => expect(shownSheetName()).toBe('ביצים'))
  })

  it('renames the open row sheet when its item is renamed from the title', async () => {
    await listMilkAndEggs()
    await openRowSheet('חלב')
    await waitFor(() => expect(shownSheetName()).toBe('חלב'))

    await renameFromTitle('חלב', 'חלב 3%')

    await waitFor(() => expect(shownSheetName()).toBe('חלב 3%'))
  })
})
