export const categories = ['Mops', 'Wipers', 'Cleaning Products'];

export const demoProducts = [
  {
    id: 'spin-mop-deluxe',
    name: 'King Spin Mop Deluxe',
    category: 'Mops',
    description:
      '360 degree spin mop with stainless steel wringer, microfiber refills, and easy-drain bucket for daily home cleaning.',
    pricePaise: 89900,
    mrpPaise: 129900,
    stock: 38,
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['360 degree rotating head', 'Microfiber refill', 'Stainless steel handle'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-06-01T05:00:00.000Z'
  },
  {
    id: 'flat-mop-pro',
    name: 'King Flat Mop Pro',
    category: 'Mops',
    description:
      'Slim flat mop for corners, walls, and under-furniture cleaning with a washable microfiber pad.',
    pricePaise: 54900,
    mrpPaise: 79900,
    stock: 51,
    images: [
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['Washable pad', 'Lightweight handle', 'Low-profile head'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-29T05:00:00.000Z'
  },
  {
    id: 'floor-wiper-heavy-duty',
    name: 'Heavy Duty Floor Wiper',
    category: 'Wipers',
    description:
      'Durable rubber floor wiper with long grip handle for kitchens, bathrooms, and balconies.',
    pricePaise: 24900,
    mrpPaise: 34900,
    stock: 96,
    images: [
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['Flexible rubber blade', 'Anti-slip handle', 'Rust-resistant pole'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-25T05:00:00.000Z'
  },
  {
    id: 'glass-wiper-premium',
    name: 'Premium Glass Wiper',
    category: 'Wipers',
    description:
      'Soft edge wiper for streak-free windows, mirrors, tiles, and glass partitions.',
    pricePaise: 19900,
    mrpPaise: 29900,
    stock: 84,
    images: [
      'https://images.unsplash.com/photo-1584622781867-1c973fb883d9?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['Soft silicone edge', 'Compact handle', 'Streak-free finish'],
    isActive: true,
    isFeatured: false,
    createdAt: '2026-05-20T05:00:00.000Z'
  },
  {
    id: 'microfiber-refill-pack',
    name: 'Microfiber Refill Pack',
    category: 'Cleaning Products',
    description:
      'Pack of three high-absorbency microfiber mop heads compatible with King spin mops.',
    pricePaise: 29900,
    mrpPaise: 44900,
    stock: 120,
    images: [
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['Pack of 3', 'Machine washable', 'High absorption microfiber'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-18T05:00:00.000Z'
  },
  {
    id: 'cleaning-combo-kit',
    name: 'Complete Cleaning Combo Kit',
    category: 'Cleaning Products',
    description:
      'Value combo with mop, wiper, microfiber cloths, and refill for complete home cleaning.',
    pricePaise: 149900,
    mrpPaise: 219900,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=1200&q=80'
    ],
    specs: ['Mop and wiper combo', 'Microfiber cloths', 'Best-selling bundle'],
    isActive: true,
    isFeatured: true,
    createdAt: '2026-05-15T05:00:00.000Z'
  }
];

export const demoUsers = [
  {
    uid: 'demo-customer',
    name: 'Demo Customer',
    email: 'customer@kingmops.local',
    phone: '9876543210',
    appScope: 'kingmops',
    role: 'customer',
    addresses: [],
    createdAt: '2026-06-01T05:00:00.000Z'
  },
  {
    uid: 'demo-admin',
    name: 'King Mops Admin',
    email: 'admin@kingmops.local',
    phone: '9876543211',
    appScope: 'kingmops',
    role: 'admin',
    admin: true,
    addresses: [],
    createdAt: '2026-06-01T05:00:00.000Z'
  }
];

export const demoOrders = [];
