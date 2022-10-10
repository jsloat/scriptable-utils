import { conditionalArr } from '../../../array';
import { getColor } from '../../../colors';
import { fade } from '../../../common';
import Row from '..';
import { RowOpts } from '../types';

type Opts = {
  dim?: number;
  marginTop?: number;
  marginBottom?: number;
  color?: Color;
  height?: number;
};

const noPadding: Pick<RowOpts, 'padding'> = {
  padding: { paddingTop: 0, paddingBottom: 0 },
};

/** NB: margin is different from padding in that it will have a different bgColor */
export default ({
  dim = 0,
  marginBottom = 0,
  marginTop = 0,
  color = getColor('hr'),
  height = 1,
}: Opts = {}) =>
  conditionalArr([
    marginTop && Row({ rowHeight: marginTop, ...noPadding }),
    Row({ rowHeight: height, bgColor: fade(color, dim), ...noPadding }),
    marginBottom && Row({ rowHeight: marginBottom, ...noPadding }),
  ]).flat();
