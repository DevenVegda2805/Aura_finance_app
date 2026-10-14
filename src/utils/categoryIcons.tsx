import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Coffee,
  Home,
  Car,
  Smartphone,
  Dumbbell,
  ShieldCheck,
  Plane,
  Laptop,
  Sparkles,
  HeartPulse,
  Film,
  BookOpen,
  Gift,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Briefcase,
  HelpCircle,
  LucideProps
} from 'lucide-react';

export function getCategoryIcon(iconName: string, props?: LucideProps): React.ReactElement {
  switch (iconName.toLowerCase()) {
    case 'home':
    case 'housing':
      return <Home {...props} />;
    case 'shoppingcart':
    case 'groceries':
      return <ShoppingCart {...props} />;
    case 'utensils':
    case 'dining':
    case 'restaurant':
      return <Utensils {...props} />;
    case 'coffee':
    case 'cafe':
      return <Coffee {...props} />;
    case 'car':
    case 'transport':
    case 'travel':
      return <Car {...props} />;
    case 'smartphone':
    case 'bills':
    case 'utilities':
      return <Smartphone {...props} />;
    case 'film':
    case 'entertainment':
    case 'subscriptions':
      return <Film {...props} />;
    case 'dumbbell':
    case 'fitness':
    case 'gym':
      return <Dumbbell {...props} />;
    case 'heartpulse':
    case 'health':
    case 'medical':
      return <HeartPulse {...props} />;
    case 'sparkles':
    case 'shopping':
    case 'personal':
      return <Sparkles {...props} />;
    case 'laptop':
    case 'tech':
    case 'electronics':
      return <Laptop {...props} />;
    case 'plane':
    case 'vacation':
      return <Plane {...props} />;
    case 'shieldcheck':
    case 'emergency':
    case 'insurance':
      return <ShieldCheck {...props} />;
    case 'bookopen':
    case 'education':
      return <BookOpen {...props} />;
    case 'gift':
      return <Gift {...props} />;
    case 'piggybank':
    case 'savings':
      return <PiggyBank {...props} />;
    case 'trendingup':
    case 'investment':
      return <TrendingUp {...props} />;
    case 'briefcase':
    case 'salary':
    case 'income':
      return <Briefcase {...props} />;
    default:
      return <DollarSign {...props} />;
  }
}
