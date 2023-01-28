import PersistedLog from '../io/PersistedLog';
import { tidyLog } from '../string';
import { DebugOpts, ParsedFetchOpts } from './types';

export const DEFAULT_DEBUG_OPTS: DebugOpts = {
  enabled: false,
  logToPersistedLog: false,
  includeVerbose: false,
};

type FetchDebugOpts = {
  message: any;
  /** Is the message being logged verbose? */
  isVerbose?: boolean;
  parsedOpts: ParsedFetchOpts;
};
export const fetchDebug = ({
  message,
  isVerbose = false,
  parsedOpts: {
    debug: { enabled, logToPersistedLog, includeVerbose },
  },
}: FetchDebugOpts) => {
  if (!enabled) return;
  if (isVerbose && !includeVerbose) return;
  return logToPersistedLog ? PersistedLog.log(message) : tidyLog(message);
};
