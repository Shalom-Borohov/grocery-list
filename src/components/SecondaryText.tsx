import { COMMON_COPY } from '../copy/common'
import type { SecondaryLine } from '../domain/secondaryLine'
import './SecondaryText.css'

export function SecondaryText({ line }: { line: SecondaryLine | undefined }) {
  if (!line) {
    return null
  }

  switch (line.kind) {
    case 'missing':
      return <span className="warning-word">{COMMON_COPY.missing}</span>
    case 'missedLastTrip':
      return <>{COMMON_COPY.missedLastTrip}</>
    case 'never':
      return <span className="warning-word">{COMMON_COPY.neverAgain}</span>
    case 'again':
      return <span className="again-word">{COMMON_COPY.buyAgain}</span>
    case 'note':
      return <span dir="auto">{line.note}</span>
  }
}
