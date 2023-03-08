export interface IsAtHome {
    value: boolean
  };
  
  export  interface Temperature {
    value: number
  };
  
  export  interface Status {
    webcam: string,
    isAtHome: boolean,
    temperature: number
  };