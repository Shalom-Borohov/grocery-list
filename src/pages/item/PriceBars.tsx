import { useId } from 'react'
import { COMMON_COPY } from '../../copy/common'
import type { PricePoint } from '../../domain/itemHistory'
import { ITEM_COPY } from './copy'
import { dateOf } from './itemFacts'

const PERCENT = 100

const NEWEST_INDEX = 0

const barWidth = (share: number) => `${Math.round(share * PERCENT)}%`

type PriceRowProps = {
  point: PricePoint
  isNewest: boolean
  today: string
}

function PriceRow({ point, isNewest, today }: PriceRowProps) {
  return (
    <li className="price-row">
      <span className="price-date num">{dateOf(point.finishedAt, today)}</span>
      <span className="price-track" aria-hidden="true">
        <span className={isNewest ? 'price-bar is-newest' : 'price-bar'} style={{ width: barWidth(point.share) }} />
      </span>
      {isNewest && <span className="visually-hidden">{ITEM_COPY.newestPrice}</span>}
      <span className="price-amount num">{COMMON_COPY.shekels(point.price)}</span>
    </li>
  )
}

export function PriceBars({ prices, today }: { prices: PricePoint[]; today: string }) {
  const headingId = useId()

  return (
    <section className="item-prices">
      <h2 id={headingId} className="item-section-heading">
        {ITEM_COPY.prices}
      </h2>
      {prices.length === 0 ? (
        <p className="quiet-text item-prices-empty">{ITEM_COPY.noPrices}</p>
      ) : (
        <ul className="price-list" aria-labelledby={headingId}>
          {prices.map((point, index) => (
            <PriceRow key={point.finishedAt} point={point} isNewest={index === NEWEST_INDEX} today={today} />
          ))}
        </ul>
      )}
    </section>
  )
}
