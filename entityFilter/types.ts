import { SFSymbolKey } from '../sfSymbols';
import { RenderOpts } from '../UITable/types';
import { SelectableEntityBrowserOpts } from '../views/selectableEntityBrowser';

export type AppliedFilterState = 'INCLUDE' | 'EXCLUDE' | null;

export type Filter<E> = {
  label: string;
  icon?: SFSymbolKey;
  filterCagtegory: string;
  // Should the entity be included if its state is `INCLUDE`?
  includeEntity: Predicate<E>;
};

export type AppliedFilter = Omit_<Filter<any>, 'includeEntity'> & {
  state: AppliedFilterState;
};

export type AllFilters<E> = {
  [category: string]: Filter<E>[];
};

export type LoadedFilterCounts = {
  [category: string]: { [filterLabel: string]: number };
};

export type $Props<E> = {
  allEntities: E[];
  filteredEntities: E[];
  filterCounts: LoadedFilterCounts;
};

export type Opts<E> = {
  title?: string;
  getEntities: NoParamFn<MaybePromise<E[]>>;
  filters: AllFilters<E>;
  initAppliedFilters?: AppliedFilter[];
  viewEntityOpts: Omit_<
    SelectableEntityBrowserOpts<E>,
    'beforeLoad' | 'onClose' | 'getEntities' | 'getHeaderOpts' | 'getCustomCTAs'
  >;
} & Pick<RenderOpts<any, any, any>, 'beforeLoad' | 'onDismiss'>;

export type State = {
  appliedFilters: AppliedFilter[];
  collapsedFilterCategories: string[];
};

export type Props<E> = Opts<E>;
