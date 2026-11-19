import { IonContent, IonHeader, IonModal } from '@ionic/react'
import { useMemo, useState } from 'react'
import { SearchField } from '../../../components/SearchField'
import { useRecords } from '../../../data/hooks'
import type { Item, ListEntry, Records } from '../../../domain/types'
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
  const { addedCount, toggleItem, createAndAdd, addTyped, pour } = usePickerActions(records.entries)
  const rowsProps = { entryByItem, onToggle: toggleItem }

  const [isResultTapped, setResultTapped] = useState(false)
  const unusedQuery = isResultTapped ? EMPTY_QUERY : query

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery)
    setResultTapped(false)
  }

  const clearSubmitted = (submitted: string) => () => {
    setQuery((current) => (current === submitted ? EMPTY_QUERY : current))
    setResultTapped(false)
  }

  const create = (name: string) => createAndAdd(name, clearSubmitted(query))

  const toggleResult = (item: Item, onList: ListEntry | undefined) => {
    setResultTapped(true)
    toggleItem(item, onList)
  }

  return (
    <>
      <IonHeader className="ion-no-border">
        <PickerHeader addedCount={addedCount} onDone={() => addTyped(unusedQuery, onDismiss)} />
        <SearchField
          query={query}
          placeholder={PICKER_COPY.searchPlaceholder}
          onQueryChange={changeQuery}
          onSubmit={() => addTyped(unusedQuery, clearSubmitted(query))}
        />
      </IonHeader>
      <IonContent>
        <div className="picker-body">
          {query.trim() ? (
            <PickerSearchResults
              records={records}
              timesTaken={timesTaken}
              query={query}
              onCreate={create}
              entryByItem={entryByItem}
              onToggle={toggleResult}
            />
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
