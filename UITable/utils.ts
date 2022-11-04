import alert from '../input/alert';
import { notifyNow } from '../notifications';
import {
  getScreenHeightMeasurements,
  ScreenHeightMeasurements,
} from '../serviceRegistry';

export const reloadTableRows = (table: UITable, rows: UITableRow[]) => {
  table.removeAllRows();
  rows.forEach(row => table.addRow(row));
  table.reload();
};

export const catchTableError = async (error: any, tableName: string) => {
  // eslint-disable-next-line no-console
  console.warn(error);
  await alert({
    title: `Error encountered in ${tableName} render`,
    message: String(error),
    buttons: { OK: {} },
  });
};

export const getMaxScreenHeight = (mode: ScreenHeightMeasurements.Mode) => {
  const deviceScreenHeight = Device.screenSize().height;
  if (!getScreenHeightMeasurements) return deviceScreenHeight;
  const device = Device.model();
  const orientation: ScreenHeightMeasurements.Orientation =
    Device.isInPortrait() ? 'portrait' : 'landscape';
  const deviceSettings = getScreenHeightMeasurements()[device];
  if (!deviceSettings) {
    notifyNow(`No screen height settings for ${device}`);
    return deviceScreenHeight;
  }
  return deviceSettings[mode][orientation];
};
