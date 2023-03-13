export interface Data<T> {
  timestamp: number,
  data: T,
};

export interface Status {
  webcam: Data<string>,
  isAtHome: Data<boolean>,
  temperature: Data<number>,
};

export interface DataProps<T> {
  data: Data<T>[]
};

export interface SingleDataProps<T> {
  data: Data<T>
};

export interface InternalState {
  image: Data<string>,
  temperatures: Data<number>[],
  isAtHome: Data<boolean>,
};