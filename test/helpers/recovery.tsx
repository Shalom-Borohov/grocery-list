import { render, screen, waitFor } from '@testing-library/react'
import { strFromU8, unzipSync } from 'fflate'
import { afterEach, beforeEach, expect, vi } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { addToList } from '../../src/data/listRepo'
import { resetDb } from './db'
import { CREATED_AT } from './records'
import { removeShare, type stubShare } from './share'

export const RECOVERY_HEADING = 'משהו השתבש'

export const EXPORT_BUTTON = 'ייצוא גיבוי'

export const RELOAD_BUTTON = 'טעינה מחדש'

export const LIST_HASH = '#/tabs/list'

const FIRST_RENDER_TIMEOUT_MS = 5000

export const itemWithUnreadableName = { id: 'bad-item', name: { text: 'ביצים' }, createdAt: CREATED_AT }

export async function listItemWithUnreadableName() {
  await db.table(db.items.name).put(itemWithUnreadableName)
  await addToList(itemWithUnreadableName.id, CREATED_AT)
}

export function silenceRenderErrors() {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    removeShare()
    window.location.hash = ''
  })
}

export function prepareRecoveryScreen() {
  beforeEach(resetDb)
  silenceRenderErrors()
}

export function openAppAt(hash: string) {
  window.location.hash = hash
  render(<App />)

  return screen.findByRole('heading', { name: RECOVERY_HEADING }, { timeout: FIRST_RENDER_TIMEOUT_MS })
}

export async function sharedArchive(share: ReturnType<typeof stubShare>) {
  await waitFor(() => expect(share).toHaveBeenCalled())

  const [data] = share.mock.calls[0]
  const [file] = data.files ?? []
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()))

  return { fileName: file.name, data: JSON.parse(strFromU8(files['data.json'])), files }
}
