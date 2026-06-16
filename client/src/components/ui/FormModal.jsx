import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'

export default function FormModal({
  show,
  onClose,
  title,
  onSubmit,
  isSubmitting,
  disabled = false,
  submitLabel = 'Guardar',
  children,
  size = 'md',
}) {
  return (
    <Modal show={show} onClose={onClose} size={size}>
      <ModalHeader>{title}</ModalHeader>
      <form onSubmit={onSubmit}>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button color="gray" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || disabled}>
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
