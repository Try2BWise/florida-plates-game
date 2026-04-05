export interface StatePackMeta {
  id: string;
  name: string;
  abbreviation: string;
  tagline: string;
  available: boolean;
}

export const stateRegistry: StatePackMeta[] = [
  { id: "arkansas", name: "Arkansas", abbreviation: "AR", tagline: "Arkansas Edition", available: true },
  { id: "florida", name: "Florida", abbreviation: "FL", tagline: "Florida Edition", available: true },
  { id: "mississippi", name: "Mississippi", abbreviation: "MS", tagline: "Mississippi Edition", available: true },
  { id: "missouri", name: "Missouri", abbreviation: "MO", tagline: "Missouri Edition", available: true },
];
