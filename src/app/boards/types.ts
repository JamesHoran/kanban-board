export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface CardLabel {
  card_id: string;
  label: Label;
}

export interface Card {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  card_labels: CardLabel[];
}

export interface Column {
  id: string;
  position: number;
  name: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  labels: Label[];
}
