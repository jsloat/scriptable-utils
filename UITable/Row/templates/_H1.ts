import { conditionalArr } from '../../../array';
import { getColor } from '../../../colors';
import { SFSymbolKey } from '../../../sfSymbols';
import { RowOpts } from '../types';
import { H1Consts } from './consts';
import { composeRowConstructor } from './utils';
import { getFootnoteReducer } from './_Footnote';
import _ThreeCol, { getThreeColReducer } from './_ThreeCol';

export type H1Opts = {
  title: string;
  subtitle?: string;
  titleColor?: Color;
  subtitleColor?: Color;
  /** Shown in place of action indicator icon */
  badgeNumber?: number;
  icon?: SFSymbolKey;
} & Pick<RowOpts, 'onTap' | 'isFaded'>;

//

const TopRow = ({
  icon,
  title,
  titleColor,
  onTap,
  badgeNumber,
  subtitle,
  isFaded,
}: H1Opts) => {
  const { textSize, fontConstructor, paddingTop, paddingBottom } = H1Consts;
  return _ThreeCol({
    ...(icon && { gutterLeft: { iconKey: icon } }),
    main: {
      text: title,
      fontConstructor,
      textSize,
      ...(titleColor && { color: titleColor }),
    },
    ...(badgeNumber && {
      gutterRight: {
        text: badgeNumber,
        color: getColor('danger'),
      },
    }),
    onTap,
    isFaded,
    padding: { paddingTop, paddingBottom: subtitle ? 0 : paddingBottom },
    rowHeight: 'lg',
  });
};

const BottomRow = ({
  subtitle,
  icon,
  subtitleColor,
  badgeNumber,
  onTap,
  isFaded,
}: H1Opts) => {
  if (!subtitle) return null;
  const { paddingBottom } = H1Consts;
  const rowConstructor = composeRowConstructor(
    getThreeColReducer({
      ...(icon && { gutterLeft: { isEmpty: true } }),
      main: {
        text: subtitle,
        ...(subtitleColor && { color: subtitleColor }),
      },
      ...(badgeNumber && { gutterRight: { isEmpty: true } }),
    }),
    getFootnoteReducer()
  );
  return rowConstructor({
    onTap,
    padding: { paddingTop: 0, paddingBottom },
    isFaded,
  });
};

//

export default (opts: H1Opts) =>
  conditionalArr([TopRow(opts), BottomRow(opts)]).flat();
