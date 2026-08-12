import { Ionicons } from '@expo/vector-icons';

// The farmer web app (components/farmer/products-view.tsx) stores produce
// under these exact Category strings — 'Root Crops' and 'Grains & Cereals'
// rather than the shorter labels the buyer-facing design uses. `value` is
// what's sent to GET /api/produce?category=..., `label` is what's shown.
export interface ProduceCategory {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const PRODUCE_CATEGORIES: ProduceCategory[] = [
  { label: 'Vegetables', value: 'Vegetables', icon: 'leaf-outline' },
  { label: 'Fruits', value: 'Fruits', icon: 'nutrition-outline' },
  { label: 'Grains', value: 'Grains & Cereals', icon: 'flower-outline' },
  { label: 'Legumes', value: 'Legumes', icon: 'ellipse-outline' },
  { label: 'Tubers', value: 'Root Crops', icon: 'restaurant-outline' },
];
