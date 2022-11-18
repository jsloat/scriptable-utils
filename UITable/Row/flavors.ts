import { getTypesafeArrOfType } from '../../array';
import { getColors, getDynamicColor } from '../../colors';
import { isString } from '../../common';
import { getSimpleSorter } from '../../sortObjects';
import { H1Consts } from './templates/consts';
import { Flavor } from './types';

const flav: Identity<Flavor> = f => f;

const {
  deep_blue,
  domain_personal,
  domain_work,
  gray0,
  gray2,
  gray4,
  gray8,
  green_l4,
  green,
  primaryTextColor,
  red_d1,
  red_l4,
  yellow_d2,
  yellow_l3,
} = getColors();

const serene = flav({ bgColor: deep_blue, color: gray2, fadeWith: gray4 });
const transparent = flav({ noBorder: true });

const h1FlavorOpts = { fontConstructor: H1Consts.fontConstructor };

const flavors = {
  default: flav({
    bgColor: getDynamicColor(gray0, gray8),
    color: primaryTextColor,
  }),
  defaultNoBorder: flav({
    bgColor: getDynamicColor(gray0, gray8),
    noBorder: true,
  }),
  happy: flav({ bgColor: green_l4, color: green, fadeWith: 'lighten' }),
  warning: flav({ bgColor: yellow_l3, color: yellow_d2, fadeWith: 'lighten' }),
  danger: flav({ bgColor: red_l4, color: red_d1, fadeWith: 'lighten' }),
  transparent,
  transparentH1: flav({ ...transparent, ...h1FlavorOpts }),
  transparentWithBorder: flav({}),
  serene,
  sereneH1: flav({ ...serene, ...h1FlavorOpts, noBorder: true }),
  domainPersonal: flav({ color: domain_personal }),
  domainWork: flav({ color: domain_work }),
};

export const parseFlavor = (f: Flavor | FlavorOption = 'default') =>
  isString(f) ? flavors[f] : f;

export type FlavorOption = keyof typeof flavors;

//
// Sorting
//

const flavorBoldnessDesc = getTypesafeArrOfType<FlavorOption>({
  sereneH1: null,
  transparentH1: null,
  danger: null,
  serene: null,
  happy: null,
  warning: null,
  default: null,
  domainWork: null,
  domainPersonal: null,
  transparentWithBorder: null,
  defaultNoBorder: null,
  transparent: null,
});

const sortByBoldnessDesc = getSimpleSorter(
  ...flavorBoldnessDesc.map(
    sortedKey => (keyToSort: FlavorOption) => keyToSort === sortedKey
  )
);

/** Used to determine which button's border in a stack should take priority as
 * compared to its neighbor. */
export const whichFlavorIsBolder = (
  above: Flavor | FlavorOption = 'default',
  below: Flavor | FlavorOption = 'default'
): Flavor => {
  // If either option is a custom flavor object, don't attempt to compare.
  if (!(isString(above) && isString(below))) return parseFlavor(above);
  const sortedOpts = [above, below].sort(sortByBoldnessDesc);
  return parseFlavor(sortedOpts[0]!);
};
