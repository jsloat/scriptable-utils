type TextFieldKeyboardFlavor = 'default' | 'number' | 'email' | 'phone' | 'url';

export type TextFieldFormatting = {
  font?: Font;
  textColor?: Color;
  align?: Align;
  flavor?: TextFieldKeyboardFlavor;
};

export type TextField = {
  placeholder?: string;
  initValue?: string;
} & TextFieldFormatting;

export type Button = {
  label?: string;
  color?: 'red' | 'black';
  isCancel?: boolean; // Signifies that Base will return `{ cancelled: true }` if tapped. Can be any color
};

export enum ButtonType {
  ACTION = 'action',
  CANCEL = 'cancel', // Signifies that Base will return `{ cancelled: true }` if tapped. Can be any color
}

export type BaseOpts<T extends Record<string, TextField>> = {
  message?: string;
  textFields?: T | void;
  presentAsSheet?: boolean;
};

export type ConfirmOpts = Pick<
  BaseOpts<never>,
  'message' | 'presentAsSheet'
> & {
  confirmButtonTitle?: string;
  cancelButtonTitle?: string;
  includeCancel?: boolean;
  isCancelFirst?: boolean;
  isSubmitRed?: boolean;
  onConfirm?: () => any;
  onCancel?: () => any;
  includeDontShowAgain?: boolean;
  onDontShowAgain?: () => any;
};

export type OKOpts = Pick<
  ConfirmOpts,
  'message' | 'confirmButtonTitle' | 'presentAsSheet' | 'onConfirm'
>;

export type DestructiveConfirmOpts = Pick<
  ConfirmOpts,
  | 'message'
  | 'confirmButtonTitle'
  | 'cancelButtonTitle'
  | 'onConfirm'
  | 'onCancel'
>;

export type TextInputOpts = {
  submitText?: string;
  cancelText?: string;
  onSubmit?: (result: string) => any;
  onCancel?: () => any;
  flavor?: TextFieldKeyboardFlavor;
  showClipboardButton?: boolean;
} & TextField &
  Pick<BaseOpts<never>, 'message'>;
