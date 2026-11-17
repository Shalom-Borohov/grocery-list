import { IonContent, IonModal } from '@ionic/react'
import { useState } from 'react'
import { ChoiceGroup } from '../../components/ChoiceGroup'
import { NoteField } from '../../components/NoteField'
import { SheetHeader } from '../../components/SheetHeader'
import { COMMON_COPY } from '../../copy/common'
import { SETTINGS_COPY } from './copy'
import { FEEDBACK_KINDS, type FeedbackKind, feedbackLink } from './feedbackUrl'
import { usePhoneState } from './phoneState'

type FeedbackSheetProps = {
  isOpen: boolean
  onClose: () => void
}

const KIND_LABELS: Record<FeedbackKind, string> = { bug: SETTINGS_COPY.bug, idea: SETTINGS_COPY.idea }

const PLACEHOLDERS: Record<FeedbackKind, string> = {
  bug: SETTINGS_COPY.bugPlaceholder,
  idea: SETTINGS_COPY.ideaPlaceholder,
}

function FeedbackForm({ onClose }: Pick<FeedbackSheetProps, 'onClose'>) {
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [text, setText] = useState('')
  const [hasOpened, setHasOpened] = useState(false)
  const phone = usePhoneState()
  const { url, isCut } = feedbackLink(kind, text, phone)

  function openInGitHub() {
    window.open(url, '_blank', 'noopener')
    setHasOpened(true)
  }

  return (
    <>
      <SheetHeader
        title={SETTINGS_COPY.report}
        start={{ text: hasOpened ? COMMON_COPY.close : COMMON_COPY.cancel, onTap: onClose }}
      />
      <IonContent>
        <div className="sheet-body feedback-body">
          <ChoiceGroup
            label={SETTINGS_COPY.kind}
            choices={FEEDBACK_KINDS}
            chosen={kind}
            labelOf={(choice) => KIND_LABELS[choice]}
            onChoose={setKind}
          />
          <NoteField
            label={SETTINGS_COPY.description}
            placeholder={PLACEHOLDERS[kind]}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="quiet-text feedback-notes" role="status">
            <p>{SETTINGS_COPY.feedbackFooter}</p>
            {isCut && <p>{SETTINGS_COPY.feedbackTooLong}</p>}
            {hasOpened && <p>{SETTINGS_COPY.feedbackOpened}</p>}
          </div>
          <button
            type="button"
            className="primary-button settings-action"
            disabled={text.trim() === ''}
            onClick={openInGitHub}
          >
            {SETTINGS_COPY.openInGitHub}
          </button>
        </div>
      </IonContent>
    </>
  )
}

export function FeedbackSheet({ isOpen, onClose }: FeedbackSheetProps) {
  return (
    <IonModal isOpen={isOpen} backdropDismiss={false} onDidDismiss={onClose}>
      <FeedbackForm onClose={onClose} />
    </IonModal>
  )
}
