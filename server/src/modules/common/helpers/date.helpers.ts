import { format } from 'date-fns';

const ISOToDBDate = (isoDate: string): string => {
  const hours = format(new Date(isoDate), 'kk');

  return format(new Date(isoDate), `yyyy-MM-dd ${Number(hours) === 24 ? '00' : 'kk'}:mm:ss.SSS`);
};

export { ISOToDBDate };
