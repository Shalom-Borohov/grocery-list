import { describe, expect, it } from 'vitest'
import { COMMON_COPY } from '../../src/copy/common'

describe('money', () => {
  it('shows whole shekels without agorot, and agorot always as two digits', () => {
    expect(COMMON_COPY.shekels(875)).toBe('₪875')
    expect(COMMON_COPY.shekels(412.3)).toBe('₪412.30')
    expect(COMMON_COPY.shekels(9.9)).toBe('₪9.90')
    expect(COMMON_COPY.shekels(1420)).toBe('₪1,420')
  })
})
