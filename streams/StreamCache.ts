import { Stream } from '.';
import { alertAndLogError } from '../errorHandling';
import persisted, { Persisted } from '../io/persisted';
import RepeatingTimer from '../RepeatingTimer';

type NestedDataShape<T = any> = { data: T | null };
type LoadData<T> = () => MaybePromise<T>;
type LoadPersistedData<S, P> = (
  streamData: S
) => MaybePromise<NestedDataShape<P>>;

type Opts<StreamData, PersistedData> = {
  loadData: LoadData<StreamData>;
  autoRefreshInterval?: number;
  loadPersistedData?: PersistedData extends void
    ? undefined
    : LoadPersistedData<StreamData, PersistedData>;
  /** If provided, stop attempting to load data after n failures */
  maxRetries?: number;
  /** If true, don't throw an error on data load failure. */
  failSilently?: boolean;
};

/** Used to create a caching mechanism for data that must be fetched. */
class StreamCache<StreamData, PersistedData> {
  id: ID;
  protected loadData: LoadData<StreamData>;
  protected autoRefreshInterval: number | null;
  protected refreshTimer: RepeatingTimer | null;
  protected io: Persisted<NestedDataShape<PersistedData>> | null;
  protected loadPersistedData: LoadPersistedData<
    StreamData,
    PersistedData
  > | null;
  protected cache$: Stream<NestedDataShape<StreamData>>;
  protected isPersistedDataLoaded: boolean;
  protected maxLoadDataErrors: number | null;
  protected loadFailureCount: number;
  protected failSilently: boolean;

  constructor({
    loadData,
    autoRefreshInterval,
    loadPersistedData,
    maxRetries,
    failSilently = false,
  }: Opts<StreamData, PersistedData>) {
    this.id = UUID.string();
    this.loadData = loadData;
    this.autoRefreshInterval = autoRefreshInterval || null;
    this.refreshTimer = this.autoRefreshInterval
      ? new RepeatingTimer({ interval: this.autoRefreshInterval })
      : null;
    this.loadPersistedData = loadPersistedData || null;
    this.io =
      this.loadPersistedData &&
      persisted<NestedDataShape<PersistedData>>({
        filename: UUID.string(),
        defaultData: { data: null },
        disableCache: true,
        prettify: false,
      });
    this.cache$ = new Stream<NestedDataShape<StreamData>>({
      defaultState: { data: null },
    });
    this.isPersistedDataLoaded = false;
    this.maxLoadDataErrors = maxRetries || null;
    this.loadFailureCount = 0;
    this.failSilently = failSilently;
  }

  get isLoaded() {
    const isStreamDataLoaded = Boolean(this.cache$.getData().data);
    const hasNoPersistedOrIsLoaded = !this.io || this.isPersistedDataLoaded;
    return isStreamDataLoaded && hasNoPersistedOrIsLoaded;
  }

  get $() {
    return this.cache$;
  }

  protected async loadAllData({ resetTimer }: { resetTimer: boolean }) {
    if (
      this.maxLoadDataErrors &&
      this.loadFailureCount >= this.maxLoadDataErrors
    ) {
      return;
    }
    try {
      const streamData = await this.loadData();
      this.cache$.setData({ data: streamData });
      if (!(this.loadPersistedData && this.io)) return;
      const persistedData = await this.loadPersistedData(streamData);
      await this.io.write({ data: persistedData });
      // Restart the clock for the current repeat interval
      if (this.refreshTimer?.isRunning && resetTimer) {
        this.refreshTimer.resetCurrent();
      }
    } catch (e) {
      this.loadFailureCount++;
      if (!this.failSilently) {
        alertAndLogError(e, `StreamCache (${this.loadFailureCount})`);
      }
    }
  }

  private initTimer() {
    if (!this.refreshTimer) return;
    this.refreshTimer.setOnFire(() => this.loadAllData({ resetTimer: false }));
    this.refreshTimer.start();
  }

  async init() {
    if (this.isLoaded) return;
    await this.loadAllData({ resetTimer: false });
    this.initTimer();
  }

  async refresh() {
    await this.loadAllData({ resetTimer: true });
  }

  getStreamData() {
    return this.cache$.getData();
  }

  async getPersistedData() {
    if (!this.io) {
      throw new Error('No persisted data to get');
    }
    return await this.io.getData({ useCache: false });
  }

  cleanup() {
    this.cache$.clearData();
    this.io?.deleteFile();
  }
}

//

type AnyCache = StreamCache<any, any>;

let registeredStreamCaches: AnyCache[] = [];

/** Use this function to get StreamCache instances so they get registered for
 * easier bulk manipulation */
export const getStreamCache = <S, P = void>(opts: Opts<S, P>) => {
  const cache = new StreamCache<S, P>(opts);
  registeredStreamCaches.push(cache);
  return cache;
};

const killStreamCache = (cache: AnyCache) => {
  cache.cleanup();
  registeredStreamCaches = registeredStreamCaches.filter(
    c => c.id !== cache.id
  );
};

export const killAllStreamCaches = () =>
  registeredStreamCaches.forEach(killStreamCache);
