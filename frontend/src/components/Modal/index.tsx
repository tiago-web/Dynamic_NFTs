import { Box, Modal as MUIModal } from "@mui/material";
import { AiOutlineCloseCircle } from "react-icons/ai";

import "./styles.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: JSX.Element;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => (
  <MUIModal open={open} onClose={onClose}>
    <Box
      sx={{
        position: "relative" as "relative",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "35rem",
        bgcolor: "#fafafa",
        boxShadow: 24,
        borderRadius: 3,
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "90vh",
      }}
    >
      <AiOutlineCloseCircle className="modal-close-icon" onClick={onClose} />

      {children}
    </Box>
  </MUIModal>
);

export default Modal;
