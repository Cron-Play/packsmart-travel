
export type WeatherType = 'hot' | 'warm' | 'cool' | 'cold' | 'rainy';
export type TripType = 'business' | 'beach' | 'hiking' | 'city' | 'winter';
export type TravelType = 'local' | 'international';
export type PackingStyle = 'light' | 'normal' | 'heavy';

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
  travelType: TravelType;
  packingStyle: PackingStyle;
  city?: string;
  items: PackingItem[];
  createdAt: string;
}

export interface TripParams {
  days: number;
  weather: WeatherType;
  tripType: TripType;
  travelType: TravelType;
  packingStyle: PackingStyle;
  city?: string;
}
