import { toast } from "react-toastify";
import { atom } from "recoil";
import { getRecoil, setRecoil } from "recoil-nexus";

// export interface Toast {
// 	title?: string;
// 	message: string;
// 	link?: string;
// 	linkText?: string;
// 	key?: any;
// 	toastType?: ToastType;
// 	timeoutSeconds?: number;
// }

// export enum ToastType {
// 	Info = 'info',
// 	Warning = 'warning',
// 	Critical = 'critical',
// 	Success = 'success',
// }

export enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
  Warn = "warn",
  Dark = "dark",
  Default = "default",
}

export interface Toast {
  title?: string;
  message: string;
  key?: any;
  toastType?: ToastType;
  timeoutSeconds?: number;
}

// Users need enough time to read the toast before it disappears
export const MinimumToastTimeoutSeconds = 5;

export const toastAtom = atom({
  key: "toasts",
  default: [] as Toast[],
});

//addToast  - add toast using react_tostify
export function addToast(toastProps: Toast) {
  if (!toastProps.key) toastProps.key = Date.now();
  const toasts = getRecoil(toastAtom);
  console.log("Toast Props: ", toastProps);
  switch (toastProps.toastType) {
    case ToastType.Success:
      if (toastProps.timeoutSeconds) {
        toast.success(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
        });
      } else {
        toast.success(toastProps.message, {
          autoClose: 4000,
        });
      }
      break;
    case ToastType.Warn:
      if (toastProps.timeoutSeconds) {
        toast.warn(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
          className: "toast-warn",
        });
      } else {
        toast.warn(toastProps.message, {
          autoClose: 4000,
          className: "toast-warn",
        });
      }
      break;
    case ToastType.Error:
      if (toastProps.timeoutSeconds) {
        toast.error(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
        });
      } else {
        toast.error(toastProps.message, {
          autoClose: 4000,
        });
      }
      break;
    case ToastType.Info:
      if (toastProps.timeoutSeconds) {
        toast.info(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
        });
      } else {
        toast.info(toastProps.message, {
          autoClose: 4000,
        });
      }
      break;
    case ToastType.Dark:
      if (toastProps.timeoutSeconds) {
        toast.dark(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
        });
      } else {
        toast.dark(toastProps.message, {
          autoClose: 4000,
        });
      }
      break;
    default:
      if (toastProps.timeoutSeconds) {
        toast(toastProps.message, {
          autoClose: toastProps.timeoutSeconds * 1000,
        });
      } else {
        toast(toastProps.message, {
          autoClose: 4000,
        });
      }
      break;
  }
  setRecoil(toastAtom, [toastProps, ...toasts]);
  if (
    toastProps.timeoutSeconds &&
    toastProps.timeoutSeconds >= MinimumToastTimeoutSeconds
  ) {
    setTimeout(() => removeToast(toastProps), toastProps.timeoutSeconds * 1000);
  }
}

// // addToast adds a new toast to the list
// export function addToast(toast: Toast) {
// 	if (!toast.key) toast.key = Date.now();
// 	const toasts = getRecoil(toastAtom);
// 	setRecoil(toastAtom, [toast, ...toasts]);
// 	// This trace message is intentional and should not be removed. This leaves evidence of the toast message in the console.
// 	console.log(`[TOAST::${toast.toastType}] ${toast.title ? `${toast.title} - ` : ''}${toast.message} ${toast.link || ''}`);

// 	// Set timer to clear the toast
// 	if (toast.timeoutSeconds && toast.timeoutSeconds >= MinimumToastTimeoutSeconds) {
// 		setTimeout(() => removeToast(toast), toast.timeoutSeconds * 1000);
// 	}
// }

// removeToast removes the specified element from the list
export function removeToast(toast: Toast) {
  // Find toast
  let toasts = getRecoil(toastAtom);
  const idx = toasts.indexOf(toast);
  if (idx < 0) return;

  // Remove toast
  const newToasts = [...toasts];
  newToasts.splice(idx, 1);
  setRecoil(toastAtom, newToasts);
}
