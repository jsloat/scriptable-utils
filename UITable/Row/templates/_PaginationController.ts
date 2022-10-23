import { conditionalArr } from '../../../array';
import { range } from '../../../object';
import { ValidTableEl } from '../../types';
import _CycleTabs from './_CycleTabs';
import _HR from './_HR';
import _Spacer from './_Spacer';

type Opts<Entity> = {
  getEntities: NoParamFn<Entity[]>;
  getEntityRow: MapFn<Entity, ValidTableEl>;
  rerenderParent: NoParamFn;
  name: string;
  pageSize?: number;
};

/** stateKey -> page number */
const stateRegister: Map<string, number> = new Map();

const initState = (stateKey: string) =>
  !stateRegister.has(stateKey) && stateRegister.set(stateKey, 1);

const setPageNr = (stateKey: string, pageNr: number) =>
  stateRegister.set(stateKey, pageNr);

/** For given page #, returns the array index to start for pagination */
const getPaginationStartIndex = (pageNr: number, pageSize: number) =>
  pageSize * (pageNr - 1);

const getEntriesForPage = <E>(
  allEntities: E[],
  pageNr: number,
  pageSize: number
) => {
  const start = getPaginationStartIndex(pageNr, pageSize);
  return allEntities.slice(start, start + pageSize);
};

//

export default <E>({
  getEntities,
  getEntityRow,
  rerenderParent,
  name,
  pageSize = 20,
}: Opts<E>): ValidTableEl => {
  initState(name);
  const entities = getEntities();
  const labels = range(1, Math.ceil(entities.length / pageSize)).map(String);
  const shouldShowPagination = labels.length > 1;
  const currPage = stateRegister.get(name)!;
  const shownEntities = getEntriesForPage(entities, currPage, pageSize);

  const Controller =
    shouldShowPagination &&
    [
      _CycleTabs({
        labels,
        initValue: String(currPage),
        name,
        rerenderParent,
        onTabChange: ({ nextTab }) => setPageNr(name, parseInt(nextTab, 10)),
        subtle: true,
      }),
      _HR(),
    ].flat();

  const Padding = shouldShowPagination && [_Spacer(), _Spacer()].flat();

  const EntityRows = shownEntities.map(getEntityRow);

  return conditionalArr([Controller, Padding, ...EntityRows]).flat();
};
