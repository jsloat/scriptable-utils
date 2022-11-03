/**
 * There are instances (for example, when private data is required) when the
 * user should provide their own implementations of functions that are required
 * for this repository. In that case, the user must register the implementation
 * using this file before they need to use the functions that depend on them.
 */

export type Registry = {
  getCalendarTitles: NoParamFn<Record<'PERSONAL' | 'WORK', string>>;
};

const getPlaceholderImplementation = (fnName: string) => () => {
  throw new Error(
    `You must register the "${fnName}" in your implementation before using functions that depend on it.`
  );
};

const registry: Registry = {
  getCalendarTitles: getPlaceholderImplementation('getCalendarTitles'),
};

export const getService = (name: keyof Registry) => registry[name];

export const registerService = <N extends keyof Registry>(
  name: N,
  val: Registry[N]
) => (registry[name] = val);
