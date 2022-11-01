import { getType } from './common';
import { force } from './flow';

/** This supports the same types that `getType` outputs (`GetTypeTypes`) */
// eslint-disable-next-line complexity
const deepCopy = <T>(val: T): T => {
  const type = getType(val);
  switch (type) {
    case 'null':
    case 'string':
    case 'number':
    case 'bigint':
    case 'boolean':
    case 'undefined':
    case 'symbol':
    case 'function':
    default:
      return val;

    case 'regexp': {
      const pVal = force<RegExp>(val);
      return force<T>(new RegExp(pVal.source, pVal.flags));
    }

    case 'date':
      return force<T>(new Date(force<Date>(val).getTime()));

    case 'set':
      return force<T>(new Set([...force<Set<any>>(val)]));

    case 'array':
      return force<T>(force<any[]>(val).map(deepCopy));

    case 'map': {
      const entries = [...force<Map<any, any>>(val).entries()];
      return force<T>(
        new Map(entries.map(([key, val]) => [deepCopy(key), deepCopy(val)]))
      );
    }

    case 'object': {
      const entries = Object.entries(force<AnyObj>(val));
      return force<T>(
        Object.fromEntries(
          entries.map(([key, val]) => [deepCopy(key), deepCopy(val)])
        )
      );
    }
  }
};

export default deepCopy;
