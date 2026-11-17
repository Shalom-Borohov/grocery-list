import { useId } from 'react'
import { COMMON_COPY } from '../../copy/common'
import type { PeriodSpending } from '../../domain/spending'
import { TRIPS_COPY } from './copy'

type SpendingBlockProps = {
  periodName: string
  spending: PeriodSpending
}

export function SpendingBlock({ periodName, spending }: SpendingBlockProps) {
  const nameId = useId()

  return (
    <>
      <section className="spending-block" aria-labelledby={nameId}>
        <p id={nameId} className="spending-period">
          {periodName}
        </p>
        <p className="spending-total">
          <span className="num">{COMMON_COPY.shekels(spending.total)}</span>
        </p>
        <p className="spending-detail">{TRIPS_COPY.summary(spending.tripCount, spending.average)}</p>
      </section>
      {spending.withoutTotal > 0 && <p className="quiet-text spending-missing">{TRIPS_COPY.withoutTotal(spending.withoutTotal)}</p>}
    </>
  )
}
