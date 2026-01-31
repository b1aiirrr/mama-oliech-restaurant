export type MenuCategory = 'fish' | 'accompaniments' | 'drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
}

export const menuItems: MenuItem[] = [
  // Fish
  {
    id: 'tilapia-whole',
    name: 'Fresh Lake Victoria Tilapia (Whole)',
    description: 'Whole tilapia from Lake Victoria, grilled or fried to perfection. Our signature dish.',
    price: 1200,
    category: 'fish',
  },
  {
    id: 'tilapia-half',
    name: 'Fresh Lake Victoria Tilapia (Half)',
    description: 'Half portion of our legendary tilapia. Perfect for one.',
    price: 650,
    category: 'fish',
  },
  {
    id: 'tilapia-fillet',
    name: 'Tilapia Fillet',
    description: 'Boneless tilapia fillet, grilled or fried. Light and flaky.',
    price: 750,
    category: 'fish',
  },
  {
    id: 'fish-stew',
    name: 'Fish Stew',
    description: 'Tilapia in a rich tomato and onion stew. Served with ugali.',
    price: 800,
    category: 'fish',
  },
  // Accompaniments
  {
    id: 'ugali',
    name: 'Ugali',
    description: 'Traditional Kenyan maize meal. The perfect partner for tilapia and sukuma.',
    price: 80,
    category: 'accompaniments',
  },
  {
    id: 'kachumbari',
    name: 'Kachumbari',
    description: 'Fresh tomato, onion, and cilantro salad. Refreshing with every bite.',
    price: 150,
    category: 'accompaniments',
  },
  {
    id: 'sukuma-wiki',
    name: 'Sukuma Wiki',
    description: 'Braised collard greens with tomatoes and onions. A Kenyan staple.',
    price: 120,
    category: 'accompaniments',
  },
  {
    id: 'chapati',
    name: 'Chapati',
    description: 'Soft, flaky flatbread. One or two with your fish.',
    price: 80,
    category: 'accompaniments',
  },
  {
    id: 'rice',
    name: 'Steamed Rice',
    description: 'Plain white rice. Ideal with fish stew.',
    price: 100,
    category: 'accompaniments',
  },
  {
    id: 'chips',
    name: 'Chips (French Fries)',
    description: 'Crispy golden fries. A crowd favourite.',
    price: 200,
    category: 'accompaniments',
  },
  // Drinks
  {
    id: 'water',
    name: 'Bottled Water',
    description: 'Still or sparkling. Stay refreshed.',
    price: 80,
    category: 'drinks',
  },
  {
    id: 'soda',
    name: 'Soft Drinks',
    description: 'Coca-Cola, Fanta, Sprite. Chilled.',
    price: 100,
    category: 'drinks',
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Juice',
    description: 'Mango, passion, or mixed. Freshly squeezed.',
    price: 250,
    category: 'drinks',
  },
  {
    id: 'tea',
    name: 'Chai (Kenyan Tea)',
    description: 'Hot tea with milk and ginger. Just like home.',
    price: 80,
    category: 'drinks',
  },
  {
    id: 'tusker',
    name: 'Tusker Lager',
    description: "Kenya's favourite beer. Cold and crisp.",
    price: 250,
    category: 'drinks',
  },
  {
    id: 'dawa',
    name: 'Dawa',
    description: 'Honey, lime, vodka. The legendary Kenyan cocktail.',
    price: 350,
    category: 'drinks',
  },
];
