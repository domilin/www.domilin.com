export interface Window {
  JSEncrypt: new () => {
    setKey: (publicKey: string) => void;
    encrypt: (content: string) => string;
  };
}

export type anyType = any;

declare global {
  interface Window {
    reduxStore: anyType;
  }
}

export interface BaseJson {
  [Key: string]: anyType;
}

export type BaseType = string | number | boolean;

export interface FormOnFinishStore {
  [name: string]: anyType;
}
