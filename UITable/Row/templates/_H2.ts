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
    'onTap' | 'onDoubleTap' | 'onTripleTap' | 'dismissOnTap' | 'isFaded'
  >;

export default ({
  label,
  color = getDynamicColor('black', 'white'),
  iconKey,
  ...rowOpts
}: Opts) => {
  const commonRowOpts = {
    padding: { paddingTop: 40, paddingBottom: 0 },
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
  const underlineRow = _HR({
    dim: 0.4,
    marginTop: 0,
    marginBottom: 10,
    color,
  });
  return [textRow, underlineRow].flat();
};
