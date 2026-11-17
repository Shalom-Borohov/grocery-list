import { describe, expect, it } from 'vitest'
import { secondaryLine } from '../../src/domain/secondaryLine'
import { entry, item } from '../helpers/records'

const tomatoes = item({ id: 'tomatoes', name: 'עגבניות שרי', note: 'רק מהאריזה הסגורה' })

describe('the line under an item name', () => {
  it('shows the note, or the verdict when there is no note', () => {
    expect(secondaryLine(tomatoes)).toEqual({ kind: 'note', note: 'רק מהאריזה הסגורה' })
    expect(secondaryLine(item({ id: 'cottage', name: 'קוטג׳', verdict: 'again' }))).toEqual({ kind: 'again' })
    expect(secondaryLine(item({ id: 'eggs', name: 'ביצים' }))).toBeUndefined()
  })

  it('puts "do not buy again" before the note, so the warning is never hidden', () => {
    expect(secondaryLine({ ...tomatoes, verdict: 'never' })).toEqual({ kind: 'never' })
  })

  it('on the list, says the shop did not have it, now or last time, before anything else', () => {
    const onList = entry({ id: 'one', itemId: 'tomatoes', missedLastTrip: true })

    expect(secondaryLine({ ...tomatoes, verdict: 'never' }, onList)).toEqual({ kind: 'missedLastTrip' })
    expect(secondaryLine(tomatoes, { ...onList, state: 'missing' })).toEqual({ kind: 'missing' })
  })
})
