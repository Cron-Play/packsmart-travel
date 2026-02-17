
export type WeatherType = 'hot' | 'warm' | 'cool' | 'cold' | 'rainy';
export type TripType = 'business' | 'beach' | 'hiking' | 'city' | 'winter';

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  checked: boolean;
}

export interface TripTemplate {
  id: string;
  name: string;
  days: number;
  weather: WeatherType;
  tripType: TripType;
  items: PackingItem[];
  createdAt: string;
}

export interface TripParams {
  days: number;
  weather: WeatherType;
  tripType: TripType;
}
