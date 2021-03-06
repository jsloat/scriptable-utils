import { OK } from './input/Confirm';
import PersistedLog from './io/PersistedLog';

export const alertAndLogError = (error: any, context: string) => {
  OK(`Error in ${context} (see log)`, { message: String(error) });
  PersistedLog.log({ type: 'Error', error: JSON.stringify(error) });
};

export class ErrorWithPayload extends Error {
  payload: AnyObj;

  constructor(message: string, payload: AnyObj) {
    super(message);
    this.payload = payload;
  }
}
