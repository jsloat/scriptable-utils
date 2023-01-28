import alert from '../input/alert';
import { Container } from './elements/shapes';
import { BaseRow } from './Row/base';

export const reloadTableRows = (
  table: UITable,
  rows: (UITableRow | Container)[]
) => {
  table.removeAllRows();
  rows.forEach(row => {
    if (row instanceof Container) {
      const rowOpts = row.render();
      rowOpts.forEach(rowOpts => table.addRow(BaseRow(rowOpts)));
    } else {
      table.addRow(row);
    }
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
