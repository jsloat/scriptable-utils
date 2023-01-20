import { Config, setConfig } from './configRegister';
import { haltTintRequests } from './sfSymbols/preloadList';
import { stopAllHeaderMenuTimers } from './UITable/Row/templates/_HeaderMenu/stateInterface';

/** Tasks to be done before starting a script. */
export const startup = (config: Partial<Config>) => {
  setConfig(config);
};

/** Tasks to be done when exiting a script. */
export const cleanup = () => {
  stopAllHeaderMenuTimers();
  haltTintRequests();
};
