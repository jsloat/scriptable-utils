import { AnyObj, DeepReadonly } from '../types/utilTypes';

export type StreamConstructorOpts<DataType extends AnyObj> = {
  defaultState: DataType;
  name: string;
  showStreamDataUpdateDebug?: boolean;
};

export type StreamData<DataType extends AnyObj> = DeepReadonly<DataType>;

export type StreamReducer<DataType extends AnyObj> = (
  data: DataType
) => DataType;
