import { isDate, isNullish, isNumber, isString } from './common';

type Compare<T> = (
  a: T | null | undefined,
  b: T | null | undefined,
  sortOrder: SortOrder
) => number;

export const RAISE_A = -1;
export const RAISE_B = 1;
export const NO_CHANGE = 0;

/** Generates a sorter based on the `shouldRaise` predicates passed in.
 * Predicates are evaluated in order. If no predicates match either of the
 * elements, NO_CHANGE is returned. */
export const getSimpleSorter =
  <T>(...shouldRaisePreds: Predicate<T>[]): ((a: T, b: T) => number) =>
  (a, b) => {
    for (const shouldRaise of shouldRaisePreds) {
      if (shouldRaise(a) && !shouldRaise(b)) return RAISE_A;
      if (shouldRaise(b) && !shouldRaise(a)) return RAISE_B;
    }
    return NO_CHANGE;
  };

// A non-nullish compare value should always be before a nullish one, regardless of sort order.
const getNullishCompareReturn = getSimpleSorter<any>(val => !isNullish(val));

const isNullishOr = (typeguard: (val: any) => boolean) => (val: any) =>
  isNullish(val) || typeguard(val);

const compareString: Compare<string> = (a, b, sortOrder) => {
  if (isNullish(a) || isNullish(b)) return getNullishCompareReturn(a, b);
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  switch (sortOrder) {
    case 'ASC':
      return (
        (lowerA < lowerB && RAISE_A) ||
        (lowerA > lowerB && RAISE_B) ||
        NO_CHANGE
      );
    case 'DESC':
      return (
        (lowerA > lowerB && RAISE_A) ||
        (lowerA < lowerB && RAISE_B) ||
        NO_CHANGE
      );
  }
};

const compareNumber: Compare<number> = (a, b, sortOrder) => {
  if (isNullish(a) || isNullish(b)) return getNullishCompareReturn(a, b);
  else return sortOrder === 'ASC' ? a - b : b - a;
};

const compareDate: Compare<Date> = (a, b, sortOrder) => {
  if (isNullish(a) || isNullish(b)) return getNullishCompareReturn(a, b);
  else
    return sortOrder === 'ASC'
      ? a.getTime() - b.getTime()
      : b.getTime() - a.getTime();
};

export default <EntityType>(
  arr: EntityType[],
  getCompareVal: (e: EntityType) => any = e => e,
  sortOrder: SortOrder = 'ASC'
) => {
  try {
    const allCompareVals = arr.map(getCompareVal);
    const getTypedCompareVal = <T>(e: EntityType) => getCompareVal(e) as T;

    if (allCompareVals.every(isNullishOr(isString))) {
      return arr
        .slice(0)
        .sort((a, b) =>
          compareString(
            getTypedCompareVal<string>(a),
            getTypedCompareVal<string>(b),
            sortOrder
          )
        );
    }

    if (allCompareVals.every(isNullishOr(isDate))) {
      return arr
        .slice(0)
        .sort((a, b) =>
          compareDate(
            getTypedCompareVal<Date>(a),
            getTypedCompareVal<Date>(b),
            sortOrder
          )
        );
    }

    if (allCompareVals.every(isNullishOr(isNumber))) {
      return arr
        .slice(0)
        .sort((a, b) =>
          compareNumber(
            getTypedCompareVal<number>(a),
            getTypedCompareVal<number>(b),
            sortOrder
          )
        );
    }

    throw new Error(
      'Error in sortObjects: Unsupported sort type, or inconsistent types'
    );
  } catch (e) {
    console.warn(e);
    throw new Error(`Error in sortObjects: ${e}`);
  }
};
