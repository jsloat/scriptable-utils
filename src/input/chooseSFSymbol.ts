import { getColor } from '../colors';
import { lowerIncludes } from '../string';
import { ThreeCol } from '../UITable/elements';
import selectableEntityBrowser from '../views/selectableEntityBrowser';

export default async (initValue?: string) => {
  const result: { sfSymbolKey?: string } = { sfSymbolKey: initValue };

  await selectableEntityBrowser({
    getEntities: () => sfSymbolSample,
    getEntityRow: ({ entity: key, onTap }) =>
      ThreeCol({
        icon: key,
        text: key,
        ...(key === result.sfSymbolKey && {
          bgColor: getColor('selectedBgColor'),
        }),
        onTap,
        borderTop: 1,
        borderBottom: 1,
      }),
    getEntityId: key => key,
    openEntity: ({ entity: key, rerender }) => {
      result.sfSymbolKey = key;
      rerender();
    },
    getCustomCTAs: () => {
      const currKey = result.sfSymbolKey;
      return [
        {
          text: currKey ? `Selected: ${currKey}` : 'No selection',
          icon: currKey ?? 'dot_in_circle',
          isFaded: !currKey,
        },
      ];
    },
    getSearchMatchPredicate: query => key => lowerIncludes(key, query),
    headerOpts: { title: 'Icon picker' },
  });

  return result.sfSymbolKey;
};

const sfSymbolSample = [
  'calendar.badge.plus',
  'plus',
  'alarm',
  'bell',
  'archivebox',
  'arrow.left',
  'arrow.right',
  'arrow.up',
  'arrow.uturn.down',
  'asterisk',
  'paperclip',
  'arrowtriangle.left',
  'bell.fill',
  'bell',
  'book.closed',
  'bookmark.slash',
  'bookmark',
  'brain',
  'arrow.triangle.branch',
  'safari',
  'ant',
  'birthday.cake',
  'calendar.circle',
  'calendar',
  'xmark',
  'car',
  'square.stack.3d.down.right',
  'bubble.right',
  'checklist.checked',
  'checklist',
  'checkmark',
  'chevron.down',
  'chevron.left.square.fill',
  'chevron.left',
  'chevron.right.square.fill',
  'chevron.right',
  'chevron.up',
  'checkmark.circle.fill',
  'checkmark.circle',
  'largecircle.fill.circle',
  'circle',
  'checkmark.circle.fill',
  'exclamationmark.circle.fill',
  'exclamationmark.circle',
  'questionmark.circle.fill',
  'questionmark.circle',
  'clipboard.fill',
  'clock.fill',
  'clock',
  'chevron.left.forwardslash.chevron.right',
  'rectangle.compress.vertical',
  'minus.square',
  'bubble.right',
  'arrow.3.trianglepath',
  'questionmark.diamond',
  'list.dash',
  'gauge',
  'calendar.badge.minus',
  'flag.slash.circle',
  'bin.xmark',
  'display',
  'doc',
  'smallcircle.fill.circle',
  'square.and.arrow.down',
  'chevron.down.circle',
  'chevron.right.circle',
  'chevron.up.circle',
  'pencil',
  'ellipsis.circle',
  'ellipsis',
  'envelope',
  'exclamationmark',
  'chevron.up.chevron.down',
  'rectangle.expand.vertical',
  'plus.square',
  'line.horizontal.3.decrease.circle',
  'folder.circle',
  'questionmark.folder.fill',
  'folder',
  'textformat',
  'fork.knife',
  'arrowshape.turn.up.right',
  'chevron.right.2',
  'gift',
  'arrow.left.circle',
  'arrow.right.circle',
  'rectangle.3.offgrid',
  'text.justify',
  'number',
  'heart.fill',
  'eye.slash',
  'house',
  'chevron.left.slash.chevron.right',
  'tray.and.arrow.down',
  'list.bullet.indent',
  'info.circle',
  'ipad',
  'iphone',
  'k.circle',
  'laptopcomputer',
  'lightbulb',
  'link',
  'list.bullet.circle',
  'lock',
  'megaphone',
  'arrow.triangle.merge',
  'flag.circle',
  'dollarsign.square',
  'moon.circle',
  'nosign',
  'icloud.slash',
  'doc.plaintext',
  'bell',
  '1.square',
  '10.square',
  '11.square',
  '12.square',
  '13.square',
  '14.square',
  '15.square',
  '2.square',
  '3.square',
  '4.square',
  '5.square',
  '6.square',
  '7.square',
  '8.square',
  '9.square',
  'list.number',
  'textformat.123',
  'arrow.up.right',
  'paintpalette',
  'figure.and.child.holdinghands',
  'party.popper',
  'pause',
  'pause.circle',
  'person',
  'photo',
  'pin.fill',
  'pin',
  'airplane',
  'play',
  'figure.play',
  'hand.point.up.left',
  'questionmark',
  'arrow.clockwise',
  'arrowshape.turn.up.left',
  'doc.text.magnifyingglass',
  'magnifyingglass',
  'square.grid.3x2',
  'paperplane',
  'gear',
  'square.and.arrow.up',
  'person.2.fill',
  'person.2',
  'cart.badge.plus',
  'cart',
  'eye',
  'sleep',
  'figure.stand.line.dotted.figure.stand',
  'arrow.up.arrow.down',
  'square.split.2x1',
  'square.fill',
  'square',
  'star.circle',
  'star.fill',
  'star',
  'chart.line.uptrend.xyaxis',
  'octagon',
  'xmark.octagon',
  'hand.raised',
  'water.waves',
  'arrow.turn.down.right',
  'sun.max',
  'sunrise',
  'tag',
  'checkmark.square',
  'square',
  'minus.square',
  'textbox',
  'text.cursor',
  'medical.thermometer',
  'hand.thumbsdown',
  'hand.thumbsup',
  'timer',
  'tray.circle',
  'tray.fill',
  'tortoise',
  'arrow.uturn.left',
  'pin.slash.fill',
  'video',
  'hourglass',
  'exclamationmark.triangle',
  'scalemass',
  'briefcase',
  'xmark.circle',
  'xmark.square',
];
