import { format } from 'date-fns';

const ISOToDBDate = (isoDate: string): string => {
  const hours = format(new Date(isoDate), 'kk');

  return format(new Date(isoDate), `yyyy-MM-dd ${Number(hours) === 24 ? '00' : 'kk'}:mm:ss.SSS`);
};

const dateToUTC = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
};

export { ISOToDBDate, dateToUTC };
