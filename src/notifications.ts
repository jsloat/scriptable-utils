import { isNotUndefined } from './common';
import { objectKeys } from './object';
import { SettableKeys } from './types/utilTypes';

type NotificationAction = {
  title: string;
  url: string;
  destructive?: boolean;
};

type GetNotificationOpts = Exclude<
  {
    [key in SettableKeys<Notification>]?: Notification[key];
  },
  'title'
> &
  Pick<Notification, 'title'>;

const createNotification = (
  opts: GetNotificationOpts,
  actions: NotificationAction[] = []
) => {
  const n = new Notification();
  objectKeys(opts).forEach(<K extends SettableKeys<Notification>>(key: K) => {
    const val = opts[key] as Notification[K];
    if (isNotUndefined(val)) n[key] = val;
  });
  actions.forEach(({ title, url, destructive = false }) =>
    n.addAction(title, url, destructive)
  );
  return n;
};

export const notifyNow = (title: string, body?: string) => {
  createNotification({ title, body }).schedule();
};
