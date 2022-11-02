import alert from '../input/alert';

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
