/**
 * The registration submit control is full width, so a bottom-corner floating
 * action covers it on phone and tablet widths. Desktop has room beside the form.
 */
export const REGISTRATION_PATH = "/register";
export const FLOATING_CLEAR_MIN_WIDTH = 1024;

export function floatingControlsClearRegistration(options: {
  pathname: string;
  viewportWidth: number;
}): boolean {
  if (options.pathname !== REGISTRATION_PATH) return true;
  return options.viewportWidth >= FLOATING_CLEAR_MIN_WIDTH;
}
