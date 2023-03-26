export interface IsAtHome {
  value: boolean
};
  
export  interface Temperature {
  value: number
};

export interface Data<T> {
  timestamp: number,
  data: T,
};

export interface Status {
  webcam: Data<string>,
  isAtHome: Data<boolean>,
  temperatures: Data<number>[],
};