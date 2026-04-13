import { Dialog } from "@capacitor/dialog";

/**
 * Native confirm dialog. Returns true if user confirmed.
 * Falls back to window.confirm on PWA/browser.
 */
export async function confirmNative(opts: {
  title: string;
  message: string;
  okButtonTitle?: string;
  cancelButtonTitle?: string;
}): Promise<boolean> {
  try {
    const result = await Dialog.confirm({
      title: opts.title,
      message: opts.message,
      okButtonTitle: opts.okButtonTitle ?? "OK",
      cancelButtonTitle: opts.cancelButtonTitle ?? "Cancel",
    });
    return result.value;
  } catch {
    return window.confirm(`${opts.title}\n\n${opts.message}`);
  }
}

/**
 * Native alert. Falls back to window.alert on PWA/browser.
 */
export async function alertNative(opts: {
  title: string;
  message: string;
  buttonTitle?: string;
}): Promise<void> {
  try {
    await Dialog.alert({
      title: opts.title,
      message: opts.message,
      buttonTitle: opts.buttonTitle ?? "OK",
    });
  } catch {
    window.alert(`${opts.title}\n\n${opts.message}`);
  }
}
