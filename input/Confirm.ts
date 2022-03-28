import { ExcludeFalsy, getRandomArrayItem } from '../common';
import { BUTTON_TEXTS } from '../privateConfig';
import Base from './Base';
import { Button, ConfirmOpts, DestructiveConfirmOpts, OKOpts } from './types';

const DEFAULT_CONFIRM_TITLE = 'Confirm action';

export const Confirm = async (
  title = DEFAULT_CONFIRM_TITLE,
  {
    message,
    confirmButtonTitle = 'OK',
    cancelButtonTitle,
    includeCancel = true,
    isCancelFirst = true,
    presentAsSheet = true,
    isSubmitRed = false,
    onConfirm = () => {},
    onCancel = () => {},
    includeDontShowAgain,
    onDontShowAgain = () => {},
  }: ConfirmOpts = {}
) => {
  const cancelButton: Button | null = includeCancel
    ? {
        label: cancelButtonTitle || 'Cancel',
        color: isSubmitRed ? 'black' : 'red',
        isCancel: true,
      }
    : null;
  const confirmColor = isSubmitRed ? 'red' : 'black';
  const confirmButton: Button = {
    label: confirmButtonTitle,
    color: confirmColor,
  };

  const dontShowAgainButtonLabel = `${confirmButtonTitle} (stop asking)`;
  const dontShowAgainButton: Button = {
    label: dontShowAgainButtonLabel,
    color: confirmColor,
  };

  const confirmButtons = [
    confirmButton,
    includeDontShowAgain && dontShowAgainButton,
  ].filter(ExcludeFalsy);
  const buttons = (
    isCancelFirst
      ? [cancelButton, ...confirmButtons]
      : [...confirmButtons, cancelButton]
  ).filter(ExcludeFalsy);

  const { cancelled, buttonTapped } = await Base(title, buttons, {
    message,
    presentAsSheet,
  });

  if (cancelled) {
    await onCancel();
    return false;
  }

  if (buttonTapped === dontShowAgainButtonLabel) await onDontShowAgain();
  await onConfirm();
  return true;
};

//
// DESTRUCTIVE CONFIRM
//

export const DestructiveConfirm = async (
  title: string,
  { confirmButtonTitle = 'Delete', ...restOpts }: DestructiveConfirmOpts = {}
) =>
  await Confirm(title, {
    isSubmitRed: true,
    confirmButtonTitle,
    ...restOpts,
  });

/** Returns constructor for destructive confirm with option to not show again.
 * Important that the constructor be generated only once so the shouldAlert flag
 * persists in the session. */
export const getDismissableDestructiveConfirm = () => {
  let shouldAlert = true;
  return async (
    title: string,
    {
      confirmButtonTitle = 'Delete',
      onConfirm,
      ...restOpts
    }: DestructiveConfirmOpts = {}
  ) => {
    if (!shouldAlert) {
      onConfirm && (await onConfirm());
      return true;
    }
    return Confirm(title, {
      isSubmitRed: true,
      confirmButtonTitle,
      includeDontShowAgain: true,
      onDontShowAgain: () => (shouldAlert = false),
      onConfirm,
      ...restOpts,
    });
  };
};

//
// OK
//

/** @param {string} title, @param {OKOpts} [opts] */
export const OK = async (
  title: string,
  {
    confirmButtonTitle = getRandomArrayItem(BUTTON_TEXTS),
    ...restOpts
  }: OKOpts = {}
) =>
  await Confirm(title, {
    includeCancel: false,
    confirmButtonTitle,
    ...restOpts,
  });
