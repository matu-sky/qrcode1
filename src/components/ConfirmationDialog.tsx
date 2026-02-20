import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmationDialogProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ show, onConfirm, onCancel, title, message }) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          나가기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
