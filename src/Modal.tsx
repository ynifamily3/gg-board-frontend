import { PropsWithChildren } from "react";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");
export default function MyModal(
  props: PropsWithChildren<{ isOpen: boolean; handleClose: () => void }>
) {
  return (
    <Modal
      isOpen={props.isOpen}
      onRequestClose={props.handleClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick
      style={customStyles}
    >
      {props.children}
    </Modal>
  );
}
