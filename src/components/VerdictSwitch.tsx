import { COMMON_COPY } from '../copy/common'
import { updateItem } from '../data/itemsRepo'
import { type Item, type Verdict, VERDICTS } from '../domain/types'
import { ChoiceGroup } from './ChoiceGroup'
import { TickIcon } from './icons'
import { useAction } from './useAction'
import './VerdictSwitch.css'

const VERDICT_LABELS: Record<Verdict, string> = { again: COMMON_COPY.buyAgain, never: COMMON_COPY.neverAgain }

const VERDICT_TICK_SIZE = 16

type VerdictSwitchProps = {
  item: Item
  label: string
}

export function VerdictSwitch({ item, label }: VerdictSwitchProps) {
  const run = useAction()

  return (
    <ChoiceGroup
      className="segmented verdict-switch"
      label={label}
      choices={VERDICTS}
      chosen={item.verdict}
      tapAgainClears
      labelOf={(verdict) => (
        <>
          {verdict === item.verdict && <TickIcon size={VERDICT_TICK_SIZE} />}
          <span className={verdict === 'never' ? 'verdict-never' : undefined}>{VERDICT_LABELS[verdict]}</span>
        </>
      )}
      onChoose={(verdict) => run(() => updateItem(item.id, { verdict }))}
    />
  )
}
