import { IonContent, IonPage } from '@ionic/react'
import { useState } from 'react'
import { PlusIcon } from '../../components/icons'
import { SearchField } from '../../components/SearchField'
import { COMMON_COPY } from '../../copy/common'
import { useRecords } from '../../data/hooks'
import { matchesSearch } from '../../domain/itemNames'
import type { Records } from '../../domain/types'
import { AllItemsList } from './AllItemsList'
import { ITEMS_COPY } from './copy'
import './items.css'
import { SetsRail } from './SetsRail'
import { useAddMenu } from './useAddMenu'

const EMPTY_QUERY = ''

function ItemsBody({ records }: { records: Records }) {
  const [query, setQuery] = useState(EMPTY_QUERY)

  return (
    <>
      {records.sets.length > 0 && <SetsRail sets={records.sets} />}
      {records.items.length === 0 ? (
        <p className="empty-note">{ITEMS_COPY.noItems}</p>
      ) : (
        <>
          <SearchField query={query} placeholder={COMMON_COPY.search} onQueryChange={setQuery} />
          <AllItemsList items={records.items.filter((item) => matchesSearch(item.name, query))} />
        </>
      )}
    </>
  )
}

export function ItemsPage() {
  const records = useRecords()
  const showAddMenu = useAddMenu()
  const openAddMenu = records && (() => showAddMenu(records.entries))

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="page-body">
          <div className="items-title-row">
            <h1 className="page-title">{COMMON_COPY.items}</h1>
            <button
              type="button"
              className="round-button"
              aria-label={COMMON_COPY.add}
              disabled={!openAddMenu}
              onClick={openAddMenu}
            >
              <PlusIcon />
            </button>
          </div>
          {records && <ItemsBody records={records} />}
        </div>
      </IonContent>
    </IonPage>
  )
}
