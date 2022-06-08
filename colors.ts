import { countArrVal } from './array';
import { shortSwitch } from './flow';

const c = ([hex]: TemplateStringsArray) => new Color(hex!);

export const white = c`ffffff`;
export const black = c`000000`;

export const grayMinus3 = c`fdfdfd`;
export const grayMinus2 = c`fcfcfc`;
export const grayMinus1 = c`fbfbfb`;
export const gray0 = c`efefef`;
export const gray1 = c`d8d8d8`;
export const gray2 = c`c2c2c2`;
export const gray3 = c`adadad`;
export const gray4 = c`979797`;
export const gray5 = c`6c6c6c`;
export const gray6 = c`414141`;
export const gray7 = c`2b2b2b`;
export const gray8 = c`161616`;

// Naming convention:
//  {color}_d1 = a darker shade by degree 1
//  {color}_l1 = a lighter shade by degree 1
// https://coolors.co/253031-315659-2978a0-bcab79-c6e0ff

export const red_l4 = c`e3949e`;
export const red_l3 = c`da717e`;
export const red_l2 = c`d14d5e`;
export const red_l1 = c`c33245`;
export const red = c`a12a3a`;
export const red_d1 = c`82212e`;
export const red_d2 = c`611923`;

export const yellow_l3 = c`eae5d6`;
export const yellow_l2 = c`ddd4bb`;
export const yellow_l1 = c`cfc3a0`;
export const yellow = c`bcab79`;
export const yellow_d1 = c`b4a16a`;
export const yellow_d2 = c`a38f52`;

export const dark_green_l2 = c`4f6769`;
export const dark_green_l1 = c`3d5051`;
export const dark_green = c`253031`;
export const dark_green_d1 = c`1a2223`;
export const dark_green_d2 = c`121717`;

export const green_l4 = c`96babd`;
export const green_l3 = c`73a3a7`;
export const green_l2 = c`508c91`;
export const green_l1 = c`417376`;
export const green = c`315659`;
export const green_d1 = c`244042`;
export const green_d2 = c`162627`;

export const deep_blue_l2 = c`4da5d1`;
export const deep_blue_l1 = c`3292c3`;
export const deep_blue = c`2978a0`;
export const deep_blue_d1 = c`216282`;
export const deep_blue_d2 = c`194961`;

export const blue_l1 = c`ebf4ff`;
export const blue = c`c6e0ff`;
export const blue_d1 = c`add2ff`;
export const blue_d2 = c`85bcff`;

// Color aliases

export const domain_personal = deep_blue;
export const domain_work = yellow;
export const domain_mix = c`73928D`;
export const danger = red_l1;
export const success = green_l2;
export const bg = Color.dynamic(white, black);
export const primaryTextColor = Color.dynamic(gray8, gray1);
export const secondaryTextColor = Color.dynamic(gray6, gray3);
export const hr = Color.dynamic(gray0, gray7);

export const getDomainColor = (domain: Domain) =>
  shortSwitch(domain, { personal: domain_personal, work: domain_work });

export const getEntityArrColor = <T>(
  arr: T[],
  getDomain: (entity: T) => Domain | null
) => {
  const domains = arr.map(getDomain);
  const personal = countArrVal(domains, 'personal');
  const work = countArrVal(domains, 'work');
  if (personal && !work) return domain_personal;
  if (work && !personal) return domain_work;
  return work || personal ? domain_mix : null;
};
