import { ONE_SECOND } from './date';
import { wait } from './flow';

type Opts<T> = {
  batchOperation: (entities: T[]) => MaybePromise<any>;
  initQueue?: T[];
  interval?: number;
  maxEntitiesPerOperation?: number;
  debug?: boolean;
};

/**
 * This structure is useful for spacing out performance-intensive background
 * work, and also for batching operations.
 *
 * For example, it was built to support logging data to a persisted file. In
 * this scenario, there could be tens or hundreds of such requests made very
 * quickly. This queue structure enables pushing immediately to the queue, then
 * waiting some interval before taking action.
 *
 * The consumer specifies what (primitive) data type makes up the actual queue,
 * and what batch action to perform on the queue.
 */
class ThrottledBatchQueue<T extends PrimitiveType> {
  private queue: Set<T>;
  private isRunning = false;
  private isPaused = false;
  private interval: number;
  /** When performing batch operations on the queue, only take a slice of this
   * length, if provided. */
  private maxEntitiesPerOperation: number | null;
  private batchOperation: (entities: T[]) => MaybePromise<any>;
  private debug: boolean;

  constructor({
    batchOperation,
    initQueue = [],
    interval = ONE_SECOND * 5,
    maxEntitiesPerOperation,
    debug = false,
  }: Opts<T>) {
    this.queue = new Set(initQueue);
    this.interval = interval;
    this.maxEntitiesPerOperation = maxEntitiesPerOperation || null;
    this.batchOperation = batchOperation;
    this.debug = debug;
  }

  private debugLog(msg: any) {
    if (this.debug) console.log(msg);
  }

  /** Get a portion of the queue back as an array. If `maxEntitiesPerOperation`
   * is null, it will return the whole queue. This will also update the queue to
   * remove the elements that are returned, similar to `Array.shift` */
  private shiftQueue() {
    const clone = [...this.queue];
    if (!this.maxEntitiesPerOperation) {
      this.queue.clear();
      return clone;
    }
    const batch = clone.splice(0, this.maxEntitiesPerOperation);
    this.queue = new Set(clone);
    return batch;
  }

  private async run() {
    if (this.isRunning) throw new Error('Queue already running');
    if (this.isPaused) throw new Error('Run called while paused');
    if (!this.queue.size) {
      this.debugLog('Nothing left in queue to run.');
      return;
    }
    this.isRunning = true;
    const batchEntities = this.shiftQueue();
    this.debugLog(
      `Running batch operation on ${batchEntities.length} entities, ${this.queue.size} remaining.`
    );
    if (this.queue.size) this.snoozeRun();
    if (batchEntities.length) await this.batchOperation(batchEntities);
    // This smells, but I want to ensure that snoozeRun gets called ASAP, but
    // also make sure that if the queue gets added to during the batch
    // operation, that those entities get detected.
    if (this.queue.size) this.snoozeRun();
    this.isRunning = false;
  }

  private snoozeRun() {
    if (this.isPaused) {
      this.debugLog('Snooze run called while queue is paused.');
      return;
    }
    wait(this.interval, () => {
      if (!this.queue.size) {
        this.debugLog(
          'After snoozing, there is nothing left in the queue to run.'
        );
        return;
      }
      this.isRunning ? this.snoozeRun() : this.run();
    });
  }

  push(...entities: T[]) {
    const newEntities = entities.filter(e => !this.queue.has(e));
    if (!newEntities.length) {
      this.debugLog('Push: all of the pushed entities are in the queue.');
      return;
    }
    newEntities.forEach(entity => this.queue.add(entity));
    // If the queue is already running, it should
    if (!this.isRunning) this.run();
  }

  /** Halts queue execution after any currently running operations complete */
  pause() {
    this.debugLog('Paused the queue');
    this.isPaused = true;
  }

  resume() {
    this.debugLog('Resumed the queue');
    this.isPaused = false;
    if (!this.isRunning) this.snoozeRun();
  }
}

export default ThrottledBatchQueue;
