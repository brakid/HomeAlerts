export interface Data<T> {
  timestamp: number,
  data: T,
};

export interface Status {
  webcam: Data<string>,
  isAtHome: Data<boolean>,
  temperature: Data<number>,
};