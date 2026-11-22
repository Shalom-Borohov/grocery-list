import { useState } from 'react'

type RowSheetState = {
  entryId?: string
  isClosing: boolean
  queuedEntryId?: string
}

type SheetDragEnd = { detail: { isDismissing?: boolean } }

export type SheetModalProps = {
  isOpen: boolean
  onIonDragEnd: (event: SheetDragEnd) => void
  onWillDismiss: () => void
  onDidDismiss: () => void
}

const CLOSED: RowSheetState = { isClosing: false }

export function useRowSheet() {
  const [state, setState] = useState(CLOSED)

  const open = (entryId: string) =>
    setState((current) => (current.isClosing ? { ...current, queuedEntryId: entryId } : { entryId, isClosing: false }))

  const close = () => setState((current) => (current.entryId === undefined ? current : { ...current, isClosing: true }))

  const modalProps: SheetModalProps = {
    isOpen: state.entryId !== undefined && !state.isClosing,
    onIonDragEnd: (event) => event.detail.isDismissing && close(),
    onWillDismiss: close,
    onDidDismiss: () => setState((current) => ({ entryId: current.queuedEntryId, isClosing: false })),
  }

  return { entryId: state.entryId, open, close, modalProps }
}
