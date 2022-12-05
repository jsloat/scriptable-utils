import { BaseCell } from '../Row/base';
import { CellShape, CellShapeStyle } from './shapes';

type ImgStyle = Pick<CellShapeStyle, 'align' | 'width'>;

class Img extends CellShape {
  private image: Image;

  constructor(image: Image, style: ImgStyle) {
    super(style);
    this.image = image;
  }

  render() {
    const { align = 'center' } = this.style;
    const width = this.getWidthPercent();
    return BaseCell({
      type: 'image',
      value: this.image,
      align,
      widthWeight: width,
    });
  }
}

export default (image: Image, style: ImgStyle = {}) => new Img(image, style);

// TODO: add a variation `RemoteImage` that fetches the image `src` and displays
// a fallback icon while waiting.
