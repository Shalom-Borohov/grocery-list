import { IonContent, IonPage } from '@ionic/react'
import { useState } from 'react'
import { useAction } from '../../components/useAction'
import { useRecords } from '../../data/hooks'
import { startTrip } from '../../data/tripsRepo'
import { entryCounts } from '../../domain/listOrder'
import type { Records } from '../../domain/types'
import { LIST_COPY } from './copy'
import { EntryRow } from './EntryRow'
import { FinishSheet } from './FinishSheet'
import { HomeHeader, ShopHeader } from './ListHeaders'
import './list.css'
import { listRows } from './listRows'
import { AddPicker } from './picker/AddPicker'
import { RowSheet } from './RowSheet'

function ListBody({ records }: { records: Records }) {
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [sheetEntryId, setSheetEntryId] = useState<string>()
  const [isFinishOpen, setFinishOpen] = useState(false)
  const run = useAction()
  const rows = listRows(records.items, records.entries)
  const counts = entryCounts(records.entries)
  const isShopping = records.activeTrip !== undefined
  const isEmpty = rows.length === 0
  const showsStartButton = !isShopping && !isEmpty
  const openPicker = () => setPickerOpen(true)

  return (
    <>
      <div className={showsStartButton ? 'page-body list-body has-start-button' : 'page-body list-body'}>
        {isShopping ? (
          <ShopHeader counts={counts} onFinish={() => setFinishOpen(true)} onAdd={openPicker} />
        ) : (
          <HomeHeader count={rows.length} onAdd={openPicker} />
        )}
        {isEmpty ? (
          <p className="empty-note">{isShopping ? LIST_COPY.emptyShop : LIST_COPY.emptyHome}</p>
        ) : (
          <ul className="label-list">
            {rows.map((row) => (
              <li key={row.entry.id}>
                <EntryRow row={row} isShopping={isShopping} onOpenSheet={() => setSheetEntryId(row.entry.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {showsStartButton && (
        <div slot="fixed" className="start-shopping">
          <button type="button" className="primary-button" onClick={() => run(() => startTrip(Date.now()))}>
            {LIST_COPY.startShopping}
          </button>
        </div>
      )}
      <RowSheet
        row={rows.find(({ entry }) => entry.id === sheetEntryId)}
        trips={records.trips}
        isShopping={isShopping}
        onClose={() => setSheetEntryId(undefined)}
      />
      <FinishSheet
        isOpen={isFinishOpen}
        entries={records.entries}
        counts={counts}
        onClose={() => setFinishOpen(false)}
      />
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
