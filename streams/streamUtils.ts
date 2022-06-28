import { composeIdentities } from '../flow';
import { OK } from '../input/Confirm';

type DataTypeBase = AnyObj;

type UpdateCallback<D extends DataTypeBase> = (newAttr: Partial<D>) => any;
type CallbackWithOpts<D> = {
  id: string;
  callback: UpdateCallback<D>;
  onlyTheseKeys: (keyof D)[];
};

type RegisterUpdateCallbackOpts<D extends DataTypeBase> = {
  callback: UpdateCallback<D>;
  callbackId: string;
  overwriteExistingCallback?: boolean;
  onlyTheseKeys?: (keyof D)[];
};

type StreamConstructorOpts<DataType extends DataTypeBase> = {
  defaultState?: DataType;
  showStreamDataUpdateDebug?: boolean;
};

type CallbackExecutionCount = Record<string, number>;

/** How often to poll check for number of callbacks */
const CALLBACK_TIMER_INTERVAL = 1000 * 30;
/** If a single callback is called more than this number per interval, a warning
 * is triggered */
const CALLBACK_WARNING_THRESHOLD = 20;

const registeredCallbackTimers: Timer[] = [];
/** Stops repeating timers for all active streams. The timers are used to poll
 * for overactive streams. Since there's no clear end-of-life for streams, this
 * function ensures that the timers are all cleaned up when exiting the script.
 * */
export const stopStreamTimers = () =>
  registeredCallbackTimers.forEach(t => t.invalidate());

const alertOveractiveCallbacks = (
  callbackExecutionCount: CallbackExecutionCount
) =>
  Object.entries(callbackExecutionCount).forEach(([id, count]) => {
    if (count > CALLBACK_WARNING_THRESHOLD) {
      OK('Overactive callback warning', {
        message: `Callback "${id}" has run over ${CALLBACK_WARNING_THRESHOLD} times in the last ${CALLBACK_TIMER_INTERVAL} ms.`,
      });
    }
  });

const getBaseOveractiveCallbackTimer = () => {
  const t = new Timer();
  t.timeInterval = CALLBACK_TIMER_INTERVAL;
  t.repeats = true;
  return t;
};

export class Stream<DataType extends DataTypeBase> {
  showStreamDataUpdateDebug: boolean;
  data: DataType | null;
  updateCallbacks: CallbackWithOpts<DataType>[] = [];
  /** Used to alert user to high volume of callbacks triggered */
  callbackExecutionCount: CallbackExecutionCount = {};
  /** Used to periodically check if callbacks have been called too many time
   * within a period. */
  overactiveCallbackTimer: Timer;

  constructor({
    defaultState,
    showStreamDataUpdateDebug = false,
  }: StreamConstructorOpts<DataType> = {}) {
    this.showStreamDataUpdateDebug = showStreamDataUpdateDebug;
    this.data = defaultState || null;
    this.updateCallbacks = [];
    this.overactiveCallbackTimer = getBaseOveractiveCallbackTimer();
    this.overactiveCallbackTimer.schedule(() => {
      alertOveractiveCallbacks(this.callbackExecutionCount);
      this.callbackExecutionCount = {};
    });
    registeredCallbackTimers.push(this.overactiveCallbackTimer);
  }

  init(initData: DataType, force = false) {
    if (!this.data || force) this.data = initData;
  }

  /**
   * @param callbackId Optionally provide a unique string ID to ensure the same callback is not added multiple times.
   * @param overwriteExistingCallback If ID provided, by default existing callback w/ that ID will be overwritten. If set to false, first callback set will remain.
   * @param onlyTheseKeys Only call the callback if the provided keys of DataType are updated
   */
  registerUpdateCallback({
    callback,
    callbackId,
    overwriteExistingCallback = true,
    onlyTheseKeys = [],
  }: RegisterUpdateCallbackOpts<DataType>): StreamCallback {
    const callbackIdAlreadyRegistered = this.updateCallbacks.some(
      ({ id }) => id === callbackId
    );
    const overwriteDisallowed =
      callbackIdAlreadyRegistered && !overwriteExistingCallback;

    if (!overwriteDisallowed)
      this.updateCallbacks = this.updateCallbacks
        .filter(({ id }) => id !== callbackId)
        .concat({ callback, id: callbackId, onlyTheseKeys });

    return { remove: () => this.unregisterUpdateCallback(callbackId) };
  }

  unregisterUpdateCallback(callbackId: string) {
    this.updateCallbacks = this.updateCallbacks.filter(
      ({ id }) => id !== callbackId
    );
  }

  /** Run with singleValObj if only updating one value */
  private async runCallbacks(singleValObj: AnyObj | null = null) {
    const key = singleValObj && Object.keys(singleValObj)[0];
    this.updateCallbacks.forEach(({ callback, id, onlyTheseKeys }) => {
      const isNotWatchedKey =
        onlyTheseKeys.length && (!key || (key && !onlyTheseKeys.includes(key)));
      if (isNotWatchedKey) return;
      if (this.showStreamDataUpdateDebug)
        console.log(`Running stream update callback with ID "${id}"`);
      callback((singleValObj || this.data) as unknown as Partial<DataType>);
      this.callbackExecutionCount[id] =
        (this.callbackExecutionCount[id] ?? 0) + 1;
    });
  }

  /** Set stream data. This is the only way to trigger an update callback when
   * setting the entire object */
  async setData(data: DataType, { suppressChangeTrigger = false } = {}) {
    if (!this.isInitialized) this.init(data);
    else this.data = data;
    if (!suppressChangeTrigger) await this.runCallbacks();
  }

  async updateData(...reducers: Identity<DataType>[]) {
    if (!this.data) {
      throw new Error('Attempting to update stream data while uninitialized');
    }
    this.data = composeIdentities(...reducers)(this.data);
    await this.runCallbacks();
  }

  async updateAttr<K extends keyof DataType>(
    key: K,
    val: DataType[K],
    { suppressChangeTrigger = false } = {}
  ) {
    if (!this.data)
      throw new Error(
        `Attempting to set stream attribute ${key} before initializing stream.`
      );
    this.data[key] = val;
    if (!suppressChangeTrigger) await this.runCallbacks({ [key]: val });
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

  clearData({ runCallbacks = true } = {}) {
    // @ts-ignore
    delete this.data;
    this.data = null;
    runCallbacks && this.runCallbacks();
  }

  get isInitialized() {
    return Boolean(this.data);
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
  return source$.registerUpdateCallback({
    callbackId,
    callback: async () => {
      const latestDependentData = dependent$.getData();
      const latestSourceData = source$.getData();
      const reducedData = stateReducer(latestDependentData, latestSourceData);
      // If the reducer returns null, no update should occur
      if (reducedData) await dependent$.setData(reducedData);
    },
  });
};

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
