import { getColor } from '../../colors';
import { truncate } from '../../string';
import { Cell, CellShapeStyle } from './shapes';
import { fadeColorIntoBackground } from './utils';

class P extends Cell {
  constructor(text: string, style: CellShapeStyle) {
    super({
      style,
      getCellOptsWithCalibratedWidth: (
        {
          align = 'left',
          color = getColor('primaryTextColor'),
          font = Font.regularRoundedSystemFont,
          fontSize = 20,
        },
        widthWeight
      ) => {
        const parsedColor = fadeColorIntoBackground(color, this.style);
        return {
          type: 'text',
          value: text,
          align,
          widthWeight,
          color: parsedColor,
          font: font(fontSize),
        };
      },
    });
  }
}

export default (text: string, style: CellShapeStyle = {}) => {
  const el = new P(text, style);
  el.setDescription(`P > text: "${truncate(text, 20)}"`);
  return el;
};
