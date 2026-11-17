import { IonContent, IonHeader, IonModal } from '@ionic/react'
import { useMemo, useState } from 'react'
import { SearchField } from '../../../components/SearchField'
import { useRecords } from '../../../data/hooks'
import type { Records } from '../../../domain/types'
import { timesTakenByItem, usualItemIds } from '../../../domain/usualHints'
import { PICKER_COPY } from './copy'
import { PickerBrowse } from './PickerBrowse'
import { PickerHeader } from './PickerHeader'
import { PickerSearchResults } from './PickerSearchResults'
import { usePickerActions } from './usePickerActions'
import './picker.css'

type AddPickerProps = {
  isOpen: boolean
  onDismiss: () => void
}

const EMPTY_QUERY = ''

const CLOSED_BREAKPOINT = 0

const FULL_BREAKPOINT = 1

const SHEET_BREAKPOINTS = [CLOSED_BREAKPOINT, FULL_BREAKPOINT]

function PickerBody({ records, onDismiss }: { records: Records; onDismiss: () => void }) {
  const [query, setQuery] = useState(EMPTY_QUERY)
  const [listedAtOpening] = useState<ReadonlySet<string>>(() => new Set(records.entries.map(({ itemId }) => itemId)))
  const timesTaken = useMemo(() => timesTakenByItem(records.trips), [records.trips])
  const usualIds = useMemo(() => usualItemIds(records.trips), [records.trips])
  const entryByItem = new Map(records.entries.map((listEntry) => [listEntry.itemId, listEntry]))
  const { addedCount, toggleItem, createAndAdd, pour } = usePickerActions(records.entries)
  const rowsProps = { entryByItem, onToggle: toggleItem }

  const create = (name: string) => createAndAdd(name, () => setQuery(EMPTY_QUERY))

  return (
    <>
      <IonHeader className="ion-no-border">
        <PickerHeader addedCount={addedCount} onDone={onDismiss} />
        <SearchField query={query} placeholder={PICKER_COPY.searchPlaceholder} onQueryChange={setQuery} />
      </IonHeader>
      <IonContent>
        <div className="picker-body">
          {query.trim() ? (
            <PickerSearchResults records={records} timesTaken={timesTaken} query={query} onCreate={create} {...rowsProps} />
          ) : (
            <PickerBrowse
              records={records}
              timesTaken={timesTaken}
              usualIds={usualIds}
              listedAtOpening={listedAtOpening}
              onPour={pour}
              {...rowsProps}
            />
          )}
        </div>
      </IonContent>
    </>
  )
}

export function AddPicker({ isOpen, onDismiss }: AddPickerProps) {
  const records = useRecords()

  return (
    <IonModal
      className="add-picker"
      isOpen={isOpen}
      breakpoints={SHEET_BREAKPOINTS}
      initialBreakpoint={FULL_BREAKPOINT}
      onDidDismiss={onDismiss}
    >
      {records && <PickerBody records={records} onDismiss={onDismiss} />}
    </IonModal>
  )
}
