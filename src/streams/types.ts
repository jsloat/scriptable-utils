export type StreamConstructorOpts<DataType extends AnyObj> = {
  defaultState: DataType;
  name: string;
  showStreamDataUpdateDebug?: boolean;
};
