export interface Card {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  card_labels: any;
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
  labels: { id: string; name: string; color: string }[];
}
