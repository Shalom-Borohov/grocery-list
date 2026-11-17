import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from '../helpers/db'
import { selectedTab } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'

describe('tabs', () => {
  beforeEach(resetDb)

  it('opens on רשימה and shows the four tabs in order', async () => {
    renderAt('/')

    await waitFor(() => expect(currentPath()).toBe('/tabs/list'))
    await waitFor(() => expect(selectedTab()).toBe('list'))

    const labels = Array.from(document.querySelectorAll('ion-tab-button')).map((tab) => tab.textContent?.trim())

    expect(labels).toEqual(['רשימה', 'קניות', 'מצרכים', 'הגדרות'])
  })
})
