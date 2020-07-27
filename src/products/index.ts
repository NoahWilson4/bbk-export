const AsianStyleCodAndVegetableSoup = require('./Asian Style Cod and Vegetable Soup.json');
const CheesyBlackBeanTamalePie = require('./Cheesy Black Bean Tamale Pie.json');
const Compote = require('./Compote.json');
const CornedBeef = require('./Corned Beef.json');
const GrassfedHousemadeCornedBeefHash = require('./Grassfed Housemade Corned Beef Hash.json');
const GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese = require('./Greek Zucchini Ankara with Meatballs and Optional Feta Cheese.json');
const MustardAndRosemaryTurkeyBurgers = require('./Mustard and Rosemary Turkey Burgers.json');
const Polenta = require('./Polenta.json');
const RedEnchiladaSauce = require('./Red Enchilada Sauce.json');
const SilkyCoconutPannaCottawithPeachCompote = require('./Silky Coconut Panna Cotta with Peach Compote.json');

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
  AsianStyleCodAndVegetableSoup,
  CheesyBlackBeanTamalePie,
  Compote,
  CornedBeef,
  GrassfedHousemadeCornedBeefHash,
  GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese,
  MustardAndRosemaryTurkeyBurgers,
  Polenta,
  RedEnchiladaSauce,
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
