import { type ReactNode, useId } from 'react'
import { amountParts, amountText } from '../copy/amountCopy'
import { joinParts } from '../copy/joinParts'
import type { Amount } from '../domain/types'
import { ItemThumbnail } from './ItemThumbnail'
import './LabelRow.css'

type LabelRowProps = {
  name: string
  secondary?: ReactNode
  amount?: Amount
  column?: ReactNode
  photoId?: string
  isTaken?: boolean
  trailing?: ReactNode
  pressed?: boolean
  columnLabel?: string
  onTap?: () => void
  onColumnTap?: () => void
}

type AmountColumnSize = 'row' | 'large'

type AmountColumnProps = {
  numeral: string
  unitLabel?: string
  size: AmountColumnSize
}

const NUMERAL_CLASSES: Record<AmountColumnSize, string> = {
  row: 'amount-numeral num',
  large: 'amount-numeral num is-large',
}

const UNIT_CLASSES: Record<AmountColumnSize, string> = { row: 'amount-unit', large: 'amount-unit is-large' }

const DECORATIVE_IMAGE = ''

export function AmountColumn({ numeral, unitLabel, size }: AmountColumnProps) {
  return (
    <>
      <span className={NUMERAL_CLASSES[size]}>{numeral}</span>
      {unitLabel && <span className={UNIT_CLASSES[size]}>{unitLabel}</span>}
    </>
  )
}

function AmountColumnOf({ amount }: { amount: Amount }) {
  const parts = amountParts(amount)

  return parts && <AmountColumn numeral={parts.numeral} unitLabel={parts.unitLabel} size="row" />
}

export function LabelRow(props: LabelRowProps) {
  const { name, secondary, amount, column, photoId, isTaken, trailing, pressed, onTap, onColumnTap } = props
  const nameId = useId()
  const secondaryId = useId()
  const columnContent = column ?? (amount && <AmountColumnOf amount={amount} />)
  const columnLabel = joinParts([props.columnLabel, amount && amountText(amount)])

  const body = (
    <>
      <span className="label-row-text">
        <span id={nameId} className="label-row-name" dir="auto">
          {name}
        </span>
        {secondary && (
          <span id={secondaryId} className="label-row-secondary">
            {secondary}
          </span>
        )}
      </span>
      {photoId && <ItemThumbnail photoId={photoId} alt={onTap ? DECORATIVE_IMAGE : name} className="label-row-photo" />}
      {trailing}
    </>
  )

  return (
    <div className={isTaken ? 'label-row is-taken' : 'label-row'}>
      {onColumnTap ? (
        <button type="button" className="label-row-column" aria-label={columnLabel} onClick={onColumnTap}>
          {columnContent}
        </button>
      ) : (
        <span className="label-row-column">{columnContent}</span>
      )}
      {onTap ? (
        <button
          type="button"
          className="label-row-body"
          aria-pressed={pressed}
          aria-labelledby={nameId}
          aria-describedby={secondary ? secondaryId : undefined}
          onClick={onTap}
        >
          {body}
        </button>
      ) : (
        <span className="label-row-body">{body}</span>
      )}
    </div>
  )
}
