import { conditionalArr } from '../../array';
import { pick } from '../../object';
import Div from './Div';
import Icon, { ValidIconKey } from './Icon';
import P from './P';
import { ContainerStyle, Row } from './shapes';
import { CascadingStyle, Percent, TapProps } from './types';

type H1Opts = Partial<{
  subtitle: string;
  titleColor: Color;
  subtitleColor: Color;
  icon?: ValidIconKey;
}> &
  Pick<CascadingStyle, 'isFaded' | 'marginBottom' | 'marginTop'> &
  TapProps;

const ICON_WIDTH = 10;
const ICON_WIDTH_PCT: Percent = `${ICON_WIDTH}%`;
const NO_SPACING: ContainerStyle = {
  marginBottom: 0,
  marginTop: 0,
  paddingBottom: 0,
  paddingTop: 0,
};

const getTapProps: Identity<TapProps> = props =>
  pick(props, ['dismissOnTap', 'onDoubleTap', 'onTap', 'onTripleTap']);

const getTopRow = (
  title: string,
  { titleColor, icon, ...restProps }: H1Opts
) => {
  const tapProps = getTapProps(restProps);
  const hasOnTap = Boolean(
    tapProps.onTap || tapProps.onDoubleTap || tapProps.onTripleTap
  );
  const numShownIcons = (icon ? 1 : 0) + (hasOnTap ? 1 : 0);
  return new Row(
    conditionalArr([
      icon && Icon(icon, { width: ICON_WIDTH_PCT, color: titleColor }),

      P(title, {
        font: Font.boldSystemFont,
        fontSize: 25,
        width: `${100 - numShownIcons * ICON_WIDTH}%`,
        color: titleColor,
      }),

      hasOnTap &&
        Icon('ellipsis_circle', {
          width: ICON_WIDTH_PCT,
          isFaded: true,
          color: titleColor,
        }),
    ]),
    NO_SPACING,
    tapProps
  );
};

const getSubtitleRow = (
  subtitle: string,
  { subtitleColor, icon, ...restProps }: H1Opts
) =>
  new Row(
    conditionalArr([
      icon && P('', { width: ICON_WIDTH_PCT }),

      P(subtitle, {
        width: `${100 - (icon ? ICON_WIDTH : 0)}%`,
        font: Font.footnote,
        color: subtitleColor,
      }),
    ]),
    { height: 14, ...NO_SPACING },
    getTapProps(restProps)
  );

export default (title: string, opts: H1Opts) => {
  const { subtitle, isFaded, marginBottom, marginTop } = opts;
  return Div(
    conditionalArr([
      getTopRow(title, opts),
      subtitle && getSubtitleRow(subtitle, opts),
    ]),
    {
      marginTop,
      marginBottom,
      isFaded,
      paddingTop: 10,
      paddingBottom: 15,
      ...getTapProps(opts),
    }
  );
};
