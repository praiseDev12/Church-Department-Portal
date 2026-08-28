import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth='max-w-sm'>
      <p className='text-sm text-zinc-600 dark:text-zinc-300'>{message}</p>
      <div className='mt-5 flex justify-end gap-2'>
        <Button variant='secondary' onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
