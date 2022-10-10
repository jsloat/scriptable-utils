import { RowOpts } from '../types';
import { getRowConstructor } from './utils';

/** NB -- should be placed at end of composed identities to ensure content
 * doesn't get overwritten by, for example, `getThreeColReducer` */
export const getFootnoteReducer = (): Identity<RowOpts> => opts => ({
  ...opts,
  rowHeight: 14,
  content: opts.content?.map(c => ({ ...c, fontConstructor: Font.footnote })),
});

// ts-unused-exports:disable-next-line
export default getRowConstructor(getFootnoteReducer);
