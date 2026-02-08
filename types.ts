
export type WineType = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Dessert';

export interface Wine {
  id: string;
  name: string;
  producer: string;
  varietal: string;
  vintage: string;
  region: string;
  type: WineType;
  quantity: number;
  valuation?: number;
  notes?: string;
  addedAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
