import { conditionalArr } from '../../../array';
import { ContentAreaOpts, RowOpts } from '../types';
import { getRowConstructor } from './utils';

type OwnContentAreaOpts = Omit<ContentAreaOpts, 'align' | 'width'>;
type OwnOpts = {
  gutterLeft?: OwnContentAreaOpts;
  main: OwnContentAreaOpts;
  gutterRight?: OwnContentAreaOpts;
};
type CellID = keyof OwnOpts;
type WidthMap = Record<CellID, number>;

const GRID_WIDTH = 12;
const GUTTER_LEFT_WIDTH = 1;
const GUTTER_RIGHT_WIDTH = 2;
const ALIGN: Record<CellID, Align> = {
  gutterLeft: 'center',
  main: 'left',
  gutterRight: 'right',
};

const getWidths = ({ gutterLeft, gutterRight }: OwnOpts): WidthMap => {
  const gutterLeftWidth = (gutterLeft && GUTTER_LEFT_WIDTH) ?? 0;
  const gutterRightWidth = (gutterRight && GUTTER_RIGHT_WIDTH) ?? 0;
  return {
    gutterLeft: gutterLeftWidth,
    main: GRID_WIDTH - gutterLeftWidth - gutterRightWidth,
    gutterRight: gutterRightWidth,
  };
};

const makeContentAreaOpts = (
  opts: OwnContentAreaOpts,
  cellID: CellID,
  widthMap: WidthMap
  // @ts-ignore
): ContentAreaOpts => ({
  ...opts,
  width: widthMap[cellID],
  align: ALIGN[cellID],
});

export const getThreeColReducer = (ownOpts: OwnOpts): Identity<RowOpts> => {
  const { gutterLeft, main, gutterRight } = ownOpts;
  return rowOpts => {
    const widths = getWidths(ownOpts);
    return {
      ...rowOpts,
      content: conditionalArr([
        gutterLeft && makeContentAreaOpts(gutterLeft, 'gutterLeft', widths),
        makeContentAreaOpts(main, 'main', widths),
        gutterRight && makeContentAreaOpts(gutterRight, 'gutterRight', widths),
      ]),
    };
  };
};

export default getRowConstructor(getThreeColReducer);
