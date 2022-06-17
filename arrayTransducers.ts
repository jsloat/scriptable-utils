import sortObjects from './sortObjects';

type Reducer<Result, Input> = (result: Result, input: Input) => Result;

type Transducer<InitVal = unknown, FinalVal = InitVal> = <Result = unknown>(
  joinData: Reducer<Result, FinalVal>
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

  /** Any number of transducers w/ the same typing */
  <A, B>(...t: Transducer<A, B>[]): Transducer<A, B>;
  /** 6+ operators, untyped! */
  <A, B, C, D, E, F>(
    t1: Transducer<A, B>,
    t2: Transducer<B, C>,
    t3: Transducer<C, D>,
    t4: Transducer<D, E>,
    t5: Transducer<E, F>,
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
      (result, transducer) => transducer(result),
      joinData
    );

// OPERATORS

export const map =
  <Init, Mapped>(mapFn: MapFn<Init, Mapped>): Transducer<Init, Mapped> =>
  joinData =>
  (result, input) =>
    joinData(result, mapFn(input));

export const filter =
  <T>(predicate: MapFn<T, any>): Transducer<T> =>
  joinData =>
  (result, input) =>
    predicate(input) ? joinData(result, input) : result;

export const excludeFalsy =
  <T>(): Transducer<T | Falsy, T> =>
  joinData =>
  (result, input) =>
    input ? joinData(result, input as T) : result;

export const tap =
  <T>(callback: (val: T) => any): Transducer<T> =>
  joinData =>
  (result, input) => {
    callback(input);
    return joinData(result, input);
  };

export const identity =
  <T>(): Transducer<T> =>
  () =>
  result =>
    result;

// EXECUTORS

/** Returns an array resulting from given transformation */
export const toArray = <Init, Final>(
  sourceData: Init[],
  xform: Transducer<Init, Final>
) =>
  sourceData.reduce(
    xform((acc: Final[], val) => acc.concat(val)),
    []
  );

/** Returns only the first `take` elements of the transformed array. This is
 * suboptimal, since it should break early if the limit is reached. */
export const toArrayTake = <Init, Final>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  take: number
) =>
  sourceData.reduce(
    xform((acc: Final[], val) => (acc.length === take ? acc : acc.concat(val))),
    []
  );

/** Returns sum of transformed array */
export const toSum = <T>(sourceData: T[], xform: Transducer<T, number>) =>
  sourceData.reduce(
    xform((sum: number, val) => sum + val),
    0
  );

/** Returns count of transformed array */
export const toCount = <T>(sourceData: T[], xform: Transducer<T, any>) =>
  sourceData.reduce(
    xform((count: number) => count + 1),
    0
  );

/** Transform the source data with a given transducer (`xform`), then reduce
 * that into another entity. This will only traverse the array once. */
export const toReduce = <Init, Final, ReduceResult>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  reduce: Reducer<ReduceResult, Final>,
  reduceSeed: ReduceResult
) =>
  sourceData.reduce(
    xform((result: ReduceResult, val) => reduce(result, val)),
    reduceSeed
  );

/** This is really just shorthand for combining transducers and sorting. The
 * array will be traversed once for the transducer, then the result sorted. */
export const toSort = <Init, Final>(
  sourceData: Init[],
  xform: Transducer<Init, Final>,
  getCompareVal: (entity: Final) => any,
  sortOrder?: SortOrder
) => sortObjects(toArray(sourceData, xform), getCompareVal, sortOrder);
