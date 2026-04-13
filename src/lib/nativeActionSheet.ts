import { ActionSheet, ActionSheetButtonStyle } from "@capacitor/action-sheet";

export interface ActionSheetChoice {
  title: string;
  destructive?: boolean;
  cancel?: boolean;
}

/**
 * Show a native action sheet. Returns the index of the selected option,
 * or -1 if cancelled / unavailable.
 */
export async function showActionSheet(opts: {
  title?: string;
  message?: string;
  options: ActionSheetChoice[];
}): Promise<number> {
  try {
    const result = await ActionSheet.showActions({
      title: opts.title,
      message: opts.message,
      options: opts.options.map(o => ({
        title: o.title,
        style: o.destructive
          ? ActionSheetButtonStyle.Destructive
          : o.cancel
          ? ActionSheetButtonStyle.Cancel
          : ActionSheetButtonStyle.Default,
      })),
    });
    return result.index;
  } catch {
    return -1;
  }
}
