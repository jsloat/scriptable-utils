import {
  Connected$Opts,
  GetTableOpts,
  Payload$,
  TableAPI,
  Connect,
  SetState,
  UpdateState,
  ConnectPayload,
  CombineProps,
} from './types';
import { Table } from './TableClass';
import { Stream } from '../streams';

/*

TABLE

- Static props (those passed in explicitly) are permanent -- they are never
  recalculated after the initial load and render.

- On the topic of props, a connected stream can be passed in directly. Its data
  will be combined with props. When the stream updates, the table is rerendered,
  and its props will contain the updated stream data.

- As described above, props will never reload. `setState` rerenders the view
  with updated state, but no changes to props occur (unless as a side-effect to
  a connected stream).

- `updateState`, which functions like `setState`, but provides a more
  self-contained method to update with a reducer callback.

- Option to keep table state in sync with a persisted file of the same type.

- `beforeEveryRender` to avoid stuffing callbacks into the render
  function

*/

const getTable = <
  State extends AnyObj | void = void,
  Props extends AnyObj | void = void,
  $Data extends AnyObj | void = void
>(
  tableOpts: GetTableOpts<State, Props, $Data>
) => {
  const payload$: Payload$<State, Props> = new Stream({
    name: `table: ${tableOpts.name}`,
    defaultState: {},
  });
  const table = new Table<State, Props, $Data>({ ...tableOpts, payload$ });

  const present: TableAPI<State, Props, $Data>['present'] = renderOpts => {
    table.setRenderOpts(renderOpts);
    return table.renderTable();
  };

  const getState = () => {
    const { state } = payload$.getData();
    if (!state) throw new Error('Getting state with no state present');
    return state;
  };

  const getProps = () => {
    const { ownProps } = payload$.getData();
    // @ts-ignore A casualty of dynamic opts based on typing...
    const $: Connected$Opts<$Data> = tableOpts.connected$;
    const streamData = $?.$.getData();
    const combinedProps = { ...ownProps, ...streamData } as CombineProps<
      Props,
      $Data
    >;
    if (!combinedProps) throw new Error('Getting props with no props present');
    return combinedProps;
  };

  const setState: SetState<State> = partialState =>
    table.setState(partialState);

  const updateState: UpdateState<State> = updater => {
    const updatedState = updater(getState());
    if (updatedState === null || updatedState === undefined) return;
    setState(updatedState);
  };

  const rerender = () => table.renderTable();

  const connect: Connect<State, Props, $Data> =
    getTableEl =>
    (...ownArgs) =>
      getTableEl(
        {
          state: table.has.state ? getState() : undefined,
          getProps: table.has.props ? getProps : undefined,
          setState,
          updateState,
          rerender,
        } as unknown as ConnectPayload<State, Props, $Data>,
        ...ownArgs
      );

  const api: TableAPI<State, Props, $Data> = {
    present,
    rerender,
    connect,
    // @ts-ignore
    payload$,
    setState,
    updateState,
    getState,
    getProps,
    isTableActive: () => table.isTableActive(),
  };
  return api;
};

export default getTable;
