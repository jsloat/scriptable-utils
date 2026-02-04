import ThrottledBatchQueue from '../ThrottledBatchQueue';
import { AnyObj, MaybePromise, StreamCallback } from '../types/utilTypes';
import { StreamConstructorOpts, StreamData, StreamReducer } from './types';

type UpdateCallback<D extends AnyObj> = (
  previousData: StreamData<D>,
  updatedData: StreamData<D>
) => MaybePromise<any>;

type RegisterUpdateCallbackOpts<D extends AnyObj> = {
  callback: UpdateCallback<D>;
  /** Optionally provide a unique string ID to ensure the same callback is not
   * added multiple times. */
  callbackId: string;
  /** If ID provided, by default existing callback w/ that ID will be
   * overwritten. If set to false, first callback set will remain. */
  overwriteExistingCallback?: boolean;
};

type UpdateDataPayload<T extends AnyObj> = {
  reducer: StreamReducer<T>;
  suppressChangeTrigger: boolean;
};

type UpdateDataOpts = { suppressChangeTrigger?: boolean };

export default class Stream<DataType extends AnyObj> {
  private name: string;
  private showStreamDataUpdateDebug: boolean;
  private data: DataType;
  private updateCallbacks = new Map<string, UpdateCallback<DataType>>();
  // Queue to sequentially update data
  private updateQueue: ThrottledBatchQueue<UpdateDataPayload<DataType>>;

  constructor({
    defaultState,
    name,
    showStreamDataUpdateDebug = false,
  }: StreamConstructorOpts<DataType>) {
    this.showStreamDataUpdateDebug = showStreamDataUpdateDebug;
    this.data = defaultState;
    this.name = name;

    this.updateQueue = new ThrottledBatchQueue({
      interval: 0,
      maxEntitiesPerOperation: 1,
      batchOperation: ([{ reducer, suppressChangeTrigger }]) =>
        this.applyUpdate(reducer, suppressChangeTrigger),
    });
  }

  registerUpdateCallback({
    callback,
    callbackId,
    overwriteExistingCallback = true,
  }: RegisterUpdateCallbackOpts<DataType>): StreamCallback {
    const callbackIdAlreadyRegistered = this.updateCallbacks.has(callbackId);
    const overwriteDisallowed =
      callbackIdAlreadyRegistered && !overwriteExistingCallback;

    if (!overwriteDisallowed) this.updateCallbacks.set(callbackId, callback);

    return { remove: () => this.unregisterUpdateCallback(callbackId) };
  }

  unregisterUpdateCallback(callbackId: string) {
    this.updateCallbacks.delete(callbackId);
  }

  private async runCallbacks(
    previousData: StreamData<DataType>,
    updatedData: StreamData<DataType>
  ) {
    for (const [id, callback] of this.updateCallbacks.entries()) {
      if (this.showStreamDataUpdateDebug)
        // eslint-disable-next-line no-console
        console.log(
          `Running stream "${this.name}" update callback with ID "${id}"`
        );
      await callback(previousData, updatedData);
    }
  }

  private async applyUpdate(
    reducer: StreamReducer<DataType>,
    suppressChangeTrigger: boolean
  ) {
    const oldData = { ...this.data };
    const newData = reducer(oldData);
    this.data = newData;
    if (!suppressChangeTrigger) {
      await this.runCallbacks(
        oldData as StreamData<DataType>,
        newData as StreamData<DataType>
      );
    }
  }

  /** Reduce stream data */
  updateData(reducer: StreamReducer<DataType>, opts: UpdateDataOpts = {}) {
    const { suppressChangeTrigger = false } = opts;
    const payload: UpdateDataPayload<DataType> = {
      reducer,
      suppressChangeTrigger,
    };
    this.updateQueue.push(payload);
  }

  /** Apply an update immediately without queuing. */
  async updateDataSync(
    reducer: StreamReducer<DataType>,
    opts: UpdateDataOpts = {}
  ) {
    const { suppressChangeTrigger = false } = opts;
    await this.applyUpdate(reducer, suppressChangeTrigger);
  }

  /** Wait for queued updates to finish processing. */
  async flush() {
    await this.updateQueue.flush();
  }

  /** Set full stream data */
  setData(data: DataType, opts: UpdateDataOpts = {}) {
    const { suppressChangeTrigger = false } = opts;
    return this.updateData(() => data, { suppressChangeTrigger });
  }

  /** Update a single attribute of stream data */
  updateAttr<K extends keyof DataType>(
    key: K,
    val: DataType[K],
    opts: UpdateDataOpts = {}
  ) {
    const { suppressChangeTrigger = false } = opts;
    return this.updateData(data => ({ ...data, [key]: val }), {
      suppressChangeTrigger,
    });
  }

  /** Used to trigger callbacks when no change has occurred */
  async triggerChange() {
    await this.runCallbacks(
      this.data as StreamData<DataType>,
      this.data as StreamData<DataType>
    );
  }

  getData(): StreamData<DataType> {
    return this.data as StreamData<DataType>;
  }

  /** This is dangerous because a stream is assumed to never be empty. This
   * should only be used before exiting the script, or if you know that you
   * won't use this stream again before the script ends. */
  dangerouslyClearData() {
    this.data = {} as DataType;
  }
}
