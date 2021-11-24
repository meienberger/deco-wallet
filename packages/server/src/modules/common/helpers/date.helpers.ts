import { format } from 'date-fns';

const ISOToDBDate = (isoDate: string): string => {
  return format(new Date(isoDate), 'yyyy-MM-dd kk:mm:ss.SSS');
};

export { ISOToDBDate };
