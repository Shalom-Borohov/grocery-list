import type { Item } from '../../../domain/types'
import { PickerItemRow, type PickerRowsProps } from './PickerItemRow'

type ItemSectionProps = PickerRowsProps & {
  heading: string
  items: Item[]
}

export function ItemSection({ heading, items, ...rowsProps }: ItemSectionProps) {
  return (
    <section>
      <h2 className="section-heading">{heading}</h2>
      <ul className="label-list">
        {items.map((item) => (
          <PickerItemRow key={item.id} item={item} {...rowsProps} />
        ))}
      </ul>
    </section>
  )
}
