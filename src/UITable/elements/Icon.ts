import { getColor } from '../../colors';
import { getSfSymbolImg } from '../../sfSymbols';
import { isSFSymbolKey } from '../../sfSymbols/utils';
import { Cell, CellShapeStyle } from './shapes';
import { maybeFadeForegroundColor } from './utils';

type IconOpts = CellShapeStyle & { doNotTint?: boolean };

class Icon extends Cell {
  constructor(key: string, { doNotTint = false, ...style }: IconOpts) {
    super({
      style,
      getCellOptsWithCalibratedWidth: (inheritedStyle, widthWeight) => {
        const {
          align = 'center',
          color = getColor('primaryTextColor'),
          font = n => Font.boldSystemFont(n),
          fontSize = 20,
        } = inheritedStyle;
        const parsedColor = maybeFadeForegroundColor(color, inheritedStyle);
        return isSFSymbolKey(key)
          ? {
              type: 'image',
              value: getSfSymbolImg(key, doNotTint ? null : parsedColor),
              align,
              widthWeight,
            }
          : {
              type: 'text',
              value: key,
              align,
              widthWeight,
              color: parsedColor,
              font: font(fontSize),
            };
      },
    });
  }
}

export default (key: string, style: IconOpts = {}) => {
  const el = new Icon(key, style);
  el.setDescription(`ICON > key: "${key}"`);
  return el;
};
