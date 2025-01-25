import { toast } from "react-toastify";

export const handleSuccess = (msg) => {
  toast.success(msg, { position: "top-right" });
};

export const handleError = (msg) => {
  toast.error(msg, { position: "top-right" });
};

// utils/toastUtils.js
export function closeToast(toast) {
  if (!toast) {
    console.error("Toast is undefined");
    return;
  }
  toast.removalReason = "user-dismissed";
}
