import { isString } from '../common';
import { formatDate } from '../date';
import persisted from './persisted';

const MAX_LOG_LINES = 5000;

const trimLogLength = (log: string) => {
  const lines = log.split('\n');
  if (lines.length <= MAX_LOG_LINES) return log;
  return lines.slice(lines.length - MAX_LOG_LINES).join('\n');
};

const persistedLog = persisted({
  filename: 'persistedLog',
  defaultData: '',
});

const log = async (val: any, { ignoreLineLimit = false } = {}) => {
  const stringEntry = isString(val) ? val : JSON.stringify(val, null, 2);
  const currData = await persistedLog.getData();
  const NOW = new Date();
  const timestamp = `${formatDate(NOW, 'YYYYMMDD')}, ${formatDate(
    NOW,
    'HHMM'
  )}`;
  const device = Device.isPhone() ? 'phone' : 'iPad';
  const newEntry = `${timestamp} (${device}): ${stringEntry}`;
  const updatedLog = [currData, newEntry].filter(Boolean).join('\n');
  await persistedLog.write({
    data: ignoreLineLimit ? updatedLog : trimLogLength(updatedLog),
  });
};

export default {
  clear: () => persistedLog.reset(),
  log,
};
