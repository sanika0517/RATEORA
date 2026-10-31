import Button from './Button'
import Modal from './Modal'

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
