import { getColor } from '../../colors';
import { BaseCell } from '../Row/base';
import { CellShape, CellShapeStyle } from './shapes';
import { parseColor } from './utils';

class P extends CellShape {
  private text: string;

  constructor(text: string, style: CellShapeStyle) {
    super(style);
    this.text = text;
  }

  render() {
    const {
      align = 'left',
      color = getColor('primaryTextColor'),
      font = Font.regularRoundedSystemFont,
      fontSize = 20,
    } = this.style;
    const width = this.getWidthPercent();
    const parsedColor = parseColor(color, this.style);

    return BaseCell({
      type: 'text',
      value: this.text,
      align,
      widthWeight: width,
      color: parsedColor,
      font: font(fontSize),
    });
  }
}

export default (text: string, style: CellShapeStyle = {}) => new P(text, style);
