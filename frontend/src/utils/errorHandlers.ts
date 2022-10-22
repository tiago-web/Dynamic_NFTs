import toast from "react-hot-toast";

export const parseError = (error: any): string => {
  const message =
    typeof error === "string" || error instanceof String
      ? error
      : error?.data?.message !== undefined
      ? error?.data?.message
      : error?.message || JSON.stringify(error);

  return message.substring(0, 512);
};

const toastStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  padding: "0.4rem",
  wordBreak: "break-word",
};

/** Helper function to toast a Successful message */
export const toastSuccess = (message: string): string =>
  toast.success(message, {
    position: "top-right",
    style: toastStyle,
    duration: 5000,
  });

/** Helper function to toast an Error */
export const toastError = (errorMessage: any): string =>
  toast.error(parseError(errorMessage), {
    position: "top-right",
    style: toastStyle,
    duration: 5000,
  });
