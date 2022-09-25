type DataTypeBase = AnyObj;

type UpdateCallback<D extends DataTypeBase> = (newAttr: Partial<D>) => any;
type CallbackWithOpts<D extends DataTypeBase> = {
  id: string;
  callback: UpdateCallback<D>;
};

type RegisterUpdateCallbackOpts<D extends DataTypeBase> = {
  callback: UpdateCallback<D>;
  /** Optionally provide a unique string ID to ensure the same callback is not
   * added multiple times. */
  callbackId: string;
  /** If ID provided, by default existing callback w/ that ID will be
   * overwritten. If set to false, first callback set will remain. */
  overwriteExistingCallback?: boolean;
};

type StreamConstructorOpts<DataType extends DataTypeBase> = {
  defaultState: DataType;
  showStreamDataUpdateDebug?: boolean;
};

export class Stream<DataType extends DataTypeBase> {
  private showStreamDataUpdateDebug: boolean;
  private data: DataType;
  private updateCallbacks: CallbackWithOpts<DataType>[] = [];

  constructor({
    defaultState,
    showStreamDataUpdateDebug = false,
  }: StreamConstructorOpts<DataType>) {
    this.showStreamDataUpdateDebug = showStreamDataUpdateDebug;
    this.data = defaultState;
    this.updateCallbacks = [];
  }

  registerUpdateCallback({
    callback,
    callbackId,
    overwriteExistingCallback = true,
  }: RegisterUpdateCallbackOpts<DataType>): StreamCallback {
    const callbackIdAlreadyRegistered = this.updateCallbacks.some(
      ({ id }) => id === callbackId
    );
    const overwriteDisallowed =
      callbackIdAlreadyRegistered && !overwriteExistingCallback;

    if (!overwriteDisallowed)
      this.updateCallbacks = this.updateCallbacks
        .filter(({ id }) => id !== callbackId)
        .concat({ callback, id: callbackId });

    return { remove: () => this.unregisterUpdateCallback(callbackId) };
  }

  unregisterUpdateCallback(callbackId: string) {
    this.updateCallbacks = this.updateCallbacks.filter(
      ({ id }) => id !== callbackId
    );
  }

  /** Run with singleValObj if only updating one value */
  private async runCallbacks(singleValObj: AnyObj | null = null) {
    this.updateCallbacks.forEach(({ callback, id }) => {
      if (this.showStreamDataUpdateDebug)
        console.log(`Running stream update callback with ID "${id}"`);
      callback((singleValObj || this.data) as unknown as Partial<DataType>);
    });
  }

  /** Reduce stream data */
  async updateData(
    reducer: Identity<DataType>,
    { suppressChangeTrigger = false } = {}
  ) {
    if (!this.data) {
      throw new Error('Attempting to update stream data while uninitialized');
    }
    this.data = reducer(this.data);
    if (!suppressChangeTrigger) await this.runCallbacks();
  }

  /** Set full stream data */
  setData(data: DataType, { suppressChangeTrigger = false } = {}) {
    return this.updateData(() => data, { suppressChangeTrigger });
  }

  /** Update a single attribute of stream data */
  updateAttr<K extends keyof DataType>(
    key: K,
    val: DataType[K],
    { suppressChangeTrigger = false } = {}
  ) {
    return this.updateData(data => ({ ...data, [key]: val }), {
      suppressChangeTrigger,
    });
  }

  /** Used to trigger callbacks when no change has occurred */
  triggerChange() {
    return this.runCallbacks();
  }

  getData() {
    if (!this.data)
      throw new Error(
        'Attempting to get stream data before initializing stream.'
      );
    return this.data;
  }

  /** This is dangerous because a stream is assumed to never be empty. This
   * should only be used before exiting the script, or if you know that you
   * won't use this stream again before the script ends. */
  dangerouslyClearData() {
    // @ts-ignore
    this.data = {};
  }
}

export type StreamDataType<S> = S extends Stream<infer D> ? D : never;

/**
 * Subscribe a stream to another stream.
 *
 * The 2 streams involved:
 *  - dependent$: the stream that subscribes to changes in another stream.
 *  - source$: the stream whose changes trigger updates in dependent$
 *
 * The stateReducer function takes the latest state of both streams and
 * reduces it into dependent$ state. This allows dependent$ to incorporate
 * changes from the source$ into its own state.
 *
 * If stateReducer returns null, the dependent$ state will not be updated.
 * This provides a mechanism for dependent$ to decide whether or not to update
 * based on the changes in source$.
 *
 * This action is triggered whenever a change occurs in source$
 *
 * If no stateReducer argument passed, don't change state on reload.
 *
 * Returns an object that allows you to unsubscribe.
 */
// ts-unused-exports:disable-next-line
export const subscribe = <
  DependentState extends DataTypeBase,
  SourceState extends DataTypeBase
>(
  subscriptionName: string,
  dependent$: Stream<DependentState>,
  source$: Stream<SourceState>,
  stateReducer: (
    latestDependentState: DependentState,
    latestSourceState: SourceState
  ) => DependentState | null = state => state
) => {
  const callbackId = subscriptionName;
  source$.registerUpdateCallback({
    callbackId,
    callback: async () => {
      const latestDependentData = dependent$.getData();
      const latestSourceData = source$.getData();
      const reducedData = stateReducer(latestDependentData, latestSourceData);
      // If the reducer returns null, no update should occur
      if (reducedData) await dependent$.setData(reducedData);
    },
  });
  return () => source$.unregisterUpdateCallback(callbackId);
};

/** Use this function to get subscribe & unsubscribe functions for easy cleanup. */
export const getSubscribers = <
  DependentState extends DataTypeBase,
  SourceState extends DataTypeBase
>(
  subscriptionName: string,
  dependent$: Stream<DependentState>,
  source$: Stream<SourceState>,
  stateReducer: (
    latestDependentState: DependentState,
    latestSourceState: SourceState
  ) => DependentState | null = state => state
) => ({
  subscribe: () => {
    subscribe(subscriptionName, dependent$, source$, stateReducer);
  },
  unsubscribe: () => source$.unregisterUpdateCallback(subscriptionName),
});

type CombineStreams = <StreamDict extends Record<string, Stream<any>>>(
  streamDict: StreamDict,
  name: string
) => Stream<{ [key in keyof StreamDict]: StreamDataType<StreamDict[key]> }>;
/**
 * Create a new stream that combines the data of multiple streams. Combined
 * stream state data is namespaced as per the streamDict passed in.
 *
 * The streams must be initialized at the time of combining, or this will fail.
 *
 * The returned stream will update whwnever its combined streams do.
 */
export const combineStreams: CombineStreams = (streamDict, name) => {
  const defaultState = Object.entries(streamDict).reduce(
    (accState, [namespace, $]) => ({ ...accState, [namespace]: $.getData() }),
    {} as any
  );
  const combined$ = new Stream({ defaultState });
  Object.entries(streamDict).forEach(([namespace, $]) =>
    $.registerUpdateCallback({
      callbackId: `Combined stream: ${name}/${namespace}`,
      callback: () => {
        const latestCombinedState = combined$.getData();
        const latestSourceState = $.getData();
        combined$.setData({
          ...latestCombinedState,
          [namespace]: latestSourceState,
        });
      },
    })
  );
  return combined$;
};

/** Call this to create a reducer-getter generator for the given type. The
 * reducer-getter generator can then be used to create functions that take some
 * arguments and return a reducer for the given entity type. */
export const makeReducerGetter =
  <T>() =>
  <A extends any[]>(getUpdatedVal: (currVal: T, ...args: A) => T) =>
  (...args: A): Identity<T> =>
  currVal =>
    getUpdatedVal(currVal, ...args);
