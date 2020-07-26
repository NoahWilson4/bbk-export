import SilkyCoconutPannaCottawithPeachCompote from './Silky Coconut Panna Cotta with Peach Compote.json';
import MustardAndRosemaryTurkeyBurgers from './Mustard and Rosemary Turkey Burgers.json';
import GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese from './Greek Zucchini Ankara with Meatballs and Optional Feta Cheese.json';

export interface ProductLabel {
  title?: string;
  instructions?: string;
}

export interface Product {
  title: string;
  label?: ProductLabel;
  recipe: {};
}

const products: Product[] = [
  GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese,
  MustardAndRosemaryTurkeyBurgers,
  SilkyCoconutPannaCottawithPeachCompote,
];

export const instructionDefaults: { [key: string]: string } = {
  default: 'Heat gently in a saucepan and enjoy.',
  'Frozen Tin': 'Defrost. Bake at 350 for 15 min or until warm.',
  'One Tin': 'Bake at 350 for 15 min or until warm.',
  'Four Cupcakes': 'Enjoy within 2 days or freeze.',
  'Four Muffins': 'Enjoy within 2 days or freeze.',
  'Half Dozen': 'Enjoy within 2 days or freeze.',
  Dozen: 'Enjoy within 2 days or freeze.',
  'Frozen Pint':
    'Defrost or run under warm water. Slide out. Heat gently in a saucepan and enjoy.',
  'Frozen 24oz':
    'Defrost or run under warm water. Slide out. Heat gently in a saucepan and enjoy.',
  'Four Burgers': 'Heat in an oiled skillet or heat at 350 in the oven.',
};

export default products;
