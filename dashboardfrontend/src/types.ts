export interface Data<T> {
  timestamp: number,
  data: T,
};

export interface Status {
  webcam: Data<string>,
  isAtHome: Data<boolean>,
  temperatures: Data<number>[],
};

export interface DataProps<T> {
  data: Data<T>[]
};

export interface SingleDataProps<T> {
  data: Data<T>
};