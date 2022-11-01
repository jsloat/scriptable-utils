import { hasLength } from './array';
import { compose, filter, map, toArray } from './arrayTransducers';
import { isBoolean, isFunc } from './common';

export const NO_CONDITIONAL_VALUE_MATCH = Symbol('NO_CONDITIONAL_VALUE_MATCH');
type NoChangeSymbol = typeof NO_CONDITIONAL_VALUE_MATCH;

/** Useful if the condition is needed for the retrun value, e.g. a typeguard
 * condition */
type ConditionFn<T> = NoParamFn<T | NoChangeSymbol>;

type ConditionRule<T> = [condition: boolean, value: T];

type ConditionalValue = {
  /** With fallback provided */
  <T>(
    conditions: [
      ...conditionRules: (ConditionRule<T> | ConditionFn<T>)[],
      fallback: T
    ]
  ): T;

  /** No fallback provided, defaults to null */
  <T>(conditions: (ConditionRule<T> | ConditionFn<T>)[]): T | null;
};

type AnyArrItem<T> = ConditionRule<T> | ConditionFn<T> | T;

const isConditionRule = <T>(val: AnyArrItem<T>): val is ConditionRule<T> =>
  Array.isArray(val) && val.length === 2 && isBoolean(val[0]);

const isConditionFn = <T>(val: AnyArrItem<T>): val is ConditionFn<T> =>
  isFunc(val);

const getValue = <T>(item: AnyArrItem<T>) => {
  if (isConditionRule(item))
    return item[0] ? item[1] : NO_CONDITIONAL_VALUE_MATCH;
  if (isConditionFn(item)) return item();
  return item;
};

const isNotChangeSymbol = <T>(val: T | NoChangeSymbol): val is T =>
  val !== NO_CONDITIONAL_VALUE_MATCH;

/**
 * If no fallback provided, defaults to null.
 *
 * This implementation:
 * ```
 * conditionalValue<Domain>([
 *   [isPersonal, 'personal],
 *   [isWork, 'work']
 * ])
 * ```
 * ---
 * Is equivalent to:
 * ```
 * if (isPersonal) return 'personal';
 * else if (isWork) return 'work';
 * else return null;
 * ```
 * ---
 * Or, in nested ternary style (which is what this was written to avoid):
 * ```
 * isPersonal ? 'personal' : isWork ? 'work' : null;
 * ```
 */
const conditionalValue: ConditionalValue = <T>(
  conditionsArr: (ConditionRule<T> | ConditionFn<T> | T)[]
): T | null => {
  const matches = toArray(
    conditionsArr,
    compose(map(getValue), filter(isNotChangeSymbol))
  );
  return hasLength(matches) ? matches[0] : null;
};

export default conditionalValue;
