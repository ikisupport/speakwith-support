/**
 * Join class names, dropping anything falsy.
 *
 * Needed because a single `class="a b"` in an Angular template can mix a
 * global class from styles.css with a module-scoped one from the component's
 * own styles block, and those two come from different places here.
 */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
