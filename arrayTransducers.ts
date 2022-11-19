import { getSegmentConsts, getSegmentReducer, SegmentRules } from './common';

type Reducer<Result, Input> = (
  result: Result,
  input: Input,
  index: number
) => Result;

type ArrCallbackNoArr<Val, Result> = (value: Val, index: number) => Result;

type Joiner<Result, Item> = Reducer<Result, Item>;

type Transducer<InitVal = unknown, FinalVal = InitVal> = <Result = unknown>(
  joinData: Joiner<Result, FinalVal>
) => Reducer<Result, InitVal>;

type Compose = {
  /** 1 operator */
  <A, B>(t1: Transducer<A, B>): Transducer<A, B>;
  /** 2 operators */
  <A, B, C>(t1: Transducer<A, B>, t2: Transducer<B, C>): Transducer<A, C>;
  /** 3 operators */
  <A, B, C, D>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>
  ): Transducer<A, D>;
  /** 4 operators */
  <A, B, C, D, E>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>,
    t4: Transducer<D, E>
  ): Transducer<A, E>;
  /** 5 operators */
  <A, B, C, D, E, F>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>,
    t4: Transducer<D, E>,
    t5: Transducer<E, F>
  ): Transducer<A, F>;
  /** 6 operators */
  <A, B, C, D, E, F, G>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>,
    t4: Transducer<D, E>,
    t5: Transducer<E, F>,
    t6: Transducer<F, G>
  ): Transducer<A, G>;

  /** Any number of transducers w/ the same typing */
  <A, B>(...t: Transducer<A, B>[]): Transducer<A, B>;

  /** Unsupported arity! */
  <A, B, C, D, E, F, G>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>,
    t4: Transducer<D, E>,
    t5: Transducer<E, F>,
    t6: Transducer<F, G>,
    ...rest: Transducer[]
  ): Transducer<A, unknown>;
};

//
//
//

export const compose: Compose =
  (...transducers: Transducer[]): Transducer =>
  joinData =>
    transducers.reduceRight(
      (accJoinData, transducer) => transducer(accJoinData),
      joinData
    );

// OPERATORS

export const map =
  <Init, Mapped>(
    mapFn: ArrCallbackNoArr<Init, Mapped>
  ): Transducer<Init, Mapped> =>
  joinData =>
  (result, input, i) =>
    joinData(result, mapFn(input, i), i);

// ts-unused-exports:disable-next-line
export const flatten =
  <UnflattenedAtom>(): Transducer<
    (UnflattenedAtom | UnflattenedAtom[])[],
    UnflattenedAtom[]
  > =>
  joinData =>
  (result, input, i) =>
    joinData(result, input.flat() as UnflattenedAtom[], i);

type Filter = {
  /** Typeguard filter w/ type assertion */
  <Asserted extends Actual, Actual>(
    predicate: Typeguard<Asserted, Actual>
  ): Transducer<Actual, Asserted>;
  /** Boolean filter */
  <T>(predicate: ArrCallbackNoArr<T, any>): Transducer<T>;
};
export const filter: Filter =
  <T>(predicate: ArrCallbackNoArr<T, any>): Transducer<T> =>
  joinData =>
  (result, input, i) =>
    predicate(input, i) ? joinData(result, input, i) : result;

export const tap =
  <T>(callback: ArrCallbackNoArr<T, any>): Transducer<T> =>
  joinData =>
  (result, input, i) => {
    callback(input, i);
    return joinData(result, input, i);
  };

/** Returns only the first `take` elements of the transformed array. This is
 * suboptimal, since it should break early if the limit is reached. */
export const take =
  <T>(take: number): Transducer<T> =>
  joinData =>
  (result, input, i) =>
    i < take ? joinData(result, input, i) : result;

// JOINERS

const joinUnique = <T, U extends PrimitiveType>(
  getCompareVal: MapFn<T, U>
): Joiner<T[], T> => {
  const hasSeen = new Set<U>();
  return (acc, val) => {
    const compareVal = getCompareVal(val);
    if (hasSeen.has(compareVal)) return acc;
    hasSeen.add(compareVal);
    return acc.concat(val);
  };
};

const joinSum = (): Joiner<number, number> => (sum, val) => sum + val;

const joinCount = (): Joiner<number, any> => count => count + 1;

const joinReduce = <Result, Value>(
  reduce: Reducer<Result, Value>
): Joiner<Result, Value> => reduce;

const joinSet =
  <T>(): Joiner<Set<T>, T> =>
  (set, val) =>
    set.add(val);

const joinFind =
  <T>(isMatch: MapFn<T, any>): Joiner<T | undefined, T> =>
  (acc, val) =>
    acc || (isMatch(val) ? val : acc);

const joinConcat =
  <T>(): Joiner<T[], T | T[]> =>
  (acc, val) =>
    acc.concat(val);

const joinFlat =
  <T>(): Joiner<T[], (T | T[])[]> =>
  (acc, val) =>
    acc.concat(val.flat() as T[]);

// EXECUTORS

/** Returns an array resulting from given transformation */
export const toArray = <Init, Final>(
  sourceData: Init[],
  xform: Transducer<Init, Final | Final[]>
) => sourceData.reduce(xform(joinConcat()), []);

export const toUniqueArray = <Init, Final, CompareVal extends PrimitiveType>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  getCompareVal: MapFn<Final, CompareVal> = x => x as unknown as CompareVal
) => sourceData.reduce(xform(joinUnique(getCompareVal)), []);

/** Returns sum of transformed array */
// ts-unused-exports:disable-next-line
export const toSum = <T>(sourceData: T[], xform: Transducer<T, number>) =>
  sourceData.reduce(xform(joinSum()), 0);

/** Returns count of transformed array */
export const toCount = <T>(sourceData: T[], xform: Transducer<T, any>) =>
  sourceData.reduce(xform(joinCount()), 0);

/** Transform the source data with a given transducer (`xform`), then reduce
 * that into another entity. This will only traverse the array once. */
export const toReduce = <Init, Final, ReduceResult>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  reduce: Reducer<ReduceResult, Final>,
  reduceSeed: ReduceResult
) => sourceData.reduce(xform(joinReduce(reduce)), reduceSeed);

export const toSegmented = <Init, Final, RuleKey extends string>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  segmentRules: SegmentRules<RuleKey, Final>
) =>
  sourceData.reduce(
    xform(getSegmentReducer(segmentRules)),
    getSegmentConsts(segmentRules).seed
  );

export const toSet = <Init, Final extends PrimitiveType>(
  sourceData: Init[],
  xform: Transducer<Init, Final>
) => sourceData.reduce(xform(joinSet()), new Set());

export const toFind = <Init, Final>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  isMatch: MapFn<Final, any>
) => sourceData.reduce(xform(joinFind(isMatch)), undefined);

export const toPromiseAll = <Init, Final extends Promise<any>>(
  sourceData: Init[],
  xform: Transducer<Init, Final>
) => Promise.all(sourceData.reduce(xform(joinConcat()), []));

// ts-unused-exports:disable-next-line
export const toFlat = <Init, Final extends any[]>(
  sourceData: Init[],
  xform: Transducer<Init, Final>
) => sourceData.reduce(xform(joinFlat()), []);
