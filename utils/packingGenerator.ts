
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
    'Passport/ID',
    'Travel tickets',
    'Hotel confirmation',
    'Travel insurance',
  ],
  misc: [
    'Wallet',
    'Keys',
    'Medications',
    'Reusable water bottle',
  ],
};

// Weather-specific items
const weatherItems = {
  hot: {
    clothing: ['T-shirts', 'Shorts', 'Sandals', 'Sunglasses', 'Hat', 'Swimsuit'],
    misc: ['Sunscreen (extra)', 'Aloe vera gel', 'Insect repellent'],
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
    clothing: ['Thermal underwear', 'Warm sweaters', 'Winter coat', 'Boots', 'Warm hat', 'Gloves', 'Scarf'],
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
    clothing: ['Swimsuits (2-3)', 'Beach cover-up', 'Flip-flops', 'Beach hat'],
    misc: ['Beach towel', 'Beach bag', 'Snorkel gear', 'Waterproof phone case', 'Book/magazine'],
  },
  hiking: {
    clothing: ['Hiking boots', 'Moisture-wicking shirts', 'Hiking pants', 'Fleece jacket', 'Rain gear'],
    misc: ['Backpack', 'First aid kit', 'Map/GPS', 'Flashlight', 'Multi-tool', 'Snacks', 'Water purification'],
    tech: ['GPS device', 'Camera'],
  },
  city: {
    clothing: ['Comfortable walking shoes', 'Casual outfits', 'Light jacket', 'Day bag'],
    misc: ['City map', 'Guidebook', 'Camera', 'Reusable shopping bag'],
  },
  winter: {
    clothing: ['Thermal layers', 'Ski jacket', 'Snow pants', 'Winter boots', 'Warm hat', 'Gloves', 'Scarf', 'Wool socks'],
    misc: ['Ski goggles', 'Hand warmers', 'Thermos', 'Lip balm', 'Heavy moisturizer'],
  },
};

// Calculate clothing quantities based on trip duration
function calculateClothingQuantity(days: number, itemName: string): string {
  const dailyItems = ['Underwear', 'Socks'];
  const multiDayItems = ['T-shirts', 'Shirts', 'Pants'];
  
  if (dailyItems.some(item => itemName.includes(item))) {
    const quantity = Math.min(days + 1, 10);
    const quantityText = `${quantity}`;
    return `${itemName} (${quantityText})`;
  }
  
  if (multiDayItems.some(item => itemName.includes(item))) {
    const quantity = Math.ceil(days / 2) + 1;
    const quantityText = `${quantity}`;
    return `${itemName} (${quantityText})`;
  }
  
  return itemName;
}

// Generate packing list based on trip parameters
export function generatePackingList(params: TripParams): PackingItem[] {
  const items: PackingItem[] = [];
  const { days, weather, tripType } = params;

  // Add base items
  Object.entries(baseItems).forEach(([category, itemList]) => {
    itemList.forEach(itemName => {
      const name = category === 'clothing' ? calculateClothingQuantity(days, itemName) : itemName;
      items.push({
        id: generateId(),
        name,
        category,
        checked: false,
      });
    });
  });

  // Add weather-specific items
  const weatherSpecific = weatherItems[weather];
  if (weatherSpecific) {
    Object.entries(weatherSpecific).forEach(([category, itemList]) => {
      itemList.forEach(itemName => {
        const name = category === 'clothing' ? calculateClothingQuantity(days, itemName) : itemName;
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
      itemList.forEach(itemName => {
        items.push({
          id: generateId(),
          name: itemName,
          category,
          checked: false,
        });
      });
    });
  }

  // Remove duplicates
  const uniqueItems = items.filter((item, index, self) =>
    index === self.findIndex((t) => t.name === item.name && t.category === item.category)
  );

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
