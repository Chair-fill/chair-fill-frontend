/**
 * Shared Tailwind class strings for consistent UI across the app.
 * Use these to keep styles DRY and easy to update.
 */

/** Full-height centered auth-style layout (login, signup, forgot-password, complete-registration) */
export const AUTH_LAYOUT =
  "min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8";

/** Inner wrapper for auth content (max width) */
export const AUTH_LAYOUT_INNER = "w-full max-w-md";

/** Card container for auth forms */
export const AUTH_CARD =
  "bg-[#0a0a0a] rounded-2xl border border-border shadow-sm p-6 sm:p-8";

/** Card with slightly rounder corners (e.g. complete-registration) */
export const AUTH_CARD_ROUNDED =
  "bg-[#0a0a0a] rounded-3xl border border-border shadow-sm p-6 sm:p-8";

/** Form label */
export const FORM_LABEL =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2";

/** Base input styles */
const INPUT_BASE =
  "w-full py-2.5 border border-border rounded-xl bg-[#121212] text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

/** Input with left icon (e.g. Mail, Lock) */
export const INPUT_LEFT_ICON = `pl-10 pr-4 ${INPUT_BASE}`;

/** Input with left icon and right slot (e.g. password with eye toggle) */
export const INPUT_LEFT_RIGHT_ICON = `pl-10 pr-10 ${INPUT_BASE}`;

/** Input without left icon (e.g. OTP field) */
export const INPUT_PLAIN = `px-4 ${INPUT_BASE}`;

/** Icon position inside input (left) */
export const INPUT_ICON_LEFT =
  "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400";

/** Icon/button position inside input (right, e.g. eye toggle) */
export const INPUT_ICON_RIGHT =
  "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300";

/** Primary button (submit, main action) */
export const BTN_PRIMARY =
  "w-full py-3 px-6 bg-primary text-primary-foreground rounded-full hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all";

/** Primary button without full width (e.g. Save in profile) */
export const BTN_PRIMARY_INLINE =
  "py-3 px-6 bg-primary text-primary-foreground rounded-full hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all";

/** Secondary/outline button (Back, Cancel) */
export const BTN_SECONDARY =
  "py-3 px-6 border border-primary text-primary rounded-full hover:bg-primary/10 font-semibold inline-flex items-center justify-center gap-2 transition-all";

/** Primary button that can be flex-1 in a row */
export const BTN_PRIMARY_FLEX =
  "flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-full hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all";

/** Error message box (red) */
export const FORM_ERROR_BOX =
  "p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg";

export const FORM_ERROR_TEXT = "text-sm text-red-600 dark:text-red-400";

/** Success message box (green) */
export const FORM_SUCCESS_BOX =
  "p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg";

export const FORM_SUCCESS_TEXT =
  "text-sm text-emerald-700 dark:text-emerald-300";

/** Auth page subtitle text */
export const AUTH_SUBTITLE = "mt-2 text-zinc-600 dark:text-zinc-400";

/** Auth card footer link text (e.g. "Already have an account? Sign in") */
export const AUTH_FOOTER_TEXT =
  "mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400";

export const AUTH_FOOTER_LINK =
  "font-medium text-zinc-900 dark:text-zinc-50 hover:underline";
