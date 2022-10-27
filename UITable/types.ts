import { Persisted } from '../io/persisted';
import { Stream } from '../streams';

/** Falsy values will be filtered out, arrays will be flattened.  */
export type ValidTableEl = MaybeArray<UITableRow | Falsy>;

export type CombineProps<Props, $Data> = Props extends void
  ? $Data extends void
    ? void
    : $Data
  : $Data extends void
  ? Props
  : Props & $Data;

type CombineStateAndProps<
  State,
  Props,
  $Data,
  _CProps = CombineProps<Props, $Data>
> = State extends void
  ? _CProps extends void
    ? void
    : _CProps
  : _CProps extends void
  ? State
  : State & _CProps;

type IfVoid<MaybeVoid, VoidVal, NotVoidVal = MaybeVoid> = MaybeVoid extends void
  ? VoidVal
  : NotVoidVal;

//
//
//
// TABLE OPTS
//
//
//

export type Connected$Opts<$Data extends AnyObj | void> = $Data extends AnyObj
  ? {
      $: Stream<$Data>;
      // Null = no timeout, if not passed, uses RepeatingTimer default timeout
      timeout?: number | null;
      // Default 1 second
      refreshInterval?: number;
    }
  : undefined;

export type LoadProps<Props> = NoParamFn<MaybePromise<Props>>;

export type Payload$<State, Props> = Stream<
  Partial<{ state: State; ownProps: Props; connected$ChangeCount: number }>
>;

export type TableOpts<State, Props, $Data extends AnyObj | void> = {
  name: string;
  showSeparators?: boolean;
  fullscreen?: boolean;
  beforeEveryRender?: BeforeEveryRender;
  payload$: Payload$<State, Props>;
  syncedPersistedState?: Persisted<State>;
  connected$?: $Data extends AnyObj ? Connected$Opts<$Data> : never;
};

/** Everything in TableOpts except `payload$`, which is created within `getTable` */
export type GetTableOpts<State, Props, $Data extends AnyObj | void> = Pick<
  TableOpts<State, Props, $Data>,
  // Always present
  'name' | 'showSeparators' | 'fullscreen' | 'beforeEveryRender'
> &
  WithoutNever<{
    syncedPersistedState?: IfVoid<
      State,
      never,
      Required<TableOpts<State, Props, $Data>>['syncedPersistedState']
    >;
    connected$: IfVoid<
      $Data,
      never,
      Required<TableOpts<State, Props, $Data>>['connected$']
    >;
  }>;

//
//
//
// TABLE RETURN/API
//
//
//

export type SetState<State> = MapFn<Partial<State>, void>;

/** If null/void is returned, do not update state. */
export type UpdateState<State> = (
  updater: MapFn<State, State | null | void>
) => void;

type GetProps<Props, $Data> = NoParamFn<CombineProps<Props, $Data>>;

type Rerender = NoParamFn;

type GetState<State> = NoParamFn<State>;

type IsTableActive = NoParamFn<boolean>;

export type OnDismiss = NoParamFn;

export type OnConnected$Update<$Data> = MapFn<$Data, any>;

export type BeforeLoad = NoParamFn;

export type BeforeEveryRender = NoParamFn;

export type AfterPropsLoad = NoParamFn;

export type AfterFirstRender = NoParamFn;

export type OnSecondRender = NoParamFn;

export type RenderCount = 'NONE' | 'ONCE' | 'MANY';

export type GetRows = NoParamFn<ValidTableEl[]>;

//

export type ConnectPayload<State, Props, $Data> = WithoutNever<{
  state: IfVoid<State, never>;
  getProps: IfVoid<CombineProps<Props, $Data>, never, GetProps<Props, $Data>>;
  setState: IfVoid<State, never, SetState<State>>;
  updateState: IfVoid<State, never, UpdateState<State>>;
  rerender: Rerender;
}>;

export type Connect<State, Props, $Data> = <A extends any[]>(
  getTableEl: (
    connectPayload: ConnectPayload<State, Props, $Data>,
    ...ownArgs: A
  ) => ValidTableEl
) => (...ownArgs: A) => ValidTableEl;

export type SetRenderOpts<State, Props, $Data> = {
  defaultState?: State;
  loadProps?: LoadProps<Props>;
  render: GetRows;
  onDismiss?: OnDismiss;
  beforeLoad?: BeforeLoad;
  afterPropsLoad?: AfterPropsLoad;
  afterFirstRender?: AfterFirstRender;
  onSecondRender?: OnSecondRender;
  onConnected$Update?: OnConnected$Update<$Data>;
};

export type RenderOpts<State, Props, $Data> = WithoutNever<{
  defaultState?: IfVoid<
    State,
    never,
    Required<SetRenderOpts<State, Props, $Data>>['defaultState']
  >;
  loadProps: IfVoid<
    Props,
    never,
    Required<SetRenderOpts<State, Props, $Data>>['loadProps']
  >;
  afterPropsLoad?: IfVoid<
    Props,
    never,
    Required<SetRenderOpts<State, Props, $Data>>['afterPropsLoad']
  >;
  onConnected$Update?: IfVoid<
    $Data,
    never,
    Required<SetRenderOpts<State, Props, $Data>>['onConnected$Update']
  >;
}> &
  Omit_<
    SetRenderOpts<State, Props, $Data>,
    'defaultState' | 'loadProps' | 'afterPropsLoad' | 'onConnected$Update'
  >;

export type TableAPI<State, Props, $Data> = WithoutNever<{
  present: MapFn<RenderOpts<State, Props, $Data>, Promise<State>>;
  rerender: Rerender;
  connect: Connect<State, Props, $Data>;
  payload$: IfVoid<
    CombineStateAndProps<State, Props, $Data>,
    never,
    Payload$<State, Props>
  >;
  setState: IfVoid<State, never, SetState<State>>;
  updateState: IfVoid<State, never, UpdateState<State>>;
  getState: IfVoid<State, never, GetState<State>>;
  getProps: IfVoid<CombineProps<Props, $Data>, never, GetProps<Props, $Data>>;
  isTableActive: IsTableActive;
}>;
