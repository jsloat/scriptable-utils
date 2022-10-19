import { safeArrLookup } from './common';
import { notifyNow } from './notifications';

// ts-unused-exports:disable-next-line
export const sequentialPromiseAll = async <T>(fns: (() => Promise<T>)[]) => {
  const result: T[] = [];
  for (const fn of fns) {
    result.push(await fn());
  }
  return result;
};

export const identity = <T>(input: T) => input;

/** Composes a sequence of identities into a single identity function. The order
 * identities is applied is preserved. */
export const composeIdentities =
  <D>(...identities: Identity<D>[]): Identity<D> =>
  (initData: D) =>
    identities.reduce((currData, identity) => identity(currData), initData);

export const combineReducers = composeIdentities;

export const combineAsyncReducers =
  <T>(...reducers: MapFn<T, MaybePromise<T>>[]): MapFn<T, MaybePromise<T>> =>
  async initData => {
    let updatedData = initData;
    for (const index in reducers) {
      const reducer = reducers[index];
      updatedData = reducer ? await reducer(updatedData) : updatedData;
    }
    return updatedData;
  };

/** HOF to invert a predicate function */
export const invert =
  <Args extends any[]>(predicate: (...args: Args) => boolean) =>
  (...args: Args) =>
    !predicate(...args);

type ExpiringConstOpts<T> = {
  label: string;
  temporaryValue: T;
  fallbackValue: T;
  expiryDate: Date;
};
/** Get a const value with a lifespan. When const expires, alert with a notification and use fallback value */
// ts-unused-exports:disable-next-line
export const getExpiringConstIIFE =
  <T>({
    label,
    temporaryValue,
    fallbackValue,
    expiryDate,
  }: ExpiringConstOpts<T>) =>
  () => {
    const isExpired = new Date() > expiryDate;
    if (!isExpired) return temporaryValue;
    notifyNow(`Expired const "${label}" should be cleaned up`);
    return fallbackValue;
  };

/** Given current value & cycle options, return the next option in the cycle */
export const cycle = <T>(
  currentValue: any,
  cycleOptions: T[],
  isEqual: ObjComparison<T> = (a, b) => a === b
) => {
  const currIndex = cycleOptions.findIndex(opt => isEqual(opt, currentValue));
  if (currIndex === -1) {
    console.warn(
      `Current value ${currentValue} not found in cycle options, returning first option`
    );
    return safeArrLookup(cycleOptions, 0, 'cycle.1');
  }
  const isLast = currIndex === cycleOptions.length - 1;
  return safeArrLookup(cycleOptions, isLast ? 0 : currIndex + 1, 'cycle.2');
};

/** Used in case looking up a record value should possibly be undefined, but TS disagrees */
export const lookup = <K extends string, V>(
  dict: Record<K, V>,
  lookupKey: K
): V | undefined => dict[lookupKey];

type Curry = {
  /** Unsupported arity, error! */
  <A, Z>(fn: (a: A) => Z): unknown;
  <A, B, Z>(fn: (a: A, b: B) => Z): (a: A) => (b: B) => Z;
  <A, B, C, Z>(fn: (a: A, b: B, c: C) => Z): (a: A) => (b: B) => (c: C) => Z;
  /** Unsupported arity, error! */
  (fn: (...args: any[]) => any): unknown;
};
export const curry: Curry = (fn: (...args: any[]) => any) => {
  const arity = fn.length;
  if (arity === 2) return (a: any) => (b: any) => fn(a, b);
  if (arity === 3) return (a: any) => (b: any) => (c: any) => fn(a, b, c);
  throw new Error(`Attempting to use curry with unsupported arity ${arity}`);
};

export const curryKinda =
  <A, B extends any[], R>(fn: (arg1: A, ...restArgs: B) => R) =>
  (arg1: A) =>
  (...restArgs: B) =>
    fn(arg1, ...restArgs);

// Routing

type RouteAction<T, R> = (input: T) => R;
type TypeRouteRule<T, R> = [typeguard: Typeguard<T>, action: RouteAction<T, R>];

export const typeRouteRule = <T, R>(
  typeguard: Typeguard<T>,
  action: RouteAction<T, R>
): TypeRouteRule<T, R> => [typeguard, action];

/** Route an input value according to its type, determined by typeguard rules */
export const typeRoute = <R = void>(
  input: unknown,
  rules: TypeRouteRule<any, R>[],
  fallbackAction?: RouteAction<any, R>
) => {
  const firstMatchingRule = rules.find(([typeguard]) => typeguard(input));
  if (!firstMatchingRule) {
    if (fallbackAction) return fallbackAction(input);
    throw new Error(
      'No matching type route for input, and no fallback provided.'
    );
  }
  return firstMatchingRule[1](input);
};

//

/** More succinct version of writing out an immediately-executing switch block */
export const shortSwitch = <Input extends string, Return = Input>(
  input: Input,
  returnMap: Record<Input, Return | undefined>
) => {
  const matchingReturn = returnMap[input];
  if (matchingReturn === undefined)
    throw new Error('No matching value in shortSwitch!');
  return matchingReturn as Return;
};

type RunOnceResponse<R> = R extends Promise<any>
  ? Promise<
      | { response: UnwrapPromise<R>; didRun: true }
      | { response: void; didRun: false }
    >
  : { response: R; didRun: true } | { response: undefined; didRun: false };
type RunOnce = {
  <R>(fn: (args: void) => R): (args: void) => RunOnceResponse<R>;
  <A, R>(fn: (singleArg?: A) => R): (singleArg?: A) => RunOnceResponse<R>;
  <A, R>(fn: (singleArg: A) => R): (singleArg: A) => RunOnceResponse<R>;
};
/** Run the passed function only the first time. Returns object containing
 * response & whether or not the function ran. */
// ts-unused-exports:disable-next-line
export const runOnce: RunOnce = (fn: (...args: any) => any): any => {
  let hasRun = false;
  return async (...args: any) => {
    if (hasRun) return { response: undefined, didRun: false };
    hasRun = true;
    return { response: await fn(...args), didRun: true };
  };
};

//

// ts-unused-exports:disable-next-line
export const wait = (ms: number, callback?: () => any) => {
  const t = new Timer();
  t.timeInterval = ms;
  return new Promise<void>(resolve =>
    t.schedule(async () => {
      if (callback) await callback();
      resolve();
    })
  );
};

//
// Performance measurement
//

type PerformanceMeasurerOpts = {
  name: string;
  threshold: number;
  metadata?: AnyObj;
  /** Notify regardless of threshold */
  logAllMeasurements?: boolean;
};
const getPerformanceMeasurers = ({
  name,
  threshold,
  metadata,
  logAllMeasurements = false,
}: PerformanceMeasurerOpts) => {
  let startDate: Date | null = null;
  const start = () => {
    startDate = new Date();
  };
  const stop = () => {
    if (!startDate) {
      throw new Error(`Performance timer ${name} stopped before starting.`);
    }
    const duration = new Date().getTime() - startDate.getTime();
    if (duration < threshold && !logAllMeasurements) return;
    console.warn(
      JSON.stringify(
        {
          'Performance measure exceeded threshold': name,
          threshold,
          actual: duration,
          metadata,
        },
        null,
        2
      )
    );
    notifyNow(
      `Marker "${name}"`,
      `Threshold (ms): ${threshold}, actual: ${duration}`
    );
  };
  return { start, stop };
};

type Measure = <R>(
  opts: MakeSomeOptional<
    PerformanceMeasurerOpts,
    'threshold',
    'logAllMeasurements'
  > & { fn: NoParamFn<MaybePromise<R>> }
) => () => Promise<R>;

/** If threshold is provided, will only notify if it is exceeded, else will log
 * the duration every time */
// ts-unused-exports:disable-next-line
export const measure: Measure =
  ({ name, fn, threshold, metadata }) =>
  async () => {
    const measurer = getPerformanceMeasurers({
      name,
      threshold: threshold || 0,
      metadata,
      logAllMeasurements: !threshold,
    });
    measurer.start();
    const result = await fn();
    measurer.stop();
    return result;
  };

//

/** Returns null if fn call is throttled */
export const throttle = <Args extends any[], R>(
  fn: (...args: Args) => R,
  interval = 500
) => {
  let mayRun = true;
  return (...args: Args) => {
    if (!mayRun) return null;
    const timer = new Timer();
    timer.timeInterval = interval;
    timer.schedule(() => (mayRun = true));
    mayRun = false;
    return fn(...args);
  };
};

export const force = <T>(val: any) => val as unknown as T;

// ts-unused-exports:disable-next-line
export const noop = () => {};
