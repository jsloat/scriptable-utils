import { Stream } from '../streams';
import { SCRIPTABLE_STORE_PATH } from './consts';
import { getDirContents } from './filesystemUtils';
import persisted from './persisted';

export const temporaryFilenamePrefix = 'tmp_';

/** Generates a filename indicative of a temporary file that can be cleaned up. */
export const getTemporaryFilename = () =>
  `${temporaryFilenamePrefix}${UUID.string()}`;

const getTmpFilePaths = () => {
  const allFilesInStore = getDirContents(SCRIPTABLE_STORE_PATH);
  return allFilesInStore.filter(
    ({ filenameNoExtension }) =>
      filenameNoExtension.startsWith(temporaryFilenamePrefix) ||
      filenameNoExtension.startsWith(`.${temporaryFilenamePrefix}`)
  );
};

/** Deletes all temporary files that exist in the Scriptable `store` directory
 * - this is a custom directory that I use for persisted data files. These
 *   temporary files are used by things like `PersistedCache` to temporarily
 *   store data.  */
export const cleanupTemporaryFiles = () => {
  const tempFilenames = getTmpFilePaths();
  tempFilenames.forEach(async ({ filenameNoExtension }) => {
    const io = persisted<any>({
      filename: filenameNoExtension,
      defaultData: null,
    });
    // Ensure file is downloaded first, otherwise may not be deleted.
    await io.getData();
    io.deleteFile();
  });
  return { numDeletedTempFiles: tempFilenames.length };
};

//

type RobustCleanup$Data = {
  numRemainingTmpFiles: number;
  numRemoved: number;
  numFailures: number;
  numDownloaded: number;
  isRunning: boolean;
};

/** Used for views to plug into status of running function. */
export const robustCleanup$ = new Stream<RobustCleanup$Data>({
  name: 'robustCleanup$',
  defaultState: {
    isRunning: false,
    numFailures: 0,
    numRemainingTmpFiles: 0,
    numDownloaded: 0,
    numRemoved: 0,
  },
});
const set$ = (data: Partial<RobustCleanup$Data>) =>
  robustCleanup$.setData({ ...robustCleanup$.getData(), ...data });
const inc$ = (key: Exclude<keyof RobustCleanup$Data, 'isRunning'>, inc = 1) =>
  set$({ [key]: robustCleanup$.getData()[key] + inc });

const robustCleanupRecur = async (i = 0) => {
  if (i > 30) {
    set$({ isRunning: false });
    return;
  }
  const filePathsToDelete = getTmpFilePaths();
  if (!filePathsToDelete.length) {
    set$({ isRunning: false, numRemainingTmpFiles: 0 });
    return;
  }
  const firstPath = filePathsToDelete[0]!.filepath;
  try {
    const io = FileManager.iCloud();
    if (!io.isFileDownloaded(firstPath)) {
      await io.downloadFileFromiCloud(firstPath);
      inc$('numDownloaded');
    }
    io.remove(firstPath);
    inc$('numRemoved');
    inc$('numRemainingTmpFiles', -1);
  } catch {
    inc$('numFailures');
  } finally {
    const t = new Timer();
    t.timeInterval = 300;
    t.schedule(() => robustCleanupRecur(i + 1));
  }
};

/** `cleanupTemporaryFiles` is hit or miss with not-downloaded tmp files. This
 * function uses a timer and try/catch to keep trying to download the files and
 * remove them. */
export const robustCleanupTemporaryFiles = () => {
  const numRemainingTmpFiles = getTmpFilePaths().length;
  const willRun = Boolean(numRemainingTmpFiles);
  set$({
    isRunning: willRun,
    numDownloaded: 0,
    numFailures: 0,
    numRemainingTmpFiles,
    numRemoved: 0,
  });
  if (willRun) robustCleanupRecur();
};
