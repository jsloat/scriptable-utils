import { DEFAULT_GRID_WIDTH, DEFAULT_LEFT_GUTTER_WIDTH } from '../consts';
import { ContentAreaOpts, RowOpts } from '../types';
import { getRowConstructor } from './utils';

type OwnContentAreaOpts = Omit<ContentAreaOpts, 'align' | 'width'>;
type OwnOpts = { gutterLeft: OwnContentAreaOpts; main: OwnContentAreaOpts };

export const getTwoColReducer =
  ({ gutterLeft, main }: OwnOpts): Identity<RowOpts> =>
  rowOpts => ({
    ...rowOpts,
    content: [
      // @ts-ignore
      { ...gutterLeft, width: DEFAULT_LEFT_GUTTER_WIDTH, align: 'center' },
      // @ts-ignore
      {
        ...main,
        width: DEFAULT_GRID_WIDTH - DEFAULT_LEFT_GUTTER_WIDTH,
        align: 'left',
      },
    ],
  });

export default getRowConstructor(getTwoColReducer);
