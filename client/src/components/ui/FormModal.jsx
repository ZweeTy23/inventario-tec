import { Modal, Button } from 'flowbite-react'

export default function FormModal({
  show,
  onClose,
  title,
  onSubmit,
  isSubmitting,
  submitLabel = 'Guardar',
  children,
  size = 'md',
}) {
  return (
    <Modal show={show} onClose={onClose} size={size}>
      <Modal.Header>{title}</Modal.Header>
      <form onSubmit={onSubmit}>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          <Button color="gray" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
