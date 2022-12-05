import alert from '../input/alert';
import { notifyNow } from '../notifications';
import {
  getScreenHeightMeasurements,
  ScreenHeightMeasurements,
} from '../serviceRegistry';
import { CellContainerShape } from './elements/shapes';

export const reloadTableRows = (
  table: UITable,
  rows: (UITableRow | CellContainerShape)[]
) => {
  table.removeAllRows();
  rows.forEach(row => {
    const parsedRows = [
      row instanceof CellContainerShape ? row.render() : row,
    ].flat();
    parsedRows.forEach(parsedRow => table.addRow(parsedRow));
  });
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

/** Using `Device.isInPortrait`, and similar predicates, is very inconsistent.
 * The main symptom of this is that when the device is flat on a surface, all
 * the orientation predicates are false (it's not in portrait nor landscape).
 * This solution should be pretty bullet-proof */
export const getDeviceOrientation =
  (): ScreenHeightMeasurements.Orientation => {
    const width = Device.screenSize().width;
    const height = Device.screenSize().height;
    return width > height ? 'landscape' : 'portrait';
  };

export const getMaxScreenHeight = (mode: ScreenHeightMeasurements.Mode) => {
  const device = Device.model();
  const deviceSettings = getScreenHeightMeasurements()[device];
  if (!deviceSettings) {
    notifyNow(`No screen height settings for ${device}`);
    return Device.screenSize().height;
  }
  return deviceSettings[mode][getDeviceOrientation()];
};
