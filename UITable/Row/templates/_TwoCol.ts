import { ContentAreaOpts, RowOpts } from '../types';
import { getRowConstructor } from './utils';

type OwnContentAreaOpts = Omit<ContentAreaOpts, 'align' | 'width'>;
type OwnOpts = { gutterLeft: OwnContentAreaOpts; main: OwnContentAreaOpts };

//
// TODO: consolidate this with _ThreeCol consts & types
const GRID_WIDTH = 12;
const GUTTER_LEFT_WIDTH = 1;

export const getTwoColReducer =
  ({ gutterLeft, main }: OwnOpts): Identity<RowOpts> =>
  rowOpts => ({
    ...rowOpts,
    content: [
      // @ts-ignore
      { ...gutterLeft, width: GUTTER_LEFT_WIDTH, align: 'center' },
      // @ts-ignore
      {
        ...main,
        width: GRID_WIDTH - GUTTER_LEFT_WIDTH,
        align: 'left',
      },
    ],
  });

export default getRowConstructor(getTwoColReducer);
