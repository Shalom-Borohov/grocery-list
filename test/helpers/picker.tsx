import { IonApp } from '@ionic/react'
import { fireEvent, render } from '@testing-library/react'
import { RecordsProvider } from '../../src/data/RecordsProvider'
import { allRecords } from '../../src/data/recordsContext'
import { AddPicker } from '../../src/pages/list/picker/AddPicker'

export const pickerTree = (isOpen: boolean, onDismiss: () => void) => (
  <IonApp>
    <RecordsProvider>
      <AddPicker isOpen={isOpen} onDismiss={onDismiss} />
    </RecordsProvider>
  </IonApp>
)

export const renderPicker = (onDismiss = () => {}) => render(pickerTree(true, onDismiss))

export async function listedItemNames() {
  const { items, entries } = await allRecords()

  return entries.map((listEntry) => items.find((candidate) => candidate.id === listEntry.itemId)?.name)
}

export const search = (searchbox: HTMLElement, text: string) => fireEvent.change(searchbox, { target: { value: text } })
