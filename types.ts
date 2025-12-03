
export interface RecipeDetails {
  ingredients: string[];
  preparation: { title: string; step: string }[];
  usage: { title: string; content: string }[];
  tips: string[];
  variants: string[];
  warnings: string[];
}

export interface ProtocolDay {
  day: number;
  title: string;
  focus: string;
  tricks: string[];
}

export interface GuideBlock {
  type: 'text' | 'list' | 'tip' | 'warning' | 'subtitle' | 'recipe_card';
  content?: string;
  items?: string[];
  title?: string;
  emoji?: string;
}

export interface GuideSection {
  title: string;
  blocks: GuideBlock[];
}

export interface Product {
  id: string;
  title: string;
  category: string;
  image: string;
  isLocked: boolean;
  description?: string;
  lessons?: number;
  duration?: string;
  recipeDetails?: RecipeDetails;
  protocolDetails?: ProtocolDay[];
  trackerDetails?: boolean;
  guideDetails?: GuideSection[];
}

export type Tab = 'home' | 'profile';

export type ViewState = 'login' | 'main';

export interface User {
  name: string;
  email: string;
  avatar: string;
}
