import { SCRIPTABLE_STORE_PATH } from './consts';
import { getDirContents } from './filesystemUtils';
import persisted from './persisted';

const temporaryFilenamePrefix = 'tmp_';

/** Generates a filename indicative of a temporary file that can be cleaned up. */
export const getTemporaryFilename = () =>
  `${temporaryFilenamePrefix}${UUID.string()}`;

/** Deletes all temporary files that exist in the Scriptable `store` directory
 * - this is a custom directory that I use for persisted data files. These
 *   temporary files are used by things like `PersistedCache` to temporarily
 *   store data.  */
export const cleanupTemporaryFiles = () => {
  const allStoreFiles = getDirContents(SCRIPTABLE_STORE_PATH);
  const tempFilenames = allStoreFiles
    .map(f => f.filenameNoExtension)
    .filter(filename => filename.startsWith(temporaryFilenamePrefix));
  tempFilenames.forEach(async filename => {
    const io = persisted<any>({ filename, defaultData: null });
    // Ensure file is downloaded first, otherwise may not be deleted.
    await io.getData();
    io.deleteFile();
  });
  return { numDeletedTempFiles: tempFilenames.length };
};
