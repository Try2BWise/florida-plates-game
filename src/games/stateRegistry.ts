export interface StatePackMeta {
  id: string;
  name: string;
  abbreviation: string;
  tagline: string;
  available: boolean;
}

export const stateRegistry: StatePackMeta[] = [
  { id: "arkansas", name: "Arkansas", abbreviation: "AR", tagline: "The Natural State", available: true },
  { id: "florida", name: "Florida", abbreviation: "FL", tagline: "The Sunshine State", available: true },
  { id: "georgia", name: "Georgia", abbreviation: "GA", tagline: "The Peach State", available: true },
  { id: "kansas", name: "Kansas", abbreviation: "KS", tagline: "The Sunflower State", available: true },
  { id: "kentucky", name: "Kentucky", abbreviation: "KY", tagline: "The Bluegrass State", available: true },
  { id: "mississippi", name: "Mississippi", abbreviation: "MS", tagline: "The Magnolia State", available: true },
  { id: "missouri", name: "Missouri", abbreviation: "MO", tagline: "The Show-Me State", available: true },
  { id: "tennessee", name: "Tennessee", abbreviation: "TN", tagline: "The Volunteer State", available: true },
];
