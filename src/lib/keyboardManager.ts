import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

/**
 * Configure keyboard behavior.
 * - Keyboard pushes the web view up (native resize)
 * - Dismisses on scroll
 *
 * Adds a CSS class `keyboard-open` to <body> when visible
 * so layouts can adapt (e.g. hide fixed bottom elements).
 */
export async function initKeyboardManager(): Promise<void> {
  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    await Keyboard.setScroll({ isDisabled: false });

    Keyboard.addListener("keyboardWillShow", () => {
      document.body.classList.add("keyboard-open");
    });

    Keyboard.addListener("keyboardWillHide", () => {
      document.body.classList.remove("keyboard-open");
    });
  } catch {
    // Not available on web — no-op
  }
}

/** Programmatically dismiss the keyboard. */
export async function hideKeyboard(): Promise<void> {
  try {
    await Keyboard.hide();
  } catch {
    // Not available — no-op. Web keyboards dismiss on blur.
  }
}
