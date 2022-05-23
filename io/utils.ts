const temporaryFilenamePrefix = 'tmp_';

/** Generates a filename indicative of a temporary file that can be cleaned up. */
export const getTemporaryFilename = () =>
  `${temporaryFilenamePrefix}${UUID.string()}`;
