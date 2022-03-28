import { countArrVal } from './array';
import { shortSwitch } from './flow';

const hexObjToColors = <T extends Record<string, string>>(hexObj: T) =>
  Object.entries(hexObj).reduce(
    (acc, [key, hex]) => ({ ...acc, [key]: new Color(hex) }),
    {} as { [key in keyof T]: Color }
  );

export const COLORS = hexObjToColors({
  white: 'ffffff',
  black: '000000',
  blueThemeHeader: '1d2c43',
  blueThemeLighterBlue: '152032',
  hellaGray: 'bebebe',
  sortaGray: 'f7f7f7',
  mediumGray: 'd8d8d8',
  blueThemeDarkGreen: '202938',
  AQDialogHeader: '232f3e',
  AQButtonBlue: '1573ff',
  AQCtaGreen: '6cbcb4',
  macStoriesCta: '53c8f0',
  atlassianBlue: '0051cd',
  atlassianOrange: 'FFAB00',
  mintyBlue: '6BCAFB', // Bear Dark Graphite - highlight color
  duskyGray: '131516', // Bear Dark Graphite - bg
  dimIvory: 'B1C5CD', // Bear Dark Graphite - text color
  dimGray: '2E3032', // Bear Dark Graphite - secondary text
  friendlyGreen: '61b0a5', // Ardoq website 2020
  friendlyPinkRed: 'f73c82', // Ardoq website 2020
  taskListWork: 'FF2968',
  taskListPersonal: '1BADF8',
  personalAndWorkAvg: 'a174b1',
  taskListDefaultGray: '5E5E5E',
  taskListShared: '61b0a6',
});

export const getDomainColor = (domain: Domain) =>
  shortSwitch(domain, {
    personal: COLORS.taskListPersonal,
    work: COLORS.taskListWork,
  });

export const getEntityArrColor = <T>(
  arr: T[],
  getDomain: (entity: T) => Domain | null
) => {
  const domains = arr.map(getDomain);
  const personal = countArrVal(domains, 'personal');
  const work = countArrVal(domains, 'work');
  if (personal && !work) return COLORS.taskListPersonal;
  if (work && !personal) return COLORS.taskListWork;
  return work || personal ? COLORS.personalAndWorkAvg : null;
};
