export interface Setting {
  _id?: string;
  value?: string;
  posterId: string;
  title: string;
  left: number;
  top: number;
  textAlign: string;
  fontFamily: { id: string; name: string; value: string };
  fontSize: number;
  fontColor: string;
}

export interface Poster {
  name: string;
  url: string;
  setting?: Setting[];
}

export interface Font {
  name: string;
  url: string;
}
