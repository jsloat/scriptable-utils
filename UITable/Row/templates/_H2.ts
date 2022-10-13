import { getDynamicColor } from '../../../colors';
import { SFSymbolKey } from '../../../sfSymbols';
import Row from '..';
import { ContentAreaOpts, RowOpts } from '../types';
import _HR from './_HR';
import _TwoCol from './_TwoCol';

type Opts = { label: string; iconKey?: SFSymbolKey } & Pick<
  ContentAreaOpts,
  'color'
> &
  Pick<
    RowOpts,
    | 'onTap'
    | 'onDoubleTap'
    | 'onTripleTap'
    | 'dismissOnTap'
    | 'isFaded'
    | 'padding'
  >;

export default ({
  label,
  color = getDynamicColor('black', 'white'),
  iconKey,
  padding,
  ...rowOpts
}: Opts) => {
  const paddingTop = padding?.paddingTop ?? 40;
  const paddingBottom = padding?.paddingBottom ?? 10;
  const commonRowOpts = {
    padding: { paddingTop, paddingBottom: 0 },
    rowHeight: 35,
    ...rowOpts,
  };
  const mainContent = {
    text: label,
    fontConstructor: Font.thinMonospacedSystemFont,
    textSize: 19,
    color,
  };
  const textRow = iconKey
    ? _TwoCol({
        gutterLeft: { iconKey, color },
        main: mainContent,
        ...commonRowOpts,
      })
    : Row({ content: [mainContent], ...commonRowOpts });
  const underlineRow = _HR({ dim: 0.4, padding: { paddingBottom }, color });
  return [textRow, underlineRow].flat();
};
