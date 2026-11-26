import { IonModal } from '@ionic/react'
import { type ComponentProps, useCallback, useEffect, useRef } from 'react'

const SHEET_DIALOG_SELECTOR = '[role="dialog"]'
const SHEET_NAME_ATTRIBUTE = 'aria-label'

type SheetModalProps = ComponentProps<typeof IonModal> & { name: string | undefined }

export function SheetModal({ name, onWillPresent, ...modalProps }: SheetModalProps) {
  const modalRef = useRef<HTMLIonModalElement>(null)

  const nameSheet = useCallback(() => {
    if (name === undefined) {
      return
    }

    modalRef.current?.shadowRoot?.querySelector(SHEET_DIALOG_SELECTOR)?.setAttribute(SHEET_NAME_ATTRIBUTE, name)
  }, [name])

  const onWillPresentNamed = useCallback<NonNullable<SheetModalProps['onWillPresent']>>(
    (event) => {
      nameSheet()
      onWillPresent?.(event)
    },
    [nameSheet, onWillPresent],
  )

  useEffect(nameSheet, [nameSheet])

  return <IonModal {...modalProps} ref={modalRef} onWillPresent={onWillPresentNamed} />
}
