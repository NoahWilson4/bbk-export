const AsianStyleCodAndVegetableSoup = require('./Asian Style Cod and Vegetable Soup.json');
const CheesyBlackBeanTamalePie = require('./Cheesy Black Bean Tamale Pie.json');
const CabbageSlawLime = require('./Crisp Cabbage Slaw with Lime Cumin Vinaigrette.json');
const CaramelizedOnionandWhiteBeanDip = require('./Caramelized Onion and White Bean Dip.json');
const Compote = require('./Compote.json');
const CornedBeef = require('./Corned Beef.json');
const FreshBeetandCarrotSalad = require('./Fresh Beet and Carrot Salad');
const GoldenGarlicRice = require('./Golden Garlic Rice.json');
const GrassfedHousemadeCornedBeefHash = require('./Grassfed Housemade Corned Beef Hash.json');
const GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese = require('./Greek Zucchini Ankara with Meatballs and Optional Feta Cheese.json');
const ItalianSauteedSweetPepperSkillet = require('./Italian Sauteed Sweet Pepper Skillet (Optional Chicken Sausage).json');
const MustardAndRosemaryTurkeyBurgers = require('./Mustard and Rosemary Turkey Burgers.json');
const NourishingBlueberryLemonGranolaPaleo = require('./Nourishing Blueberry Lemon Granola (Paleo).json');
const Polenta = require('./Polenta.json');
const PurityOrganicCoffeeToxinFree = require('./Purity Organic Coffee (Toxin Free).json');
const RedEnchiladaSauce = require('./Red Enchilada Sauce.json');
const RefreshingCoconutBlackBeanStewwithLimeEnjoyWarmorChilled = require('./Refreshing Coconut Black Bean Stew with Lime (Enjoy Warm or Chilled).json');
const SanctuaryHoneyChaiConcentrate = require('./Sanctuary Honey Chai Concentrate.json');
const SilkyCoconutPannaCottawithPeachCompote = require('./Silky Coconut Panna Cotta with Peach Compote.json');
const SummerRatatouilleWithOptionalSpicyGrassfedBeefSausage = require('./Summer Ratatouille with Optional Spicy Grassfed Beef Sausage.json');
const TheBestTunaSaladwithPicklesandDill = require('./The Best Tuna Salad with Pickles and Dill.json');
const VibrantThaiPorkandVeggies = require('./Vibrant Thai Pork and Veggies.json');
const BlueberryCashewCheesecakeTartsPaleo = require('./Blueberry Cashew Cheesecake Tarts (Paleo).json');
const CitrusDillGarlicWildAlaskanCod = require('./Citrus, Dill & Garlic Wild Alaskan Cod.json');
const RoastedSweetPepperSoupwithOptionalChickenBasilSausage = require('./Roasted Sweet Pepper Soup with Optional Chicken Basil Sausage.json');
const WaldorfChickenSalad = require('./Waldorf Chicken Salad.json');
const CreamyCapreseQuinoaBakewithOptionalChickenBasilSausage = require('./Creamy Caprese Quinoa Bake with Optional Chicken Basil Sausage.json');
const OrganicRoastSweetPotatoWedges = require('./Organic Roast Sweet Potato Wedges.json');
const SmokedPaprikaAioli = require('./Smoked Paprika Aioli.json');
const FlavorfulFreshCarrotSalad = require('./Flavorful Fresh Carrot Salad.json');
const GrassfedBeefPorkMeatloafwithTomatoMustardGlaze = require('./Grassfed Beef & Pork Meatloaf with Tomato Mustard Glaze.json');
const GreekZucchiniAnkarawithFetaCheeseandOptionalChickenSausage = require('./Greek Zucchini Ankara with Feta Cheese and Optional Chicken Sausage.json');
const SummerMinestronewithHousemadeItalianSausage = require('./Summer Minestrone with Housemade Italian Sausage.json');
const VersatileLemonCurdDairyFreeSugarFree = require('./Versatile Lemon Curd (Dairy Free & Sugar Free).json');
const SummerQuinoaPilafwithLemonandHerbs = require('./Summer Quinoa Pilaf with Lemon and Herbs.json');
const SoTastyBeetHummusPaleo = require('./So Tasty Beet Hummus (Paleo).json');
const CauliflowerFriedRicewithLocalPork = require('./Cauliflower Fried Rice with Local Pork (Paleo).json');

const products: Product[] = [
  AsianStyleCodAndVegetableSoup,
  BlueberryCashewCheesecakeTartsPaleo,
  CabbageSlawLime,
  CaramelizedOnionandWhiteBeanDip,
  CauliflowerFriedRicewithLocalPork,
  CheesyBlackBeanTamalePie,
  CitrusDillGarlicWildAlaskanCod,
  Compote,
  CornedBeef,
  CreamyCapreseQuinoaBakewithOptionalChickenBasilSausage,
  FreshBeetandCarrotSalad,
  FlavorfulFreshCarrotSalad,
  GoldenGarlicRice,
  GrassfedBeefPorkMeatloafwithTomatoMustardGlaze,
  GrassfedHousemadeCornedBeefHash,
  GreekZucchiniAnkarawithFetaCheeseandOptionalChickenSausage,
  GreekZucchiniAnkaraWithMeatballsAndOptionalFetaCheese,
  ItalianSauteedSweetPepperSkillet,
  MustardAndRosemaryTurkeyBurgers,
  NourishingBlueberryLemonGranolaPaleo,
  OrganicRoastSweetPotatoWedges,
  Polenta,
  PurityOrganicCoffeeToxinFree,
  RedEnchiladaSauce,
  RefreshingCoconutBlackBeanStewwithLimeEnjoyWarmorChilled,
  RoastedSweetPepperSoupwithOptionalChickenBasilSausage,
  SanctuaryHoneyChaiConcentrate,
  SilkyCoconutPannaCottawithPeachCompote,
  SmokedPaprikaAioli,
  SoTastyBeetHummusPaleo,
  SummerMinestronewithHousemadeItalianSausage,
  SummerRatatouilleWithOptionalSpicyGrassfedBeefSausage,
  SummerQuinoaPilafwithLemonandHerbs,
  TheBestTunaSaladwithPicklesandDill,
  VersatileLemonCurdDairyFreeSugarFree,
  VibrantThaiPorkandVeggies,
  WaldorfChickenSalad,
];

export const instructionDefaults: { [key: string]: string } = {
  default: 'Heat gently in a saucepan and enjoy.',
  'Frozen Tin': 'Defrost. Bake at 350 for 15 min or until warm.',
  'One Tin': 'Bake at 350 for 15 min or until warm.',
  'One Tin / With Cheese': 'Bake at 350 for 15 min or until warm.',
  'One Tin / Dairy Free': 'Bake at 350 for 15 min or until warm.',
  'One Loaf': 'Bake at 350 for 15 min or until warm.',
  'Four Cupcakes': 'Enjoy within 2 days or freeze.',
  'Four Muffins': 'Enjoy within 2 days or freeze.',
  'Half Dozen': 'Enjoy within 2 days or freeze.',
  'One Dozen': 'Enjoy within 2 days or freeze.',
  Half: 'Bake at 350 for 10-15 min or until warm.',
  Full: 'Bake at 350 for 10-15 min or until warm.',
  Dozen: 'Enjoy within 2 days or freeze.',
  'Frozen Pint':
    'Defrost or run under warm water. Slide out. Heat gently in a saucepan and enjoy.',
  'Frozen Half Pint': 'Defrost and enjoy.',
  'Frozen 24oz':
    'Defrost or run under warm water. Slide out. Heat gently in a saucepan and enjoy.',
  'Four Burgers': 'Heat in an oiled skillet or heat at 350 in the oven.',
  '4 Burgers': 'Heat in an oiled skillet or heat at 350 in the oven.',
  'Frozen Pint / Feta':
    'Defrost or run under warm water. Slide out. Heat gently in a saucepan and enjoy.',
  'Frozen CHICKEN':
    'Defrost or run under warm water & slide out. Heat gently in a saucepan.',
  'Frozen Burgers 4-Pack': 'Defrost then heat in an oiled skillet.',
  'Frozen Four Pack': 'Defrost and heat in an oiled skillet.',
  'Frozen 4 Pack': 'Defrost then heat in an oiled skillet.',
  'Frozen Four Burgers': 'Defrost then heat in an oiled skillet.',
};

export interface ProductLabelInstructions {
  [key: string]: string | undefined;
  default: string | undefined;
}

export interface ProductLabel {
  title?: string;
  instructions?: ProductLabelInstructions;
}

export interface Product {
  title: string;
  label?: ProductLabel;
  recipe: {};
}

export default products;
