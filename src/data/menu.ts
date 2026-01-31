export type MenuCategory = 'fish' | 'accompaniments' | 'drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
}

export const menuItems: MenuItem[] = [
  // Fish
  {
    id: 'tilapia-whole',
    name: 'Fresh Lake Victoria Tilapia (Whole)',
    description: 'Whole tilapia from Lake Victoria, grilled or fried to perfection. Our signature dish.',
    price: 1200,
    category: 'fish',
    image: '/menu/tilapia-whole.png',
  },
  {
    id: 'tilapia-half',
    name: 'Fresh Lake Victoria Tilapia (Half)',
    description: 'Half portion of our legendary tilapia. Perfect for one.',
    price: 650,
    category: 'fish',
    image: '/menu/tilapia-half.png',
  },
  {
    id: 'tilapia-fillet',
    name: 'Tilapia Fillet',
    description: 'Boneless tilapia fillet, grilled or fried. Light and flaky.',
    price: 750,
    category: 'fish',
    image: '/menu/tilapia-fillet.png',
  },
  {
    id: 'fish-stew',
    name: 'Fish Stew',
    description: 'Tilapia in a rich tomato and onion stew. Served with ugali.',
    price: 800,
    category: 'fish',
    image: '/menu/fish-stew.png',
  },
  // Accompaniments
  {
    id: 'ugali',
    name: 'Ugali',
    description: 'Traditional Kenyan maize meal. The perfect partner for tilapia and sukuma.',
    price: 80,
    category: 'accompaniments',
    image: '/menu/ugali.png',
  },
  {
    id: 'kachumbari',
    name: 'Kachumbari',
    description: 'Fresh tomato, onion, and cilantro salad. Refreshing with every bite.',
    price: 150,
    category: 'accompaniments',
    image: '/menu/kachumbari.png',
  },
  {
    id: 'sukuma-wiki',
    name: 'Sukuma Wiki',
    description: 'Braised collard greens with tomatoes and onions. A Kenyan staple.',
    price: 120,
    category: 'accompaniments',
    image: '/menu/sukuma-wiki.png',
  },
  {
    id: 'chapati',
    name: 'Chapati',
    description: 'Soft, flaky flatbread. One or two with your fish.',
    price: 80,
    category: 'accompaniments',
    image: '/menu/chapati.png',
  },
  {
    id: 'rice',
    name: 'Steamed Rice',
    description: 'Plain white rice. Ideal with fish stew.',
    price: 100,
    category: 'accompaniments',
    image: '/menu/rice.png',
  },
  {
    id: 'chips',
    name: 'Chips (French Fries)',
    description: 'Crispy golden fries. A crowd favourite.',
    price: 200,
    category: 'accompaniments',
    image: '/menu/chips.png',
  },
  // Drinks
  {
    id: 'water',
    name: 'Bottled Water',
    description: 'Still or sparkling. Stay refreshed.',
    price: 80,
    category: 'drinks',
    image: '/menu/water.png',
  },
  {
    id: 'soda',
    name: 'Soft Drinks',
    description: 'Coca-Cola, Fanta, Sprite. Chilled.',
    price: 100,
    category: 'drinks',
    image: '/menu/soda.png',
  },
  {
    id: 'fresh-juice',
    name: 'Fresh Juice',
    description: 'Mango, passion, or mixed. Freshly squeezed.',
    price: 250,
    category: 'drinks',
    image: '/menu/fresh-juice.png',
  },
  {
    id: 'tea',
    name: 'Chai (Kenyan Tea)',
    description: 'Hot tea with milk and ginger. Just like home.',
    price: 80,
    category: 'drinks',
    image: '/menu/tea.png',
  },
  {
    id: 'tusker',
    name: 'Tusker Lager',
    description: "Kenya's favourite beer. Cold and crisp.",
    price: 250,
    category: 'drinks',
    image: '/menu/tusker.png',
  },
  {
    id: 'dawa',
    name: 'Dawa',
    description: 'Honey, lime, vodka. The legendary Kenyan cocktail.',
    price: 350,
    category: 'drinks',
    image: '/menu/tilapia-whole.png',
  },
];
