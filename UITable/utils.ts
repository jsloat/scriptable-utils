import alert from '../input/alert';
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
