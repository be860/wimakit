// All data in this module is local mock data for the SuperAdmin UI pass.
// No API calls, no persistence — replace with real queries during backend work.

export type FarmerStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended'
export type BuyerStatus = 'Active' | 'Suspended'
export type ProductStatus = 'Pending' | 'Live' | 'Hidden' | 'Rejected'
export type FraudStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected'
export type OrderStatus =
  | 'Pending'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled'
  | 'Disputed'

export const LE = (amount: number) =>
  `Le ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const districts = [
  'Western Area Urban',
  'Western Area Rural',
  'Bo',
  'Kenema',
  'Kailahun',
  'Kono',
  'Bombali',
  'Tonkolili',
  'Port Loko',
  'Kambia',
  'Koinadugu',
  'Moyamba',
  'Bonthe',
  'Pujehun',
  'Falaba',
  'Karene',
] as const

/* -------------------------------------------------------------------------- */
/* Dashboard metrics                                                          */
/* -------------------------------------------------------------------------- */

export type Metric = {
  key: string
  label: string
  value: string
  delta: number
  deltaLabel: string
  icon: 'farmers' | 'buyers' | 'clock' | 'package' | 'shield' | 'revenue' | 'tag' | 'cart'
  emphasis?: boolean
  href?: string
}

export const metrics: Metric[] = [
  {
    key: 'farmers',
    label: 'Total Farmers',
    value: '12,480',
    delta: 4.8,
    deltaLabel: 'vs last month',
    icon: 'farmers',
    href: '/admin/farmers',
  },
  {
    key: 'buyers',
    label: 'Total Buyers',
    value: '3,914',
    delta: 6.2,
    deltaLabel: 'vs last month',
    icon: 'buyers',
    href: '/admin/buyers',
  },
  {
    key: 'farmer-approvals',
    label: 'Pending Farmer Approvals',
    value: '148',
    delta: 12.5,
    deltaLabel: 'vs last week',
    icon: 'clock',
    emphasis: true,
    href: '/admin/farmers?status=Pending',
  },
  {
    key: 'product-approvals',
    label: 'Pending Product Approvals',
    value: '76',
    delta: -8.1,
    deltaLabel: 'vs last week',
    icon: 'package',
    emphasis: true,
    href: '/admin/products',
  },
  {
    key: 'fraud',
    label: 'Open Fraud Cases',
    value: '19',
    delta: 2.4,
    deltaLabel: 'vs last week',
    icon: 'shield',
    emphasis: true,
    href: '/admin/fraud-cases',
  },
  {
    key: 'revenue',
    label: 'Total Revenue (all-time)',
    value: 'Le 48.2B',
    delta: 9.6,
    deltaLabel: 'vs last month',
    icon: 'revenue',
  },
  {
    key: 'listings',
    label: 'Active Product Listings',
    value: '8,265',
    delta: 3.1,
    deltaLabel: 'vs last month',
    icon: 'tag',
    href: '/admin/products',
  },
  {
    key: 'orders',
    label: 'Orders This Month',
    value: '2,187',
    delta: -1.9,
    deltaLabel: 'vs last month',
    icon: 'cart',
  },
]

/* -------------------------------------------------------------------------- */
/* Charts                                                                     */
/* -------------------------------------------------------------------------- */

export const revenueByMonth = [
  { month: 'Aug 25', revenue: 1840, orders: 1420 },
  { month: 'Sep 25', revenue: 2010, orders: 1533 },
  { month: 'Oct 25', revenue: 2260, orders: 1690 },
  { month: 'Nov 25', revenue: 2480, orders: 1744 },
  { month: 'Dec 25', revenue: 3120, orders: 2065 },
  { month: 'Jan 26', revenue: 2740, orders: 1802 },
  { month: 'Feb 26', revenue: 2890, orders: 1911 },
  { month: 'Mar 26', revenue: 3310, orders: 2140 },
  { month: 'Apr 26', revenue: 3580, orders: 2288 },
  { month: 'May 26', revenue: 3420, orders: 2196 },
  { month: 'Jun 26', revenue: 3960, orders: 2402 },
  { month: 'Jul 26', revenue: 4180, orders: 2187 },
]

export const growthByMonth = [
  { month: 'Feb', farmers: 620, buyers: 184 },
  { month: 'Mar', farmers: 745, buyers: 226 },
  { month: 'Apr', farmers: 812, buyers: 258 },
  { month: 'May', farmers: 690, buyers: 241 },
  { month: 'Jun', farmers: 918, buyers: 305 },
  { month: 'Jul', farmers: 1042, buyers: 361 },
]

export const topCrops = [
  { crop: 'Rice (Local)', volume: 4820 },
  { crop: 'Cassava', volume: 3960 },
  { crop: 'Palm Oil', volume: 3410 },
  { crop: 'Groundnut', volume: 2685 },
  { crop: 'Cacao', volume: 2340 },
  { crop: 'Sweet Potato', volume: 1912 },
  { crop: 'Ginger', volume: 1488 },
  { crop: 'Pepper', volume: 1140 },
]

export const districtBreakdown = [
  { district: 'Bo', farmers: 1840, buyers: 412 },
  { district: 'Kenema', farmers: 1615, buyers: 358 },
  { district: 'Western Urban', farmers: 486, buyers: 1128 },
  { district: 'Port Loko', farmers: 1284, buyers: 246 },
  { district: 'Bombali', farmers: 1152, buyers: 219 },
  { district: 'Kailahun', farmers: 1043, buyers: 168 },
  { district: 'Tonkolili', farmers: 964, buyers: 152 },
  { district: 'Kono', farmers: 831, buyers: 204 },
  { district: 'Moyamba', farmers: 742, buyers: 131 },
  { district: 'Kambia', farmers: 688, buyers: 126 },
]

/* -------------------------------------------------------------------------- */
/* Farmers                                                                    */
/* -------------------------------------------------------------------------- */

export type Farmer = {
  id: string
  name: string
  nin: string
  phone: string
  district: string
  chiefdom: string
  community: string
  crops: string[]
  farmSizeHa: number
  farmingSince: number
  status: FarmerStatus
  trustScore: number
  verified: boolean
  submitted: string
  listings: number
  totalSales: number
}

export const farmers: Farmer[] = [
  {
    id: 'FRM-10482',
    name: 'Ibrahim Kamara',
    nin: 'SL-1988-047-2213',
    phone: '+232 76 214 880',
    district: 'Bo',
    chiefdom: 'Valunia',
    community: 'Mongere',
    crops: ['Rice (Local)', 'Cassava'],
    farmSizeHa: 4.5,
    farmingSince: 2009,
    status: 'Pending',
    trustScore: 72,
    verified: false,
    submitted: '2026-07-29',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10481',
    name: 'Aminata Sesay',
    nin: 'SL-1993-118-7740',
    phone: '+232 77 908 143',
    district: 'Kenema',
    chiefdom: 'Nongowa',
    community: 'Kpandebu',
    crops: ['Cacao', 'Palm Oil'],
    farmSizeHa: 6.2,
    farmingSince: 2014,
    status: 'Pending',
    trustScore: 81,
    verified: false,
    submitted: '2026-07-29',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10478',
    name: 'Mohamed Bangura',
    nin: 'SL-1985-330-1094',
    phone: '+232 78 445 209',
    district: 'Port Loko',
    chiefdom: 'Kaffu Bullom',
    community: 'Lungi Town',
    crops: ['Groundnut', 'Pepper'],
    farmSizeHa: 2.8,
    farmingSince: 2011,
    status: 'Pending',
    trustScore: 64,
    verified: false,
    submitted: '2026-07-28',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10475',
    name: 'Fatmata Koroma',
    nin: 'SL-1996-201-5528',
    phone: '+232 79 662 018',
    district: 'Bombali',
    chiefdom: 'Safroko Limba',
    community: 'Binkolo',
    crops: ['Rice (Local)', 'Ginger'],
    farmSizeHa: 3.1,
    farmingSince: 2018,
    status: 'Pending',
    trustScore: 69,
    verified: false,
    submitted: '2026-07-28',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10470',
    name: 'Samuel Conteh',
    nin: 'SL-1981-455-3316',
    phone: '+232 76 330 771',
    district: 'Kailahun',
    chiefdom: 'Luawa',
    community: 'Kailahun Town',
    crops: ['Cacao', 'Coffee'],
    farmSizeHa: 9.4,
    farmingSince: 2004,
    status: 'Pending',
    trustScore: 88,
    verified: false,
    submitted: '2026-07-27',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10201',
    name: 'Isatu Jalloh',
    nin: 'SL-1990-772-9081',
    phone: '+232 77 210 553',
    district: 'Kono',
    chiefdom: 'Gbense',
    community: 'Koidu',
    crops: ['Sweet Potato', 'Cassava'],
    farmSizeHa: 5.0,
    farmingSince: 2013,
    status: 'Approved',
    trustScore: 91,
    verified: true,
    submitted: '2026-05-14',
    listings: 12,
    totalSales: 184_500_000,
  },
  {
    id: 'FRM-10188',
    name: 'Alusine Turay',
    nin: 'SL-1979-611-2247',
    phone: '+232 78 118 904',
    district: 'Tonkolili',
    chiefdom: 'Kholifa Rowalla',
    community: 'Magburaka',
    crops: ['Rice (Local)'],
    farmSizeHa: 11.7,
    farmingSince: 2001,
    status: 'Approved',
    trustScore: 95,
    verified: true,
    submitted: '2026-04-03',
    listings: 21,
    totalSales: 412_800_000,
  },
  {
    id: 'FRM-10166',
    name: 'Mariama Sankoh',
    nin: 'SL-1992-044-6690',
    phone: '+232 79 447 226',
    district: 'Moyamba',
    chiefdom: 'Kaiyamba',
    community: 'Moyamba Town',
    crops: ['Palm Oil', 'Groundnut'],
    farmSizeHa: 3.6,
    farmingSince: 2016,
    status: 'Approved',
    trustScore: 84,
    verified: true,
    submitted: '2026-03-21',
    listings: 9,
    totalSales: 96_200_000,
  },
  {
    id: 'FRM-10140',
    name: 'Abu Bakarr Fofanah',
    nin: 'SL-1987-905-1132',
    phone: '+232 76 559 018',
    district: 'Kambia',
    chiefdom: 'Magbema',
    community: 'Kambia Town',
    crops: ['Cassava', 'Pepper'],
    farmSizeHa: 2.2,
    farmingSince: 2019,
    status: 'Suspended',
    trustScore: 38,
    verified: true,
    submitted: '2026-02-08',
    listings: 4,
    totalSales: 22_400_000,
  },
  {
    id: 'FRM-10122',
    name: 'Zainab Mansaray',
    nin: 'SL-1998-317-8845',
    phone: '+232 77 664 301',
    district: 'Western Area Rural',
    chiefdom: 'Koya',
    community: 'Newton',
    crops: ['Ginger', 'Sweet Potato'],
    farmSizeHa: 1.4,
    farmingSince: 2021,
    status: 'Rejected',
    trustScore: 24,
    verified: false,
    submitted: '2026-01-19',
    listings: 0,
    totalSales: 0,
  },
  {
    id: 'FRM-10098',
    name: 'Santigie Dumbuya',
    nin: 'SL-1983-228-4471',
    phone: '+232 78 902 116',
    district: 'Koinadugu',
    chiefdom: 'Sengbe',
    community: 'Kabala',
    crops: ['Groundnut', 'Rice (Local)'],
    farmSizeHa: 7.9,
    farmingSince: 2007,
    status: 'Approved',
    trustScore: 89,
    verified: true,
    submitted: '2025-12-02',
    listings: 16,
    totalSales: 268_900_000,
  },
  {
    id: 'FRM-10077',
    name: 'Hawa Kargbo',
    nin: 'SL-1995-580-2298',
    phone: '+232 79 118 447',
    district: 'Pujehun',
    chiefdom: 'Malen',
    community: 'Sahn Malen',
    crops: ['Palm Oil'],
    farmSizeHa: 4.8,
    farmingSince: 2015,
    status: 'Approved',
    trustScore: 78,
    verified: true,
    submitted: '2025-11-11',
    listings: 7,
    totalSales: 74_600_000,
  },
]

export const pendingFarmers = farmers.filter((f) => f.status === 'Pending')

/* -------------------------------------------------------------------------- */
/* Buyers                                                                     */
/* -------------------------------------------------------------------------- */

export type Buyer = {
  id: string
  name: string
  organization: string
  type: 'Wholesaler' | 'Processor' | 'Retailer' | 'Exporter' | 'Institution'
  district: string
  phone: string
  status: BuyerStatus
  orders: number
  spend: number
  joined: string
}

export const buyers: Buyer[] = [
  {
    id: 'BYR-4412',
    name: 'Kadiatu Bah',
    organization: 'Freetown Fresh Markets Ltd',
    type: 'Wholesaler',
    district: 'Western Area Urban',
    phone: '+232 76 004 118',
    status: 'Active',
    orders: 184,
    spend: 1_248_000_000,
    joined: '2025-04-18',
  },
  {
    id: 'BYR-4408',
    name: 'Joseph Lamin',
    organization: 'Salone Agro Processing',
    type: 'Processor',
    district: 'Bo',
    phone: '+232 77 552 901',
    status: 'Active',
    orders: 142,
    spend: 986_400_000,
    joined: '2025-05-02',
  },
  {
    id: 'BYR-4399',
    name: 'Adama Kanu',
    organization: 'Kanu & Daughters Trading',
    type: 'Retailer',
    district: 'Kenema',
    phone: '+232 78 771 224',
    status: 'Active',
    orders: 96,
    spend: 418_200_000,
    joined: '2025-06-24',
  },
  {
    id: 'BYR-4381',
    name: 'Emmanuel Coker',
    organization: 'Atlantic Cocoa Exports',
    type: 'Exporter',
    district: 'Western Area Urban',
    phone: '+232 79 330 887',
    status: 'Active',
    orders: 211,
    spend: 3_102_000_000,
    joined: '2025-02-11',
  },
  {
    id: 'BYR-4360',
    name: 'Memunatu Sillah',
    organization: 'Njala University Catering',
    type: 'Institution',
    district: 'Moyamba',
    phone: '+232 76 918 004',
    status: 'Active',
    orders: 58,
    spend: 214_700_000,
    joined: '2025-08-30',
  },
  {
    id: 'BYR-4344',
    name: 'Foday Suma',
    organization: 'Suma Bulk Supply',
    type: 'Wholesaler',
    district: 'Port Loko',
    phone: '+232 77 118 662',
    status: 'Suspended',
    orders: 34,
    spend: 88_100_000,
    joined: '2025-09-15',
  },
  {
    id: 'BYR-4330',
    name: 'Rugiatu Barrie',
    organization: 'Makeni Grain Depot',
    type: 'Wholesaler',
    district: 'Bombali',
    phone: '+232 78 224 550',
    status: 'Active',
    orders: 77,
    spend: 302_900_000,
    joined: '2025-10-07',
  },
  {
    id: 'BYR-4318',
    name: 'Alhaji Yillah',
    organization: 'Kabala Produce Union',
    type: 'Retailer',
    district: 'Koinadugu',
    phone: '+232 79 664 118',
    status: 'Active',
    orders: 41,
    spend: 128_400_000,
    joined: '2025-11-19',
  },
]

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export type Product = {
  id: string
  name: string
  farmer: string
  farmerId: string
  category: string
  unit: string
  price: number
  stock: number
  district: string
  status: ProductStatus
  submitted: string
}

export const products: Product[] = [
  {
    id: 'PRD-88214',
    name: 'Parboiled Local Rice — 50kg Bag',
    farmer: 'Alusine Turay',
    farmerId: 'FRM-10188',
    category: 'Grains & Cereals',
    unit: '50kg bag',
    price: 1_450_000,
    stock: 120,
    district: 'Tonkolili',
    status: 'Pending',
    submitted: '2026-07-30',
  },
  {
    id: 'PRD-88209',
    name: 'Fermented Cacao Beans — Grade A',
    farmer: 'Samuel Conteh',
    farmerId: 'FRM-10470',
    category: 'Cash Crops',
    unit: '65kg sack',
    price: 3_280_000,
    stock: 46,
    district: 'Kailahun',
    status: 'Pending',
    submitted: '2026-07-30',
  },
  {
    id: 'PRD-88201',
    name: 'Red Palm Oil — 25L Jerrycan',
    farmer: 'Hawa Kargbo',
    farmerId: 'FRM-10077',
    category: 'Oils',
    unit: '25L',
    price: 890_000,
    stock: 84,
    district: 'Pujehun',
    status: 'Pending',
    submitted: '2026-07-29',
  },
  {
    id: 'PRD-88194',
    name: 'Fresh Cassava Tubers — 100kg',
    farmer: 'Isatu Jalloh',
    farmerId: 'FRM-10201',
    category: 'Roots & Tubers',
    unit: '100kg',
    price: 620_000,
    stock: 210,
    district: 'Kono',
    status: 'Pending',
    submitted: '2026-07-29',
  },
  {
    id: 'PRD-88187',
    name: 'Shelled Groundnut — 40kg Bag',
    farmer: 'Santigie Dumbuya',
    farmerId: 'FRM-10098',
    category: 'Legumes',
    unit: '40kg bag',
    price: 1_120_000,
    stock: 65,
    district: 'Koinadugu',
    status: 'Pending',
    submitted: '2026-07-28',
  },
  {
    id: 'PRD-87944',
    name: 'Dried Ginger Root — 20kg',
    farmer: 'Fatmata Koroma',
    farmerId: 'FRM-10475',
    category: 'Spices',
    unit: '20kg',
    price: 980_000,
    stock: 38,
    district: 'Bombali',
    status: 'Live',
    submitted: '2026-06-14',
  },
  {
    id: 'PRD-87901',
    name: 'Sweet Potato — 80kg Bag',
    farmer: 'Isatu Jalloh',
    farmerId: 'FRM-10201',
    category: 'Roots & Tubers',
    unit: '80kg bag',
    price: 540_000,
    stock: 142,
    district: 'Kono',
    status: 'Live',
    submitted: '2026-06-02',
  },
  {
    id: 'PRD-87866',
    name: 'Hot Pepper (Fresh) — 15kg Crate',
    farmer: 'Abu Bakarr Fofanah',
    farmerId: 'FRM-10140',
    category: 'Vegetables',
    unit: '15kg crate',
    price: 410_000,
    stock: 0,
    district: 'Kambia',
    status: 'Hidden',
    submitted: '2026-05-27',
  },
  {
    id: 'PRD-87812',
    name: 'Milled White Rice — 25kg',
    farmer: 'Mariama Sankoh',
    farmerId: 'FRM-10166',
    category: 'Grains & Cereals',
    unit: '25kg bag',
    price: 760_000,
    stock: 96,
    district: 'Moyamba',
    status: 'Live',
    submitted: '2026-05-09',
  },
  {
    id: 'PRD-87780',
    name: 'Raw Cacao — Unfermented',
    farmer: 'Aminata Sesay',
    farmerId: 'FRM-10481',
    category: 'Cash Crops',
    unit: '50kg sack',
    price: 2_140_000,
    stock: 22,
    district: 'Kenema',
    status: 'Rejected',
    submitted: '2026-04-30',
  },
]

export const pendingProducts = products.filter((p) => p.status === 'Pending')

/* -------------------------------------------------------------------------- */
/* Fraud cases                                                                */
/* -------------------------------------------------------------------------- */

export type FraudCase = {
  id: string
  orderId: string
  buyer: string
  farmer: string
  reason: string
  amount: number
  status: FraudStatus
  reported: string
  assignedTo: string
}

export const fraudCases: FraudCase[] = [
  {
    id: 'FRD-2041',
    orderId: 'ORD-77120',
    buyer: 'Emmanuel Coker',
    farmer: 'Abu Bakarr Fofanah',
    reason: 'Goods never delivered after payment confirmation',
    amount: 4_820_000,
    status: 'Open',
    reported: '2026-07-30',
    assignedTo: 'Kadiatu Sowe',
  },
  {
    id: 'FRD-2038',
    orderId: 'ORD-77044',
    buyer: 'Joseph Lamin',
    farmer: 'Zainab Mansaray',
    reason: 'Weight shortfall — 40kg billed, 26kg received',
    amount: 1_140_000,
    status: 'Under Review',
    reported: '2026-07-28',
    assignedTo: 'Osman Jah',
  },
  {
    id: 'FRD-2035',
    orderId: 'ORD-76981',
    buyer: 'Adama Kanu',
    farmer: 'Foday Suma',
    reason: 'Duplicate listing with stolen farm photographs',
    amount: 2_260_000,
    status: 'Under Review',
    reported: '2026-07-26',
    assignedTo: 'Kadiatu Sowe',
  },
  {
    id: 'FRD-2029',
    orderId: 'ORD-76812',
    buyer: 'Kadiatu Bah',
    farmer: 'Mariama Sankoh',
    reason: 'Quality dispute — mould in palm oil consignment',
    amount: 3_560_000,
    status: 'Resolved',
    reported: '2026-07-19',
    assignedTo: 'Osman Jah',
  },
  {
    id: 'FRD-2024',
    orderId: 'ORD-76640',
    buyer: 'Rugiatu Barrie',
    farmer: 'Alusine Turay',
    reason: 'Buyer claimed non-delivery; tracking confirmed receipt',
    amount: 5_800_000,
    status: 'Rejected',
    reported: '2026-07-12',
    assignedTo: 'Fatima Koroma',
  },
  {
    id: 'FRD-2018',
    orderId: 'ORD-76508',
    buyer: 'Memunatu Sillah',
    farmer: 'Santigie Dumbuya',
    reason: 'Payment reversed by mobile money provider',
    amount: 940_000,
    status: 'Resolved',
    reported: '2026-07-04',
    assignedTo: 'Fatima Koroma',
  },
]

export const fraudThread = [
  {
    author: 'Kadiatu Bah',
    role: 'Buyer',
    at: '30 Jul 2026, 09:14',
    body: 'Payment cleared on 27 July via Orange Money. No consignment arrived at the Kissy depot and the farmer stopped answering calls.',
  },
  {
    author: 'Kadiatu Sowe',
    role: 'SuperAdmin',
    at: '30 Jul 2026, 11:02',
    body: 'Case opened. Listing PRD-87866 temporarily hidden pending review. Requested delivery waybill from the farmer.',
  },
  {
    author: 'Abu Bakarr Fofanah',
    role: 'Farmer',
    at: '30 Jul 2026, 16:40',
    body: 'The transport vehicle broke down at Lunsar. I can deliver on Friday or refund in full.',
  },
]

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export type Order = {
  id: string
  buyer: string
  farmer: string
  product: string
  amount: number
  status: OrderStatus
  placed: string
}

export const orders: Order[] = [
  {
    id: 'ORD-77186',
    buyer: 'Emmanuel Coker',
    farmer: 'Samuel Conteh',
    product: 'Fermented Cacao Beans — Grade A',
    amount: 16_400_000,
    status: 'In Transit',
    placed: '2026-07-31',
  },
  {
    id: 'ORD-77180',
    buyer: 'Kadiatu Bah',
    farmer: 'Alusine Turay',
    product: 'Parboiled Local Rice — 50kg Bag',
    amount: 8_700_000,
    status: 'Pending',
    placed: '2026-07-31',
  },
  {
    id: 'ORD-77174',
    buyer: 'Joseph Lamin',
    farmer: 'Hawa Kargbo',
    product: 'Red Palm Oil — 25L Jerrycan',
    amount: 4_450_000,
    status: 'Delivered',
    placed: '2026-07-30',
  },
  {
    id: 'ORD-77168',
    buyer: 'Rugiatu Barrie',
    farmer: 'Santigie Dumbuya',
    product: 'Shelled Groundnut — 40kg Bag',
    amount: 5_600_000,
    status: 'Delivered',
    placed: '2026-07-30',
  },
  {
    id: 'ORD-77155',
    buyer: 'Adama Kanu',
    farmer: 'Isatu Jalloh',
    product: 'Sweet Potato — 80kg Bag',
    amount: 2_160_000,
    status: 'In Transit',
    placed: '2026-07-29',
  },
  {
    id: 'ORD-77142',
    buyer: 'Memunatu Sillah',
    farmer: 'Mariama Sankoh',
    product: 'Milled White Rice — 25kg',
    amount: 3_040_000,
    status: 'Cancelled',
    placed: '2026-07-29',
  },
  {
    id: 'ORD-77120',
    buyer: 'Emmanuel Coker',
    farmer: 'Abu Bakarr Fofanah',
    product: 'Hot Pepper (Fresh) — 15kg Crate',
    amount: 4_820_000,
    status: 'Disputed',
    placed: '2026-07-27',
  },
  {
    id: 'ORD-77109',
    buyer: 'Alhaji Yillah',
    farmer: 'Fatmata Koroma',
    product: 'Dried Ginger Root — 20kg',
    amount: 1_960_000,
    status: 'Delivered',
    placed: '2026-07-27',
  },
]

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export type Category = {
  id: string
  name: string
  slug: string
  products: number
  commission: number
  active: boolean
}

export const categories: Category[] = [
  { id: 'CAT-01', name: 'Grains & Cereals', slug: 'grains-cereals', products: 2148, commission: 3.5, active: true },
  { id: 'CAT-02', name: 'Roots & Tubers', slug: 'roots-tubers', products: 1682, commission: 3.5, active: true },
  { id: 'CAT-03', name: 'Cash Crops', slug: 'cash-crops', products: 1204, commission: 5.0, active: true },
  { id: 'CAT-04', name: 'Oils', slug: 'oils', products: 942, commission: 4.0, active: true },
  { id: 'CAT-05', name: 'Legumes', slug: 'legumes', products: 806, commission: 3.0, active: true },
  { id: 'CAT-06', name: 'Vegetables', slug: 'vegetables', products: 744, commission: 3.0, active: true },
  { id: 'CAT-07', name: 'Spices', slug: 'spices', products: 388, commission: 4.5, active: true },
  { id: 'CAT-08', name: 'Livestock Feed', slug: 'livestock-feed', products: 151, commission: 2.5, active: false },
]

/* -------------------------------------------------------------------------- */
/* Audit log                                                                  */
/* -------------------------------------------------------------------------- */

export type AuditEntry = {
  id: string
  actor: string
  role: 'SuperAdmin' | 'Moderator' | 'Finance' | 'Support'
  action: string
  entity: string
  ip: string
  browser: string
  at: string
  ago: string
}

export const auditLog: AuditEntry[] = [
  {
    id: 'AUD-99120',
    actor: 'Kadiatu Sowe',
    role: 'SuperAdmin',
    action: 'Approved farmer',
    entity: 'Ibrahim Kamara (FRM-10482)',
    ip: '102.176.44.18',
    browser: 'Chrome 128 / Windows',
    at: '31 Jul 2026, 10:42',
    ago: '2 min ago',
  },
  {
    id: 'AUD-99119',
    actor: 'Osman Jah',
    role: 'Moderator',
    action: 'Hid product listing',
    entity: 'Hot Pepper (Fresh) — PRD-87866',
    ip: '102.176.44.92',
    browser: 'Firefox 129 / macOS',
    at: '31 Jul 2026, 10:31',
    ago: '13 min ago',
  },
  {
    id: 'AUD-99118',
    actor: 'Fatima Koroma',
    role: 'Finance',
    action: 'Released escrow payout',
    entity: 'Order ORD-77174 — Le 4,450,000',
    ip: '41.221.7.204',
    browser: 'Chrome 128 / Android',
    at: '31 Jul 2026, 09:58',
    ago: '46 min ago',
  },
  {
    id: 'AUD-99117',
    actor: 'Kadiatu Sowe',
    role: 'SuperAdmin',
    action: 'Suspended farmer account',
    entity: 'Abu Bakarr Fofanah (FRM-10140)',
    ip: '102.176.44.18',
    browser: 'Chrome 128 / Windows',
    at: '31 Jul 2026, 09:20',
    ago: '1 hr ago',
  },
  {
    id: 'AUD-99116',
    actor: 'Ibrahim Sesay',
    role: 'Support',
    action: 'Replied to fraud case',
    entity: 'FRD-2038',
    ip: '102.176.45.11',
    browser: 'Safari 18 / iOS',
    at: '31 Jul 2026, 08:47',
    ago: '2 hr ago',
  },
  {
    id: 'AUD-99115',
    actor: 'Osman Jah',
    role: 'Moderator',
    action: 'Approved product',
    entity: 'Milled White Rice — PRD-87812',
    ip: '102.176.44.92',
    browser: 'Firefox 129 / macOS',
    at: '31 Jul 2026, 08:12',
    ago: '2 hr ago',
  },
  {
    id: 'AUD-99114',
    actor: 'Fatima Koroma',
    role: 'Finance',
    action: 'Updated category commission',
    entity: 'Spices — 4.0% to 4.5%',
    ip: '41.221.7.204',
    browser: 'Chrome 128 / Windows',
    at: '30 Jul 2026, 17:36',
    ago: 'Yesterday',
  },
  {
    id: 'AUD-99113',
    actor: 'Kadiatu Sowe',
    role: 'SuperAdmin',
    action: 'Sent broadcast notification',
    entity: 'All approved farmers (12,332 recipients)',
    ip: '102.176.44.18',
    browser: 'Chrome 128 / Windows',
    at: '30 Jul 2026, 16:04',
    ago: 'Yesterday',
  },
  {
    id: 'AUD-99112',
    actor: 'Ibrahim Sesay',
    role: 'Support',
    action: 'Rejected farmer application',
    entity: 'Zainab Mansaray (FRM-10122)',
    ip: '102.176.45.11',
    browser: 'Safari 18 / iOS',
    at: '30 Jul 2026, 14:22',
    ago: 'Yesterday',
  },
  {
    id: 'AUD-99111',
    actor: 'Osman Jah',
    role: 'Moderator',
    action: 'Opened fraud case',
    entity: 'FRD-2041 — Order ORD-77120',
    ip: '102.176.44.92',
    browser: 'Firefox 129 / macOS',
    at: '30 Jul 2026, 11:50',
    ago: 'Yesterday',
  },
]

/* -------------------------------------------------------------------------- */
/* Notifications & broadcasts                                                 */
/* -------------------------------------------------------------------------- */

export type Notification = {
  id: string
  title: string
  body: string
  at: string
  unread: boolean
  kind: 'approval' | 'fraud' | 'system'
}

export const notifications: Notification[] = [
  {
    id: 'NTF-1',
    title: '148 farmer applications awaiting review',
    body: 'Oldest submission is 4 days old (Bo district).',
    at: '12 min ago',
    unread: true,
    kind: 'approval',
  },
  {
    id: 'NTF-2',
    title: 'New fraud case FRD-2041 opened',
    body: 'Non-delivery reported by Emmanuel Coker — Le 4,820,000.',
    at: '38 min ago',
    unread: true,
    kind: 'fraud',
  },
  {
    id: 'NTF-3',
    title: 'Payout batch #4412 completed',
    body: '284 farmer payouts settled via Orange Money.',
    at: '2 hr ago',
    unread: true,
    kind: 'system',
  },
  {
    id: 'NTF-4',
    title: '76 product listings pending approval',
    body: 'Cash Crops queue growing fastest this week.',
    at: '5 hr ago',
    unread: false,
    kind: 'approval',
  },
  {
    id: 'NTF-5',
    title: 'Scheduled maintenance window',
    body: 'Sunday 03:00–04:00 GMT. Buyer checkout will be read-only.',
    at: 'Yesterday',
    unread: false,
    kind: 'system',
  },
]

export type Broadcast = {
  id: string
  subject: string
  audience: string
  channel: 'SMS' | 'In-app' | 'SMS + In-app'
  recipients: number
  sentBy: string
  sentAt: string
  status: 'Sent' | 'Scheduled' | 'Draft'
}

export const broadcasts: Broadcast[] = [
  {
    id: 'BRD-318',
    subject: 'Rice harvest window — list early for premium pricing',
    audience: 'Approved farmers',
    channel: 'SMS + In-app',
    recipients: 12_332,
    sentBy: 'Kadiatu Sowe',
    sentAt: '30 Jul 2026, 16:04',
    status: 'Sent',
  },
  {
    id: 'BRD-317',
    subject: 'Updated commission schedule effective 1 August',
    audience: 'All users',
    channel: 'In-app',
    recipients: 16_394,
    sentBy: 'Fatima Koroma',
    sentAt: '28 Jul 2026, 09:15',
    status: 'Sent',
  },
  {
    id: 'BRD-316',
    subject: 'Verify your NIN to keep selling after 15 August',
    audience: 'Unverified farmers',
    channel: 'SMS',
    recipients: 1_204,
    sentBy: 'Osman Jah',
    sentAt: '24 Jul 2026, 11:40',
    status: 'Sent',
  },
  {
    id: 'BRD-319',
    subject: 'Bo district buyer meet-up — 12 August',
    audience: 'Buyers in Bo',
    channel: 'In-app',
    recipients: 412,
    sentBy: 'Ibrahim Sesay',
    sentAt: '03 Aug 2026, 08:00',
    status: 'Scheduled',
  },
]
