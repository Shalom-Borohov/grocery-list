import { IonContent, IonPage } from '@ionic/react'
import { useState } from 'react'
import { useRecords } from '../../data/hooks'
import { filesATrip } from '../../domain/finishTrip'
import { entryCounts } from '../../domain/listOrder'
import type { Records } from '../../domain/types'
import { LIST_COPY } from './copy'
import { EntryRow } from './EntryRow'
import { FinishSheet } from './FinishSheet'
import { holdKeyboard } from './keyboardHold'
import { HomeHeader, ShopHeader } from './ListHeaders'
import './list.css'
import { listRows } from './listRows'
import { AddPicker } from './picker/AddPicker'
import { RowSheet } from './RowSheet'

function ListBody({ records }: { records: Records }) {
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [sheetEntryId, setSheetEntryId] = useState<string>()
  const [isFinishOpen, setFinishOpen] = useState(false)
  const rows = listRows(records.items, records.entries)
  const counts = entryCounts(records.entries)
  const hasSomethingToFile = filesATrip(records.entries)
  const isEmpty = rows.length === 0

  const openPicker = () => {
    holdKeyboard()
    setPickerOpen(true)
  }

  return (
    <>
      <div className="page-body list-body">
        {hasSomethingToFile ? (
          <ShopHeader counts={counts} onFinish={() => setFinishOpen(true)} onAdd={openPicker} />
        ) : (
          <HomeHeader count={rows.length} onAdd={openPicker} />
        )}
        {isEmpty ? (
          <p className="empty-note">{LIST_COPY.empty}</p>
        ) : (
          <ul className="label-list">
            {rows.map((row) => (
              <li key={row.entry.id}>
                <EntryRow row={row} onOpenSheet={() => setSheetEntryId(row.entry.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <RowSheet
        row={rows.find(({ entry }) => entry.id === sheetEntryId)}
        trips={records.trips}
        onClose={() => setSheetEntryId(undefined)}
      />
      <FinishSheet isOpen={isFinishOpen} counts={counts} onClose={() => setFinishOpen(false)} />
      <AddPicker isOpen={isPickerOpen} onDismiss={() => setPickerOpen(false)} />
    </>
  )
}

export function ListPage() {
  const records = useRecords()

  return (
    <IonPage>
      <IonContent fullscreen>{records && <ListBody records={records} />}</IonContent>
    </IonPage>
  )
}
