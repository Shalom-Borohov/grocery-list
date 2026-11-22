import { type ReactNode, useId } from 'react'
import { amountParts, amountText, quantityText } from '../copy/amountCopy'
import { joinParts } from '../copy/joinParts'
import type { Amount } from '../domain/types'
import { DECORATIVE_IMAGE, ItemThumbnail } from './ItemThumbnail'
import './LabelRow.css'

type LabelRowProps = {
  name: string
  secondary?: ReactNode
  amount?: Amount
  column?: ReactNode
  photoId?: string
  isTaken?: boolean
  trailing?: ReactNode
  end?: ReactNode
  pressed?: boolean
  columnLabel?: string
  onTap?: () => void
  onColumnTap?: () => void
}

type AmountColumnSize = 'row' | 'large'

type AmountColumnProps = {
  numeral: string
  unitLabel?: string
  spoken?: string
  size: AmountColumnSize
}

const NUMERAL_CLASSES: Record<AmountColumnSize, string> = {
  row: 'amount-numeral num',
  large: 'amount-numeral num is-large',
}

const UNIT_CLASSES: Record<AmountColumnSize, string> = { row: 'amount-unit', large: 'amount-unit is-large' }

export function AmountColumn({ numeral, unitLabel, spoken, size }: AmountColumnProps) {
  const isReadAsSpoken = spoken !== undefined

  return (
    <>
      {isReadAsSpoken && <span className="visually-hidden">{spoken}</span>}
      <span className={NUMERAL_CLASSES[size]} aria-hidden={isReadAsSpoken || undefined}>
        {numeral}
      </span>
      {unitLabel && (
        <span className={UNIT_CLASSES[size]} aria-hidden={isReadAsSpoken || undefined}>
          {unitLabel}
        </span>
      )}
    </>
  )
}

type AmountColumnOfProps = {
  amount: Amount
  isTappable: boolean
}

function AmountColumnOf({ amount, isTappable }: AmountColumnOfProps) {
  const parts = amountParts(amount)

  if (!parts) {
    return isTappable && <span className="amount-numeral num is-quiet">{quantityText(amount.quantity)}</span>
  }

  return (
    <AmountColumn
      numeral={parts.numeral}
      unitLabel={parts.unitLabel}
      spoken={isTappable ? undefined : parts.spokenUnlikeShown}
      size="row"
    />
  )
}

export function LabelRow(props: LabelRowProps) {
  const { name, secondary, amount, column, photoId, isTaken, trailing, end, pressed, onTap, onColumnTap } = props
  const nameId = useId()
  const secondaryId = useId()
  const columnContent = column ?? (amount && <AmountColumnOf amount={amount} isTappable={onColumnTap !== undefined} />)
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
      {end}
    </div>
  )
}
