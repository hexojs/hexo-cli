export interface Command {
  name: string;
  desc: string;
  description?: string;
}

export interface Options {
  desc?: string;
  description?: string;
  usage?: string;
  arguments?: Command[];
  options?: Command[];
  commands?: Command[];
}

export interface Callback {
  (args?: object): any;
  options?: Options;
  desc?: string;
  description?: string;
}

export interface Store {
  [key: string]: Callback;
}

export interface Alias {
  [key: string]: string;
}
