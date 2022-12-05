import { getColor } from '../../colors';
import { ICONS } from '../../icons';
import { getSfSymbolImg, SFSymbolKey } from '../../sfSymbols';
import { isSFSymbolKey } from '../../sfSymbols/utils';
import { BaseCell } from '../Row/base';
import { CellShape, CellShapeStyle } from './shapes';
import { parseColor } from './utils';

type IconKey = keyof typeof ICONS;
export type ValidIconKey = SFSymbolKey | IconKey;

class Icon extends CellShape {
  private key: ValidIconKey;

  constructor(key: ValidIconKey, style: CellShapeStyle) {
    super(style);
    this.key = key;
  }

  render() {
    const {
      align = 'center',
      color = getColor('primaryTextColor'),
      font = Font.boldSystemFont,
      fontSize = 20,
    } = this.style;
    const width = this.getWidthPercent();
    const parsedColor = parseColor(color, this.style);

    if (isSFSymbolKey(this.key)) {
      return BaseCell({
        type: 'image',
        value: getSfSymbolImg(this.key, parsedColor),
        align,
        widthWeight: width,
      });
    } else {
      return BaseCell({
        type: 'text',
        value: ICONS[this.key],
        align,
        widthWeight: width,
        color: parsedColor,
        font: font(fontSize),
      });
    }
  }
}

export default (key: ValidIconKey, style: CellShapeStyle = {}) =>
  new Icon(key, style);
