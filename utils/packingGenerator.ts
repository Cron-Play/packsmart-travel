
import { TripParams, PackingItem } from '@/types/packing';

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Base items that everyone needs
const baseItems = {
  clothing: [
    'Underwear',
    'Socks',
    'Pajamas',
  ],
  toiletries: [
    'Toothbrush',
    'Toothpaste',
    'Deodorant',
    'Shampoo',
    'Body wash',
    'Sunscreen',
  ],
  tech: [
    'Phone charger',
    'Power bank',
    'Headphones',
  ],
  travelDocs: [
    'ID/Driver\'s License',
    'Travel tickets',
    'Hotel confirmation',
  ],
  misc: [
    'Wallet',
    'Keys',
    'Medications',
    'Reusable water bottle',
  ],
};

// International travel specific items
const internationalItems = {
  travelDocs: [
    'Passport',
    'Visa documents',
    'Travel insurance',
    'Vaccination records',
    'Emergency contacts',
    'Copies of important documents',
  ],
  tech: [
    'Universal power adapter',
    'Currency converter app',
  ],
  misc: [
    'Foreign currency',
    'Language translation app/book',
    'International SIM card',
  ],
};

// Weather-specific items
const weatherItems = {
  hot: {
    clothing: ['T-shirts', 'Shorts', 'Sandals', 'Sunglasses', 'Hat', 'Swimsuit', 'Light dress/shirt'],
    misc: ['Sunscreen (extra)', 'Aloe vera gel', 'Insect repellent', 'Cooling towel'],
  },
  warm: {
    clothing: ['T-shirts', 'Light pants', 'Sneakers', 'Light jacket', 'Sunglasses'],
    misc: ['Light scarf'],
  },
  cool: {
    clothing: ['Long-sleeve shirts', 'Jeans', 'Sweater', 'Jacket', 'Closed shoes'],
    misc: ['Light gloves', 'Scarf'],
  },
  cold: {
    clothing: ['Thermal underwear', 'Warm sweaters', 'Winter coat', 'Boots', 'Warm hat', 'Gloves', 'Scarf', 'Wool socks'],
    misc: ['Hand warmers', 'Lip balm', 'Moisturizer'],
  },
  rainy: {
    clothing: ['Rain jacket', 'Waterproof shoes', 'Extra socks'],
    misc: ['Umbrella', 'Waterproof bag', 'Plastic bags for wet items'],
  },
};

// Trip type-specific items
const tripTypeItems = {
  business: {
    clothing: ['Dress shirts', 'Dress pants/skirt', 'Blazer', 'Dress shoes', 'Belt', 'Tie/accessories'],
    tech: ['Laptop', 'Laptop charger', 'Business cards', 'Notebook', 'Pen'],
    misc: ['Portfolio/briefcase', 'Presentation materials'],
  },
  beach: {
    clothing: ['Swimsuits (2-3)', 'Beach cover-up', 'Flip-flops', 'Beach hat', 'Sarong'],
    misc: ['Beach towel', 'Beach bag', 'Snorkel gear', 'Waterproof phone case', 'Book/magazine'],
  },
  hiking: {
    clothing: ['Hiking boots', 'Moisture-wicking shirts', 'Hiking pants', 'Fleece jacket', 'Rain gear', 'Hiking socks'],
    misc: ['Backpack', 'First aid kit', 'Map/GPS', 'Flashlight', 'Multi-tool', 'Snacks', 'Water purification', 'Compass'],
    tech: ['GPS device', 'Camera'],
  },
  city: {
    clothing: ['Comfortable walking shoes', 'Casual outfits', 'Light jacket', 'Stylish accessories'],
    misc: ['City map', 'Guidebook', 'Camera', 'Reusable shopping bag', 'Day backpack', 'Portable phone charger'],
  },
  winter: {
    clothing: ['Thermal layers', 'Ski jacket', 'Snow pants', 'Winter boots', 'Warm hat', 'Gloves', 'Scarf', 'Wool socks'],
    misc: ['Ski goggles', 'Hand warmers', 'Thermos', 'Lip balm', 'Heavy moisturizer'],
  },
};

// City-specific recommendations (for city trips)
const cityRecommendations: Record<string, string[]> = {
  // European cities
  'paris': ['Stylish walking shoes', 'Scarf', 'Museum pass', 'Metro card'],
  'london': ['Umbrella', 'Oyster card', 'Layers for weather', 'Comfortable walking shoes'],
  'rome': ['Comfortable walking shoes', 'Modest clothing for churches', 'Hat', 'Water bottle'],
  'barcelona': ['Beach gear', 'Comfortable sandals', 'Sunscreen', 'Metro card'],
  'amsterdam': ['Rain jacket', 'Comfortable walking shoes', 'Bike lock', 'Museum card'],
  
  // Asian cities
  'tokyo': ['Comfortable walking shoes', 'Cash (yen)', 'Pocket WiFi', 'IC card for trains'],
  'bangkok': ['Light breathable clothing', 'Modest temple wear', 'Insect repellent', 'Sunscreen'],
  'singapore': ['Light clothing', 'Umbrella', 'Comfortable walking shoes', 'EZ-Link card'],
  'hong kong': ['Layers', 'Octopus card', 'Comfortable shoes', 'Umbrella'],
  'dubai': ['Modest clothing', 'Sunscreen', 'Hat', 'Light scarf'],
  
  // American cities
  'new york': ['Comfortable walking shoes', 'MetroCard', 'Layers', 'Backpack'],
  'los angeles': ['Sunglasses', 'Sunscreen', 'Car essentials', 'Light layers'],
  'san francisco': ['Layers', 'Light jacket', 'Comfortable walking shoes', 'Clipper card'],
  'chicago': ['Weather-appropriate layers', 'Comfortable shoes', 'Ventra card', 'Wind-resistant jacket'],
  'miami': ['Beach gear', 'Sunscreen', 'Light clothing', 'Sunglasses'],
  
  // Other major cities
  'sydney': ['Sunscreen', 'Beach gear', 'Opal card', 'Hat'],
  'melbourne': ['Layers', 'Umbrella', 'Comfortable shoes', 'Myki card'],
  'toronto': ['Weather layers', 'Presto card', 'Comfortable shoes', 'Jacket'],
  'vancouver': ['Rain jacket', 'Layers', 'Compass card', 'Hiking gear'],
};

// Calculate clothing quantities based on trip duration and packing style
function calculateClothingQuantity(days: number, itemName: string, packingStyle: 'light' | 'normal' | 'heavy'): string {
  const dailyItems = ['Underwear', 'Socks'];
  const multiDayItems = ['T-shirts', 'Shirts', 'Pants', 'Shorts'];
  
  let quantity = 1;
  
  if (dailyItems.some(item => itemName.includes(item))) {
    if (packingStyle === 'light') {
      quantity = Math.min(Math.ceil(days / 2) + 1, 5);
    } else if (packingStyle === 'normal') {
      quantity = Math.min(days + 1, 8);
    } else {
      quantity = Math.min(days + 2, 12);
    }
  } else if (multiDayItems.some(item => itemName.includes(item))) {
    if (packingStyle === 'light') {
      quantity = Math.ceil(days / 3) + 1;
    } else if (packingStyle === 'normal') {
      quantity = Math.ceil(days / 2) + 1;
    } else {
      quantity = Math.ceil(days / 1.5) + 1;
    }
  }
  
  const quantityText = `${quantity}`;
  return `${itemName} (${quantityText})`;
}

// Filter items based on packing style
function filterByPackingStyle(items: string[], packingStyle: 'light' | 'normal' | 'heavy'): string[] {
  if (packingStyle === 'light') {
    return items.slice(0, Math.ceil(items.length * 0.6));
  } else if (packingStyle === 'heavy') {
    return items;
  }
  return items.slice(0, Math.ceil(items.length * 0.8));
}

// Get city-specific items
function getCitySpecificItems(city?: string): string[] {
  if (!city) return [];
  
  const cityLower = city.toLowerCase().trim();
  const recommendations = cityRecommendations[cityLower];
  
  if (recommendations) {
    return recommendations;
  }
  
  return [];
}

// Generate packing list based on trip parameters
export function generatePackingList(params: TripParams): PackingItem[] {
  const items: PackingItem[] = [];
  const { days, weather, tripType, travelType, packingStyle, city } = params;

  console.log('Generating packing list with params:', params);

  // Add base items
  Object.entries(baseItems).forEach(([category, itemList]) => {
    const filteredItems = filterByPackingStyle(itemList, packingStyle);
    filteredItems.forEach(itemName => {
      const name = category === 'clothing' ? calculateClothingQuantity(days, itemName, packingStyle) : itemName;
      items.push({
        id: generateId(),
        name,
        category,
        checked: false,
      });
    });
  });

  // Add international travel items
  if (travelType === 'international') {
    Object.entries(internationalItems).forEach(([category, itemList]) => {
      const filteredItems = filterByPackingStyle(itemList, packingStyle);
      filteredItems.forEach(itemName => {
        items.push({
          id: generateId(),
          name: itemName,
          category,
          checked: false,
        });
      });
    });
  }

  // Add weather-specific items
  const weatherSpecific = weatherItems[weather];
  if (weatherSpecific) {
    Object.entries(weatherSpecific).forEach(([category, itemList]) => {
      const filteredItems = filterByPackingStyle(itemList, packingStyle);
      filteredItems.forEach(itemName => {
        const name = category === 'clothing' ? calculateClothingQuantity(days, itemName, packingStyle) : itemName;
        items.push({
          id: generateId(),
          name,
          category,
          checked: false,
        });
      });
    });
  }

  // Add trip type-specific items
  const tripSpecific = tripTypeItems[tripType];
  if (tripSpecific) {
    Object.entries(tripSpecific).forEach(([category, itemList]) => {
      const filteredItems = filterByPackingStyle(itemList, packingStyle);
      filteredItems.forEach(itemName => {
        items.push({
          id: generateId(),
          name: itemName,
          category,
          checked: false,
        });
      });
    });
  }

  // Add city-specific items for city trips
  if (tripType === 'city' && city) {
    const cityItems = getCitySpecificItems(city);
    if (cityItems.length > 0) {
      cityItems.forEach(itemName => {
        items.push({
          id: generateId(),
          name: itemName,
          category: 'misc',
          checked: false,
        });
      });
    }
  }

  // Remove duplicates
  const uniqueItems = items.filter((item, index, self) =>
    index === self.findIndex((t) => t.name === item.name && t.category === item.category)
  );

  console.log('Generated unique items count:', uniqueItems.length);
  return uniqueItems;
}

// Get category display name
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    clothing: 'Clothing',
    toiletries: 'Toiletries',
    tech: 'Tech & Electronics',
    travelDocs: 'Travel Documents',
    misc: 'Miscellaneous',
  };
  return categoryNames[category] || category;
}

// Group items by category
export function groupItemsByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);
}
