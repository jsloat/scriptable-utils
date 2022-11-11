// import { alertAndLogError } from '../errorHandling';
// import persisted, { Persisted } from '../io/persisted';
// import RepeatingTimer from '../RepeatingTimer';
// import Stream from './Stream';

// type NestedDataShape<T = any> = { data: T | null };

// type LoadData<S, P> = (currCacheData: S | null) => MaybePromise<{
//   cachedData: S;
//   persistedData?: P extends void ? never : P;
// }>;

// type Opts<StreamData, PersistedData> = {
//   loadData: LoadData<StreamData, PersistedData>;
//   autoRefreshInterval?: number;
//   /** If provided, stop attempting to load data after n failures */
//   maxRetries?: number;
//   /** If true, don't throw an error on data load failure. */
//   failSilently?: boolean;
// };

// /** Used to create a caching mechanism for data that must be fetched. */
// export class StreamCache<StreamData, PersistedData> {
//   id: ID;
//   protected loadData: LoadData<StreamData, PersistedData>;
//   protected autoRefreshInterval: number | null;
//   protected refreshTimer: RepeatingTimer | null;
//   protected io: Persisted<NestedDataShape<PersistedData>>;
//   protected cache$: Stream<NestedDataShape<StreamData>>;
//   protected isPersistedDataLoaded: boolean;
//   protected maxLoadDataErrors: number | null;
//   protected loadFailureCount: number;
//   protected failSilently: boolean;

//   constructor({
//     loadData,
//     autoRefreshInterval,
//     maxRetries,
//     failSilently = false,
//   }: Opts<StreamData, PersistedData>) {
//     this.id = UUID.string();
//     this.loadData = loadData;
//     this.autoRefreshInterval = autoRefreshInterval || null;
//     this.refreshTimer = this.autoRefreshInterval
//       ? new RepeatingTimer({ interval: this.autoRefreshInterval })
//       : null;
//     this.io = persisted<NestedDataShape<PersistedData>>({
//       filename: UUID.string(),
//       defaultData: { data: null },
//       disableCache: true,
//       prettify: false,
//     });
//     this.cache$ = new Stream<NestedDataShape<StreamData>>({
//       name: `StreamCache ${this.id}`,
//       defaultState: { data: null },
//     });
//     this.isPersistedDataLoaded = false;
//     this.maxLoadDataErrors = maxRetries || null;
//     this.loadFailureCount = 0;
//     this.failSilently = failSilently;
//   }

//   get isLoaded() {
//     const isStreamDataLoaded = Boolean(this.cache$.getData().data);
//     const hasNoPersistedOrIsLoaded = !this.io || this.isPersistedDataLoaded;
//     return isStreamDataLoaded && hasNoPersistedOrIsLoaded;
//   }

//   get $() {
//     return this.cache$;
//   }

//   protected async loadAllData({ resetTimer }: { resetTimer: boolean }) {
//     const isOverLimit =
//       this.maxLoadDataErrors && this.loadFailureCount >= this.maxLoadDataErrors;
//     if (isOverLimit) return;
//     try {
//       const { cachedData, persistedData } = await this.loadData(
//         this.cache$.getData().data
//       );
//       this.cache$.setData({ data: cachedData });
//       if (!persistedData) return;
//       await this.io.write({ data: { data: persistedData } });
//       // Restart the clock for the current repeat interval
//       if (this.refreshTimer?.isRunning && resetTimer) {
//         this.refreshTimer.resetCurrent();
//       }
//     } catch (e) {
//       this.loadFailureCount++;
//       if (!this.failSilently) {
//         alertAndLogError(e, `StreamCache (${this.loadFailureCount})`);
//       }
//     }
//   }

//   private initTimer() {
//     if (!this.refreshTimer) return;
//     this.refreshTimer.setOnFire(() => this.loadAllData({ resetTimer: false }));
//     this.refreshTimer.start();
//   }

//   async init() {
//     if (this.isLoaded) return;
//     await this.loadAllData({ resetTimer: false });
//     this.initTimer();
//   }

//   async refresh() {
//     await this.loadAllData({ resetTimer: true });
//   }

//   getStreamData() {
//     return this.cache$.getData();
//   }

//   getPersistedData() {
//     return this.io.getData({ useCache: false });
//   }

//   cleanup() {
//     this.cache$.dangerouslyClearData();
//     this.io?.deleteFile();
//   }
// }

// //

// type AnyCache = StreamCache<any, any>;

// let registeredStreamCaches: AnyCache[] = [];

// /** Use this function to get StreamCache instances so they get registered for
//  * easier bulk manipulation */
// export const getStreamCache = <S, P = void>(opts: Opts<S, P>) => {
//   const cache = new StreamCache<S, P>(opts);
//   registeredStreamCaches.push(cache);
//   return cache;
// };

// const killStreamCache = (cache: AnyCache) => {
//   cache.cleanup();
//   registeredStreamCaches = registeredStreamCaches.filter(
//     c => c.id !== cache.id
//   );
// };

// export const killAllStreamCaches = () =>
//   registeredStreamCaches.forEach(killStreamCache);
