/**
 * There are instances (for example, when private data is required) when the
 * user should provide their own implementations of functions that are required
 * for this repository. In that case, the user must register the implementation
 * using this file before they need to use the functions that depend on them.
 */

export namespace ScreenHeightMeasurements {
  export type Mode = 'fullscreen' | 'notFullscreen';
  export type Orientation = 'portrait' | 'landscape';
  export type Record = {
    [deviceKey: string]: {
      [mode in Mode]: { [orientation in Orientation]: number };
    };
  };
}

type Registry = {
  getCalendarTitles: NoParamFn<Record<'PERSONAL' | 'WORK', string>>;
  getScreenHeightMeasurements: NoParamFn<ScreenHeightMeasurements.Record>;
};

//

const getPlaceholderImplementation = (fnName: string) => () => {
  throw new Error(
    `You must register the "${fnName}" in your implementation before using functions that depend on it.`
  );
};

const registry: Registry = {
  getCalendarTitles: getPlaceholderImplementation('getCalendarTitles'),
  getScreenHeightMeasurements: () => ({
    [Device.model()]: {
      fullscreen: {
        landscape: Device.screenSize().height,
        portrait: Device.screenSize().height,
      },
      notFullscreen: {
        landscape: Device.screenSize().height,
        portrait: Device.screenSize().height,
      },
    },
  }),
};

export const registerService = <N extends keyof Registry>(
  name: N,
  val: Registry[N]
) => (registry[name] = val);

//

// NB! Must export a function that fetches the current registry value, else
// won't get latest. I.e. this will not work:
// `getCalendarTitles = registry.getCalendarTitles`
export const getCalendarTitles = () => registry.getCalendarTitles();
export const getScreenHeightMeasurements = () =>
  registry.getScreenHeightMeasurements();
