import { Identity } from '../../../types/utilTypes';
import { RowOpts } from '../types';

/** NB -- should be placed at end of composed identities to ensure content
 * doesn't get overwritten by, for example, `getThreeColReducer` */
export const getFootnoteReducer = (): Identity<RowOpts> => opts => ({
  ...opts,
  rowHeight: 14,
  content: opts.content?.map(c => ({ ...c, fontConstructor: Font.footnote })),
});
