import { CONTENT_TYPES } from './consts';

export type ContentTypes = typeof CONTENT_TYPES[number];

export type DebugOpts = {
  enabled?: boolean;
  logToPersistedLog?: boolean;
  includeVerbose?: boolean;
};

export type FetchOpts = Pick<Request, 'url' | 'headers' | 'method'> & {
  contentType: ContentTypes;
  fetchFnKey: FunctionKeys<Request>;
  body?: string | AnyObj;
  debug?: DebugOpts;
};

export type ParsedFetchOpts = MakeSomeReqd<FetchOpts, 'debug'>;

/**
 * When implemented, the fetch fn and method are known, and content type
 * has a default value
 */
export type FetchImplementationOpts = Omit<
  FetchOpts,
  'fetchFnKey' | 'method' | 'contentType'
> &
  Partial<Pick<FetchOpts, 'contentType'>>;
