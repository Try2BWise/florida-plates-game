export interface StatePackMeta {
  id: string;
  name: string;
  abbreviation: string;
  tagline: string;
  available: boolean;
}

export const stateRegistry: StatePackMeta[] = [
  { id: "florida", name: "Florida", abbreviation: "FL", tagline: "Florida Edition", available: true },
  { id: "mississippi", name: "Mississippi", abbreviation: "MS", tagline: "Mississippi Edition", available: true },
];
