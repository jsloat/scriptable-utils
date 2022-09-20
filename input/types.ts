export type TextFieldKeyboardFlavor =
  | 'default'
  | 'number'
  | 'email'
  | 'phone'
  | 'url';

export type TextFieldFormatting = {
  font?: Font;
  textColor?: Color;
  flavor?: TextFieldKeyboardFlavor;
};

export type TextFieldConfigOpts = {
  placeholder?: string;
  initValue?: string;
} & TextFieldFormatting;

export type Button = {
  // If true, use `addDestructiveAction`
  isRed?: boolean;
  // If true, use `addCancelAction`
  isCancel?: boolean;
};
