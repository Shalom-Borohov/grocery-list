import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { handKeyboardTo } from '../../src/components/keyboardHold'
import { addToList } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { itemPath, setPath, tripPath } from '../../src/navigation/paths'
import { resetDb } from '../helpers/db'
import { focusedTextField } from '../helpers/keyboard'
import {
  actionSheetShown,
  alertDismissed,
  alertInput,
  alertShown,
  clickActionSheetButton,
  clickAlertButton,
  modalShown,
  typeInAlert,
} from '../helpers/overlays'
import { currentPath, renderAt } from '../helpers/renderAt'
import { finishTripTaking, seedItem, seedSet } from '../helpers/seed'

const NOW = 1_700_000_000_000

afterEach(() => handKeyboardTo(null))

const nextTask = () => new Promise((resolve) => setTimeout(resolve))

async function settled(promptShown: Promise<unknown>) {
  await promptShown
  await nextTask()
}

const typeWhileOpening = (typed: string) => {
  focusedTextField().value = typed
}

const pressReturn = (init: KeyboardEventInit = {}) => fireEvent.keyDown(alertInput(), { key: 'Enter', ...init })

const itemNames = async () => (await allRecords()).items.map(({ name }) => name)

async function chooseFromAddMenu(choice = 'מצרך חדש') {
  const sheetShown = actionSheetShown()

  renderAt('/tabs/items')
  fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))
  await sheetShown

  const promptShown = alertShown()

  clickActionSheetButton(choice)

  return { promptShown }
}

async function tapRowSheetTitle(name: string) {
  await addToList(await seedItem(name), NOW)
  renderAt('/tabs/list')

  const sheetShown = modalShown()

  fireEvent.click(await screen.findByRole('button', { name: `כמות ומחיר: ${name}` }))
  await sheetShown

  const promptShown = alertShown()

  fireEvent.click(screen.getByRole('button', { name: `עריכת שם: ${name}` }))

  return { promptShown }
}

describe('name prompts open ready to type', () => {
  beforeEach(resetDb)

  it('focuses a text field during the tap on "מצרך חדש" and then the prompt’s name field, leaving no hidden field', async () => {
    const { promptShown } = await chooseFromAddMenu()

    expect(document.activeElement).toBeInstanceOf(HTMLInputElement)

    await settled(promptShown)

    expect(alertInput()).toHaveFocus()
    expect(alertInput()).toHaveAttribute('enterkeyhint', 'go')
    expect(document.querySelector('.keyboard-holder')).not.toBeInTheDocument()
  })

  it('keeps letters typed while the prompt opens, and saves them', async () => {
    const { promptShown } = await chooseFromAddMenu()

    typeWhileOpening('חל')
    await settled(promptShown)

    expect(alertInput()).toHaveValue('חל')

    clickAlertButton('הוספה')

    await waitFor(async () => expect(await itemNames()).toEqual(['חל']))
  })

  it('puts the keyboard away as the prompt starts to close', async () => {
    const { promptShown } = await chooseFromAddMenu()

    await settled(promptShown)

    const field = alertInput()

    const fieldFocusedAsItCloses = new Promise<boolean>((resolve) => {
      document.addEventListener('ionAlertWillDismiss', () => resolve(document.activeElement === field), { once: true })
    })

    clickAlertButton('ביטול')

    expect(await fieldFocusedAsItCloses).toBe(false)
  })

  it.each(['ערכה ריקה', 'ערכה מהרשימה'])('does the same for "%s"', async (choice) => {
    await addToList(await seedItem('חלב'), NOW)

    const { promptShown } = await chooseFromAddMenu(choice)

    await settled(promptShown)

    expect(alertInput()).toHaveFocus()
  })

  it('does the same when renaming a set, with the cursor after its name', async () => {
    const setId = await seedSet('בסיס', [], NOW)

    renderAt(setPath(setId))

    const promptShown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'עריכת שם' }))
    await settled(promptShown)

    expect(alertInput()).toHaveFocus()
    expect([alertInput().selectionStart, alertInput().selectionEnd]).toEqual([4, 4])
  })

  it('leaves no hidden field when asked again while the prompt is still closing', async () => {
    const setId = await seedSet('בסיס', [], NOW)

    renderAt(setPath(setId))

    const promptShown = alertShown()
    const renameButton = await screen.findByRole('button', { name: 'עריכת שם' })

    fireEvent.click(renameButton)
    await settled(promptShown)

    const dismissed = alertDismissed()

    clickAlertButton('ביטול')
    fireEvent.click(renameButton)
    await dismissed
    await nextTask()

    expect(document.querySelector('.keyboard-holder')).not.toBeInTheDocument()
  })

  it('does the same when saving a trip as a set', async () => {
    await finishTripTaking([await seedItem('חלב')], NOW)

    const [trip] = (await allRecords()).trips

    renderAt(tripPath(trip.id))

    const promptShown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'שמירה כערכה' }))
    await settled(promptShown)

    expect(alertInput()).toHaveFocus()
  })

  it('does the same from the title of a row’s sheet, which stays open under the prompt', async () => {
    const { promptShown } = await tapRowSheetTitle('חלב')

    expect(document.activeElement).toBeInstanceOf(HTMLInputElement)

    await settled(promptShown)

    expect(alertInput()).toHaveFocus()
  })
})

describe('the return key in a name prompt', () => {
  beforeEach(resetDb)

  it('renames from a row’s sheet with what was typed after the name, not "מצרך חדש"', async () => {
    const { promptShown } = await tapRowSheetTitle('חלב')

    typeWhileOpening(' 3%')
    await settled(promptShown)

    const dismissed = alertDismissed()

    pressReturn()
    await dismissed

    const { items, entries } = await allRecords()

    expect(items.map(({ name }) => name)).toEqual(['חלב 3%'])
    expect(entries.map(({ itemId }) => itemId)).toEqual(items.map(({ id }) => id))
  })

  it('adds a new item from מצרכים and opens its page', async () => {
    const { promptShown } = await chooseFromAddMenu()

    await settled(promptShown)
    typeInAlert('ביצים')
    pressReturn()

    await waitFor(async () => expect(await itemNames()).toEqual(['ביצים']))

    const [eggs] = (await allRecords()).items

    await waitFor(() => expect(currentPath()).toBe(itemPath('items', eggs.id)))
  })

  it('closes a blank prompt and saves nothing', async () => {
    const { promptShown } = await chooseFromAddMenu()

    await settled(promptShown)

    const dismissed = alertDismissed()

    pressReturn()
    await dismissed

    expect(await itemNames()).toEqual([])
  })

  it('does nothing while a word is still being composed', async () => {
    const { promptShown } = await chooseFromAddMenu()

    await settled(promptShown)
    typeInAlert('ביצים')
    pressReturn({ isComposing: true })
    await nextTask()

    expect(alertInput()).toHaveFocus()
    expect(await itemNames()).toEqual([])
  })
})
