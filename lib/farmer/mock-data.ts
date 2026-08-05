/* -------------------------------------------------------------------------- */
/*  WiMakit — Farmer portal mock data (no backend, local arrays only)          */
/* -------------------------------------------------------------------------- */

export const farmerProfile = {
  fullName: 'Mohamed Kamara',
  farmName: 'Kamara Family Farm',
  email: 'mohamed.kamara@wimakit.sl',
  phone: '+232 76 214 887',
  nin: 'SL-NIN-4471-2093',
  district: 'Bombali',
  chiefdom: 'Makari Gbanti',
  community: 'Masongbo',
  farmAddress: 'Plot 14, Masongbo Village, Makeni Road',
  farmSize: '6.5 acres',
  primaryCrops: ['Cassava', 'Groundnut', 'Rice', 'Pepper'],
  farmDescription:
    'Family-run mixed crop farm operating since 2011, focused on cassava and groundnut with seasonal rice and pepper. Supplies traders across Bombali and Tonkolili.',
  verificationStatus: 'Approved' as const,
  registrationDate: '12 Jan 2024',
  approvalDate: '19 Jan 2024',
  approvedBy: 'Kadiatu Sowe (SuperAdmin)',
  trustScore: 82,
  initials: 'MK',
}

export const trustScoreHint =
  'Complete orders on time, keep reviews above 4 stars, and verify your documents to raise your Trust Score.'

/* --------------------------- key metric cards ----------------------------- */

export type Metric = {
  key: string
  label: string
  value: string
  delta: number
  deltaLabel: string
  invertGood?: boolean
}

export const farmerMetrics: Metric[] = [
  { key: 'revenue', label: 'Total Revenue (this month)', value: 'Le 18.4m', delta: 12.5, deltaLabel: 'vs last month' },
  { key: 'active', label: 'Active Products', value: '9', delta: 2.0, deltaLabel: 'vs last month' },
  { key: 'pending', label: 'Pending Orders', value: '6', delta: -8.3, deltaLabel: 'vs last month', invertGood: true },
  { key: 'completed', label: 'Completed Orders', value: '41', delta: 18.9, deltaLabel: 'this month' },
  { key: 'rating', label: 'Average Rating', value: '4.6', delta: 3.2, deltaLabel: 'vs last month' },
  { key: 'trust', label: 'Trust Score', value: '82', delta: 4.0, deltaLabel: 'vs last month' },
]

/* ------------------------------- charts ----------------------------------- */

export const revenueByMonth = [
  { month: 'Sep 24', revenue: 9.2 },
  { month: 'Oct 24', revenue: 10.8 },
  { month: 'Nov 24', revenue: 12.1 },
  { month: 'Dec 24', revenue: 15.6 },
  { month: 'Jan 25', revenue: 11.4 },
  { month: 'Feb 25', revenue: 12.9 },
  { month: 'Mar 25', revenue: 14.3 },
  { month: 'Apr 25', revenue: 13.7 },
  { month: 'May 25', revenue: 15.9 },
  { month: 'Jun 25', revenue: 16.8 },
  { month: 'Jul 25', revenue: 17.2 },
  { month: 'Aug 25', revenue: 18.4 },
]

export const salesByProduct = [
  { product: 'Cassava', current: 6.4, previous: 5.1 },
  { product: 'Groundnut', current: 4.8, previous: 4.2 },
  { product: 'Rice', current: 3.1, previous: 3.6 },
  { product: 'Pepper', current: 2.2, previous: 1.5 },
  { product: 'Okra', current: 1.1, previous: 0.9 },
  { product: 'Ginger', current: 0.8, previous: 0.6 },
]

export const orderStatusBreakdown = [
  { status: 'Delivered', value: 41, fill: 'var(--farmer)' },
  { status: 'Processing', value: 9, fill: 'var(--buyer)' },
  { status: 'Pending', value: 6, fill: 'var(--gold)' },
  { status: 'Cancelled', value: 3, fill: 'var(--alert)' },
]

export const buyerDistricts = [
  { district: 'Bombali', orders: 22 },
  { district: 'Tonkolili', orders: 16 },
  { district: 'Port Loko', orders: 11 },
  { district: 'Western Area', orders: 9 },
  { district: 'Koinadugu', orders: 5 },
]

/* ------------------------------- orders ----------------------------------- */

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

export type Order = {
  id: string
  buyer: string
  buyerInitials: string
  product: string
  quantity: string
  amount: string
  amountValue: number
  status: OrderStatus
  date: string
  district: string
  deliveryAddress: string
  paymentRef: string
}

export const orders: Order[] = [
  { id: 'WM-ORD-5821', buyer: 'Fatmata Conteh', buyerInitials: 'FC', product: 'Cassava (50kg bags)', quantity: '20 bags', amount: 'Le 3.20m', amountValue: 3200000, status: 'Pending', date: '02 Aug 2025', district: 'Bombali', deliveryAddress: 'Shop 6, Makeni Central Market, Bombali', paymentRef: 'PAY-8841-SL' },
  { id: 'WM-ORD-5817', buyer: 'Ibrahim Sesay', buyerInitials: 'IS', product: 'Groundnut (raw)', quantity: '120 kg', amount: 'Le 2.64m', amountValue: 2640000, status: 'Processing', date: '01 Aug 2025', district: 'Tonkolili', deliveryAddress: 'Magburaka Lorry Park, Tonkolili', paymentRef: 'PAY-8836-SL' },
  { id: 'WM-ORD-5809', buyer: 'Aminata Bangura', buyerInitials: 'AB', product: 'Rice (local husked)', quantity: '15 bags', amount: 'Le 4.05m', amountValue: 4050000, status: 'Shipped', date: '30 Jul 2025', district: 'Port Loko', deliveryAddress: 'Lunsar Junction, Port Loko', paymentRef: 'PAY-8829-SL' },
  { id: 'WM-ORD-5802', buyer: 'Santigie Kargbo', buyerInitials: 'SK', product: 'Pepper (dried)', quantity: '40 kg', amount: 'Le 1.80m', amountValue: 1800000, status: 'Delivered', date: '28 Jul 2025', district: 'Bombali', deliveryAddress: 'Masongbo Village, Bombali', paymentRef: 'PAY-8820-SL' },
  { id: 'WM-ORD-5795', buyer: 'Isatu Turay', buyerInitials: 'IT', product: 'Cassava (50kg bags)', quantity: '12 bags', amount: 'Le 1.92m', amountValue: 1920000, status: 'Delivered', date: '27 Jul 2025', district: 'Western Area', deliveryAddress: 'Waterloo Market, Western Area Rural', paymentRef: 'PAY-8814-SL' },
  { id: 'WM-ORD-5788', buyer: 'Alhaji Jalloh', buyerInitials: 'AJ', product: 'Okra (fresh)', quantity: '30 kg', amount: 'Le 0.90m', amountValue: 900000, status: 'Cancelled', date: '25 Jul 2025', district: 'Koinadugu', deliveryAddress: 'Kabala Town, Koinadugu', paymentRef: 'PAY-8807-SL' },
  { id: 'WM-ORD-5781', buyer: 'Fatmata Conteh', buyerInitials: 'FC', product: 'Ginger (fresh)', quantity: '25 kg', amount: 'Le 1.25m', amountValue: 1250000, status: 'Delivered', date: '23 Jul 2025', district: 'Bombali', deliveryAddress: 'Shop 6, Makeni Central Market, Bombali', paymentRef: 'PAY-8801-SL' },
  { id: 'WM-ORD-5774', buyer: 'Mariama Koroma', buyerInitials: 'MK', product: 'Groundnut (raw)', quantity: '80 kg', amount: 'Le 1.76m', amountValue: 1760000, status: 'Delivered', date: '21 Jul 2025', district: 'Tonkolili', deliveryAddress: 'Yele Town, Tonkolili', paymentRef: 'PAY-8793-SL' },
]

/* ------------------------------- buyers ----------------------------------- */

export type Buyer = {
  name: string
  initials: string
  district: string
  ordersPlaced: number
  lastOrder: string
}

export const recentBuyers: Buyer[] = [
  { name: 'Fatmata Conteh', initials: 'FC', district: 'Bombali', ordersPlaced: 14, lastOrder: '02 Aug 2025' },
  { name: 'Ibrahim Sesay', initials: 'IS', district: 'Tonkolili', ordersPlaced: 9, lastOrder: '01 Aug 2025' },
  { name: 'Aminata Bangura', initials: 'AB', district: 'Port Loko', ordersPlaced: 6, lastOrder: '30 Jul 2025' },
  { name: 'Santigie Kargbo', initials: 'SK', district: 'Bombali', ordersPlaced: 5, lastOrder: '28 Jul 2025' },
  { name: 'Mariama Koroma', initials: 'MK', district: 'Tonkolili', ordersPlaced: 4, lastOrder: '21 Jul 2025' },
]

/* ------------------------------ products ---------------------------------- */

export type ProductStatus = 'Approved' | 'Pending' | 'Hidden'

export type Product = {
  id: string
  name: string
  category: string
  price: string
  priceValue: number
  unit: string
  stock: number
  lowStockAt: number
  status: ProductStatus
  submitted: string
  description: string
  approvalHistory: { label: string; at: string; note?: string }[]
}

export const products: Product[] = [
  {
    id: 'WM-PRD-3301',
    name: 'Cassava (50kg bags)',
    category: 'Root Crops',
    price: 'Le 160,000',
    priceValue: 160000,
    unit: 'per bag',
    stock: 42,
    lowStockAt: 15,
    status: 'Approved',
    submitted: '19 Jan 2024',
    description: 'Freshly harvested white cassava, cleaned and bagged in 50kg sacks. Grade A tubers suited for gari and fufu processing.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '17 Jan 2024' },
      { label: 'Under SuperAdmin review', at: '18 Jan 2024' },
      { label: 'Approved', at: '19 Jan 2024', note: 'Approved by Kadiatu Sowe' },
    ],
  },
  {
    id: 'WM-PRD-3318',
    name: 'Groundnut (raw)',
    category: 'Legumes',
    price: 'Le 22,000',
    priceValue: 22000,
    unit: 'per kg',
    stock: 210,
    lowStockAt: 50,
    status: 'Approved',
    submitted: '04 Feb 2024',
    description: 'Sun-dried raw groundnuts, shelled and sorted. Ideal for oil pressing and paste.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '02 Feb 2024' },
      { label: 'Under SuperAdmin review', at: '03 Feb 2024' },
      { label: 'Approved', at: '04 Feb 2024', note: 'Approved by Foday Mansaray' },
    ],
  },
  {
    id: 'WM-PRD-3342',
    name: 'Rice (local husked)',
    category: 'Grains',
    price: 'Le 270,000',
    priceValue: 270000,
    unit: 'per bag',
    stock: 8,
    lowStockAt: 10,
    status: 'Approved',
    submitted: '11 Mar 2024',
    description: 'Locally grown husked rice in 50kg bags. Parboiled, low breakage.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '09 Mar 2024' },
      { label: 'Approved', at: '11 Mar 2024', note: 'Approved by Kadiatu Sowe' },
    ],
  },
  {
    id: 'WM-PRD-3377',
    name: 'Pepper (dried)',
    category: 'Spices',
    price: 'Le 45,000',
    priceValue: 45000,
    unit: 'per kg',
    stock: 63,
    lowStockAt: 20,
    status: 'Approved',
    submitted: '02 May 2024',
    description: 'Dried hot pepper, sun-cured and bagged. Strong pungency, long shelf life.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '30 Apr 2024' },
      { label: 'Approved', at: '02 May 2024' },
    ],
  },
  {
    id: 'WM-PRD-3390',
    name: 'Ginger (fresh)',
    category: 'Spices',
    price: 'Le 50,000',
    priceValue: 50000,
    unit: 'per kg',
    stock: 27,
    lowStockAt: 15,
    status: 'Pending',
    submitted: '31 Jul 2025',
    description: 'Fresh ginger rhizomes, hand-dug and washed. Awaiting quality review.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '31 Jul 2025' },
      { label: 'Under SuperAdmin review', at: '01 Aug 2025' },
    ],
  },
  {
    id: 'WM-PRD-3402',
    name: 'Okra (fresh)',
    category: 'Vegetables',
    price: 'Le 30,000',
    priceValue: 30000,
    unit: 'per kg',
    stock: 0,
    lowStockAt: 10,
    status: 'Hidden',
    submitted: '18 Jun 2025',
    description: 'Fresh tender okra pods. Currently out of stock and hidden from buyers.',
    approvalHistory: [
      { label: 'Submitted by farmer', at: '16 Jun 2025' },
      { label: 'Approved', at: '18 Jun 2025' },
      { label: 'Hidden by farmer', at: '20 Jul 2025', note: 'Out of season' },
    ],
  },
]

export const productCategories = [
  'Root Crops',
  'Legumes',
  'Grains',
  'Spices',
  'Vegetables',
  'Cash Crops',
]

/* ------------------------------ reviews ----------------------------------- */

export type Review = {
  id: string
  buyer: string
  initials: string
  rating: number
  comment: string
  product: string
  date: string
  reply?: string
}

export const reviews: Review[] = [
  { id: 'RV-901', buyer: 'Fatmata Conteh', initials: 'FC', rating: 5, comment: 'Cassava was fresh and well bagged. Delivery was on time to Makeni market.', product: 'Cassava (50kg bags)', date: '29 Jul 2025', reply: 'Thank you Fatmata, always a pleasure serving you.' },
  { id: 'RV-902', buyer: 'Ibrahim Sesay', initials: 'IS', rating: 4, comment: 'Good groundnut quality but one bag was slightly underweight.', product: 'Groundnut (raw)', date: '26 Jul 2025' },
  { id: 'RV-903', buyer: 'Aminata Bangura', initials: 'AB', rating: 5, comment: 'Best rice I have bought this season. Low breakage, clean grains.', product: 'Rice (local husked)', date: '24 Jul 2025' },
  { id: 'RV-904', buyer: 'Santigie Kargbo', initials: 'SK', rating: 5, comment: 'Very hot pepper, exactly what my customers want.', product: 'Pepper (dried)', date: '22 Jul 2025' },
  { id: 'RV-905', buyer: 'Mariama Koroma', initials: 'MK', rating: 3, comment: 'Ginger was okay but delivery took longer than expected.', product: 'Ginger (fresh)', date: '19 Jul 2025' },
  { id: 'RV-906', buyer: 'Isatu Turay', initials: 'IT', rating: 4, comment: 'Reliable seller, fair prices. Will order again.', product: 'Cassava (50kg bags)', date: '15 Jul 2025' },
]

export const ratingDistribution = [
  { stars: 5, count: 38 },
  { stars: 4, count: 14 },
  { stars: 3, count: 5 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
]

/* --------------------------- notifications -------------------------------- */

export type NotifType = 'order' | 'product' | 'message' | 'broadcast'

export type Notification = {
  id: string
  type: NotifType
  title: string
  body: string
  at: string
  unread: boolean
}

export const notifications: Notification[] = [
  { id: 'N-1', type: 'order', title: 'New order received', body: 'Fatmata Conteh placed an order for 20 bags of Cassava (WM-ORD-5821).', at: '10 min ago', unread: true },
  { id: 'N-2', type: 'product', title: 'Product under review', body: 'Your listing "Ginger (fresh)" is being reviewed by the SuperAdmin team.', at: '2 hours ago', unread: true },
  { id: 'N-3', type: 'message', title: 'New message from Ibrahim Sesay', body: 'Is the groundnut still available in bulk this week?', at: '5 hours ago', unread: true },
  { id: 'N-4', type: 'broadcast', title: 'Platform notice from WiMakit', body: 'Payout schedule moves to weekly starting this month. No action needed.', at: 'Yesterday', unread: false },
  { id: 'N-5', type: 'order', title: 'Order delivered', body: 'Order WM-ORD-5802 to Santigie Kargbo was marked delivered.', at: 'Yesterday', unread: false },
  { id: 'N-6', type: 'product', title: 'Product approved', body: 'Your listing "Rice (local husked)" was approved and is now visible to buyers.', at: '2 days ago', unread: false },
  { id: 'N-7', type: 'broadcast', title: 'Dry season advisory', body: 'SuperAdmin: expect higher demand for stored grains through September.', at: '3 days ago', unread: false },
]

/* ------------------------------ messages ---------------------------------- */

export type Message = {
  id: string
  fromMe: boolean
  text: string
  at: string
  read?: boolean
  attachment?: boolean
}

export type Thread = {
  id: string
  name: string
  initials: string
  role: 'Buyer' | 'SuperAdmin'
  preview: string
  at: string
  unread: number
  messages: Message[]
}

export const threads: Thread[] = [
  {
    id: 'T-1',
    name: 'Fatmata Conteh',
    initials: 'FC',
    role: 'Buyer',
    preview: 'Can you deliver the cassava by Friday?',
    at: '10 min',
    unread: 2,
    messages: [
      { id: 'm1', fromMe: false, text: 'Good morning, I want to order 20 bags of cassava.', at: '09:12' },
      { id: 'm2', fromMe: true, text: 'Good morning Fatmata. Yes, I have 42 bags in stock.', at: '09:14', read: true },
      { id: 'm3', fromMe: false, text: 'Can you deliver the cassava by Friday?', at: '09:20' },
      { id: 'm4', fromMe: false, text: 'Here is the market stall location.', at: '09:21', attachment: true },
    ],
  },
  {
    id: 'T-2',
    name: 'Ibrahim Sesay',
    initials: 'IS',
    role: 'Buyer',
    preview: 'Is the groundnut still available in bulk?',
    at: '5 hrs',
    unread: 1,
    messages: [
      { id: 'm1', fromMe: false, text: 'Is the groundnut still available in bulk this week?', at: '06:40' },
      { id: 'm2', fromMe: true, text: 'Yes, I have about 210kg available right now.', at: '07:02', read: true },
    ],
  },
  {
    id: 'T-3',
    name: 'WiMakit Support',
    initials: 'WM',
    role: 'SuperAdmin',
    preview: 'Your document verification is complete.',
    at: '1 day',
    unread: 0,
    messages: [
      { id: 'm1', fromMe: false, text: 'Hello Mohamed, your National ID documents have been verified. Your Trust Score has increased.', at: 'Yesterday 14:30' },
      { id: 'm2', fromMe: true, text: 'Thank you very much for the update.', at: 'Yesterday 15:10', read: true },
    ],
  },
]

/* --------------------------- quick actions -------------------------------- */

export const districts = [
  'Bo', 'Bombali', 'Bonthe', 'Falaba', 'Kailahun', 'Kambia', 'Karene',
  'Kenema', 'Koinadugu', 'Kono', 'Moyamba', 'Port Loko', 'Pujehun',
  'Tonkolili', 'Western Area Rural', 'Western Area Urban',
]

export const cropOptions = [
  'Cassava', 'Groundnut', 'Cocoa', 'Rice', 'Oil Palm', 'Ginger',
  'Pepper', 'Okra', 'Maize', 'Sweet Potato', 'Cashew', 'Coffee',
]

/* ------------------------- auth mock accounts ----------------------------- */

export type DemoAccount = {
  email: string
  password: string
  role: 'SuperAdmin' | 'Farmer'
  name: string
  state: 'active' | 'temp-password' | 'suspended'
  note: string
}

export const demoAccounts: DemoAccount[] = [
  { email: 'kadiatu.sowe@wimakit.sl', password: 'admin123', role: 'SuperAdmin', name: 'Kadiatu Sowe', state: 'active', note: 'SuperAdmin — routes to oversight dashboard' },
  { email: 'mohamed.kamara@wimakit.sl', password: 'farmer123', role: 'Farmer', name: 'Mohamed Kamara', state: 'active', note: 'Approved farmer — routes to farmer dashboard' },
  { email: 'aminata.bah@wimakit.sl', password: 'temp456', role: 'Farmer', name: 'Aminata Bah', state: 'temp-password', note: 'Temporary password — must set a new one first' },
]
