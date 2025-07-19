export interface GroceryStore {
  id: string;
  name: string;
  url: string;
  logo: string;
  country: string;
}

export const groceryStores: GroceryStore[] = [
  // Netherlands Stores
  {
    id: "albert-heijn",
    name: "Albert Heijn",
    url: "ah.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Albert Heijn, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "jumbo",
    name: "Jumbo",
    url: "jumbo.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Jumbo, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "lidl",
    name: "Lidl",
    url: "lidl.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Lidl, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "aldi",
    name: "Aldi",
    url: "aldi.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Aldi, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "coop",
    name: "Coop",
    url: "coop.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Coop, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "dirk",
    name: "Dirk",
    url: "dirk.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Dirk, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "edeka",
    name: "Edeka",
    url: "edeka.de",
    logo: "/supermarkets/Size=X Large, Supermarket=Edeka, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "hoogvilet",
    name: "Hoogvliet",
    url: "hoogvliet.com",
    logo: "/supermarkets/Size=X Large, Supermarket=Hoogvilet, color=On Light Mode.svg",
    country: "NL"
  },
  {
    id: "spar",
    name: "Spar",
    url: "spar.nl",
    logo: "/supermarkets/Size=X Large, Supermarket=Spar, color=On Light Mode.svg",
    country: "NL"
  },

  // United States Stores
  {
    id: "walmart",
    name: "Walmart",
    url: "walmart.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
    country: "US"
  },
  {
    id: "target",
    name: "Target",
    url: "target.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
    country: "US"
  },
  {
    id: "kroger",
    name: "Kroger",
    url: "kroger.com",
    logo: "https://1000logos.net/wp-content/uploads/2017/08/Logo-Kroger.png",
    country: "US"
  },
  {
    id: "safeway",
    name: "Safeway",
    url: "safeway.com",
    logo: "https://logos-world.net/wp-content/uploads/2022/01/Safeway-Logo.png",
    country: "US"
  },
  {
    id: "whole-foods",
    name: "Whole Foods Market",
    url: "wholefoodsmarket.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Whole_Foods_Market_201x_logo.svg",
    country: "US"
  },
  {
    id: "costco",
    name: "Costco",
    url: "costco.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg",
    country: "US"
  },
  {
    id: "sams-club",
    name: "Sam's Club",
    url: "samsclub.com",
    logo: "https://1000logos.net/wp-content/uploads/2021/09/Sams-Club-Logo.png",
    country: "US"
  },
  {
    id: "publix",
    name: "Publix",
    url: "publix.com",
    logo: "https://1000logos.net/wp-content/uploads/2019/08/publix_logo.png",
    country: "US"
  },
  {
    id: "heb",
    name: "H-E-B",
    url: "heb.com",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a1/H-E-B_logo.svg",
    country: "US"
  },
  {
    id: "wegmans",
    name: "Wegmans",
    url: "wegmans.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/WegmansLogo.svg",
    country: "US"
  },
  {
    id: "giant",
    name: "Giant Food",
    url: "giantfood.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Giant_Food_logo.svg",
    country: "US"
  },
  {
    id: "stop-shop",
    name: "Stop & Shop",
    url: "stopandshop.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Stop_%26_Shop_Logo.svg",
    country: "US"
  },
  // Germany Stores
{
    id: "edeka",
    name: "Edeka",
    url: "edeka.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Edeka_Logo_Aktuell.svg",
    country: "DE"
  },
  {
    id: "rewe",
    name: "REWE",
    url: "rewe.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Logo_REWE.svg",
    country: "DE"
  },
  {
    id: "aldi-nord",
    name: "Aldi Nord",
    url: "aldi-nord.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Logo_Aldi_Nord.svg",
    country: "DE"
  },
  {
    id: "aldi-sued",
    name: "Aldi Süd",
    url: "aldi-sued.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Aldi_S%C3%BCd_2017_logo.svg",
    country: "DE"
  },
  {
    id: "lidl-de",
    name: "Lidl",
    url: "lidl.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg",
    country: "DE"
  },
  {
    id: "kaufland",
    name: "Kaufland",
    url: "kaufland.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Kaufland_201x_logo.svg",
    country: "DE"
  },
  {
    id: "netto-marken-discount",
    name: "Netto Marken-Discount",
    url: "netto-online.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Netto_Marken-Discount_2018_logo.svg",
    country: "DE"
  },
  {
    id: "spar-de",
    name: "Spar",
    url: "spar.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Spar-logo.svg",
    country: "DE"
  },
  // Belgium Stores
{
    id: "colruyt",
    name: "Colruyt",
    url: "colruyt.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Colruyt_logo.svg",
    country: "BE"
  },
  {
    id: "delhaize",
    name: "Delhaize",
    url: "delhaize.be",
    logo: "https://cdn.freebiesupply.com/logos/large/2x/delhaize-1-logo-png-transparent.png",
    country: "BE"
  },
  {
    id: "carrefour-market",
    name: "Carrefour Market",
    url: "carrefour.be",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "BE"
  },
  {
    id: "lidl-be",
    name: "Lidl",
    url: "lidl.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg",
    country: "BE"
  },
  {
    id: "aldi-be",
    name: "Aldi",
    url: "aldi.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/AldiWorldwideLogo.svg",
    country: "BE"
  },
  {
    id: "spar-be",
    name: "Spar",
    url: "spar.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Spar-logo.svg",
    country: "BE"
  },
  {
    id: "okay",
    name: "OKay",
    url: "okay.be",
    logo: "https://upload.wikimedia.org/wikipedia/fr/1/17/OKay_logo.png",
    country: "BE"
  },
  {
    id: "bio-planet",
    name: "Bio‑Planet",
    url: "bioplanet.be",
    logo: "https://findvectorlogo.com/wp-content/uploads/2019/06/bio-planet-vector-logo.png",
    country: "BE"
  },
  // France Stores
{
    id: "e-leclerc",
    name: "E.Leclerc",
    url: "e.leclerc",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/E.Leclerc_logo.svg",
    country: "FR"
  },
  {
    id: "carrefour",
    name: "Carrefour",
    url: "carrefour.fr",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "FR"
  },
  {
    id: "intermarche",
    name: "Intermarché",
    url: "intermarche.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Intermarch%C3%A9_logo_2009_classic.svg",
    country: "FR"
  },
  {
    id: "cooperative-u",
    name: "Coopérative U",
    url: "magasins-u.com",
    logo: "https://upload.wikimedia.org/wikipedia/fr/2/2a/Super_U_logo_2009.svg",
    country: "FR"
  },
  {
    id: "auchan",
    name: "Auchan",
    url: "auchan.fr",
    logo: "https://upload.wikimedia.org/wikipedia/fr/c/cd/Logo_Auchan_%282015%29.svg",
    country: "FR"
  },
  {
    id: "monoprix",
    name: "Monoprix",
    url: "monoprix.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Monoprix_logo.svg",
    country: "FR"
  },
  {
    id: "franprix",
    name: "Franprix",
    url: "franprix.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Logo_Franprix_-_2015.svg",
    country: "FR"
  },
  {
    id: "netto-fr",
    name: "Netto",
    url: "netto.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Netto_Marken-Discount_2018_logo.svg",
    country: "FR"
  },
  // Canada Stores
{
    id: "loblaws",
    name: "Loblaws",
    url: "loblaws.ca",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/e2/Loblaws.svg",
    country: "CA"
  },
  {
    id: "real-canadian-superstore",
    name: "Real Canadian Superstore",
    url: "realcanadiansuperstore.ca",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/bb/Real_Canadian_Superstore_logo.svg",
    country: "CA"
  },
  {
    id: "no-frills",
    name: "No Frills",
    url: "nofrills.ca",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/23/No_Frills_logo.svg",
    country: "CA"
  },
  {
    id: "sobeys",
    name: "Sobeys",
    url: "sobeys.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Sobeys_logo.svg",
    country: "CA"
  },
  {
    id: "metro",
    name: "Metro",
    url: "metro.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Metro_Inc._logo.svg",
    country: "CA"
  },
  {
    id: "walmart-ca",
    name: "Walmart Canada",
    url: "walmart.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/512px-Walmart_logo.svg.png",
    country: "CA"
  },
  {
    id: "costco-ca",
    name: "Costco Canada",
    url: "costco.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/512px-Costco_Wholesale_logo.svg.png",
    country: "CA"
  },
  {
    id: "freshco",
    name: "FreshCo",
    url: "freshco.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/FreshCo_logo.svg",
    country: "CA"
  },
  {
    id: "maxi",
    name: "Maxi",
    url: "maxi.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Maxi_%28Canadian_supermarket%29_logo.svg",
    country: "CA"
  },
  {
    id: "independent-grocer",
    name: "Your Independent Grocer",
    url: "yourindependentgrocer.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Independent_Supermarket_Logo20060426.svg",
    country: "CA"
  },
  // United Kingdom Stores
{
    id: "tesco",
    name: "Tesco",
    url: "tesco.com",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b0/Tesco_Logo.svg",
    country: "UK"
  },
  {
    id: "sainsburys",
    name: "Sainsbury's",
    url: "sainsburys.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Sainsbury%27s_Logo.svg",
    country: "UK"
  },
  {
    id: "asda",
    name: "Asda",
    url: "asda.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/ASDA_logo.svg",
    country: "UK"
  },
  {
    id: "morrisons",
    name: "Morrisons",
    url: "morrisons.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Wm_Morrison_Supermarkets_logo.svg",
    country: "UK"
  },
  {
    id: "aldi-uk",
    name: "ALDI",
    url: "aldi.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/AldiWorldwideLogo.svg",
    country: "UK"
  },
  {
    id: "lidl-uk",
    name: "Lidl",
    url: "lidl.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg",
    country: "UK"
  },
  {
    id: "coop-food",
    name: "Co-op Food",
    url: "coop.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/The_Co-Operative_clover_leaf_logo.svg",
    country: "UK"
  },
  {
    id: "waitrose",
    name: "Waitrose",
    url: "waitrose.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Waitrose_%26_Partners_logo.svg",
    country: "UK"
  },
  {
    id: "londis",
    name: "Londis",
    url: "londis.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/LondisLogo.svg",
    country: "UK"
  },
  
  // Spain Stores
{
    id: "mercadona",
    name: "Mercadona",
    url: "mercadona.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/58/Mercadona.svg",
    country: "ES"
  },
  {
    id: "carrefour-es",
    name: "Carrefour",
    url: "carrefour.es",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "ES"
  },
  {
    id: "lidl-es",
    name: "Lidl",
    url: "lidl.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg",
    country: "ES"
  },
  {
    id: "aldi-es",
    name: "Aldi",
    url: "aldi.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/64/AldiWorldwideLogo.svg",
    country: "ES"
  },
  {
    id: "eroski",
    name: "Eroski",
    url: "eroski.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Eroski_logo.svg",
    country: "ES"
  },
  {
    id: "dia",
    name: "DIA",
    url: "dia.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Dia_Logo.svg",
    country: "ES"
  },
  {
    id: "alcampo",
    name: "Alcampo",
    url: "alcampo.es",
    logo: "https://static.wikia.nocookie.net/logosfake/images/1/19/Alcampo2015.svg/",
    country: "ES"
  },
  {
    id: "consum",
    name: "Consum",
    url: "consum.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/79/Consum_Cooperativa2025.png",
    country: "ES"
  },
  {
    id: "bonpreu",
    name: "Bon Preu",
    url: "https://www.bonpreuesclat.cat",
    logo: "https://cdn.brandfetch.io/idzWmvu6t1/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B",
    country: "ES"
  },
  {
    id: "hipercor",
    name: "Hipercor",
    url: "hipercor.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Hipercor_logo.svg",
    country: "ES"
  },
  {
    id: "spar-es",
    name: "SPAR",
    url: "spar.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Spar-logo.svg",
    country: "ES"
  },
  {
    id: "costco-es",
    name: "Costco Spain",
    url: "costco.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Costco_Wholesale_logo_2010-10-26.svg/512px-Costco_Wholesale_logo.svg.png",
    country: "ES"
  },
  
  // Egypt Stores
{
    id: "carrefour-eg",
    name: "Carrefour",
    url: "carrefour.eg",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "EG"
  },
  {
    id: "spinneys-eg",
    name: "Spinneys",
    url: "spinneys.com.eg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/New_spinneys_logo.jpg",
    country: "EG"
  },
  {
    id: "hyper-one",
    name: "Hyper One",
    url: "hyperone.com",
    logo: "https://images.seeklogo.com/logo-png/35/1/hyper-one-logo-png_seeklogo-352639.png",
    country: "EG"
  },
  {
    id: "metro-eg",
    name: "Metro",
    url: "metro-markets.com",
    logo: "https://images.seeklogo.com/logo-png/35/1/metro-supermarket-logo-png_seeklogo-350223.png",
    country: "EG"
  },
  {
    id: "kazyon",
    name: "Kazyon",
    url: "kazyon.com",
    logo: "https://images.crunchbase.com/image/upload/c_pad,h_160,w_160,f_auto,b_white,q_auto:eco,dpr_2/uft1ofrcrwntjxpfiqpj",
    country: "EG"
  },
  {
    id: "fathalla-market",
    name: "Fathalla Market",
    url: "fathallamarkets.com",
    logo: "https://static.ucraft.net/fs/ucraft/userFiles/theyard/images/a-18-0006-16607181556873.png?v=1660718155",
    country: "EG"
  },
  {
    id: "seoudi",
    name: "Seoudi",
    url: "seoudi.com",
    logo: "https://cdn.getcata.com/cata/static/3819118/seoudimarket.png",
    country: "EG"
  },
  {
    id: "bim-eg",
    name: "BIM",
    url: "https://www.bim.eg/",
    logo: "image.png",
    country: "EG"
  },
  {
    id: "ragab-sons",
    name: "Ragab Sons",
    url: "ragabsons.com.eg",
    logo: "https://pinjoor.com/pinjoor/wp-content/uploads/2019/08/Ragab-Sons.jpg",
    country: "EG"
  },
  {
    id: "kheir-zaman",
    name: "Kheir Zaman",
    url: "kheir-zaman.com",
    logo: "https://cdn.getcata.com/cata/static/3832131/kheir-zaman.png",
    country: "EG"
  },
  // Qatar Stores
{
    id: "al-meera",
    name: "Al Meera",
    url: "almeera.com.qa",
    logo: "https://companieslogo.com/img/orig/MERS.QA_BIG-07083976.png?t=1720244492",
    country: "QA"
  },
  {
    id: "carrefour-qa",
    name: "Carrefour",
    url: "carrefourqatar.com",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "QA"
  },
  {
    id: "lulu-qa",
    name: "LuLu Hypermarket",
    url: "luluhypermarket.com/en-qa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Lulu_Hypermarket_logo.png",
    country: "QA"
  },
  {
    id: "safari-hypermarket",
    name: "Safari Hypermarket",
    url: "safarihypermarket.com",
    logo: "https://mysafaricard.com/offers/img/Safari%20Hyper%20Market%20Logo.png",
    country: "QA"
  },
  {
    id: "rawabi-hypermarket",
    name: "Rawabi Hypermarket",
    url: "rawabihypermarket.com",
    logo: "https://www.alrawabigroup.com/uploads/brands/logo601033.jpeg",
    country: "QA"
  },
  {
    id: "paris-hypermarket",
    name: "Paris Hypermarket",
    url: "parishypermarket.com",
    logo: "https://limeio.in/panel/favicons/566image.png",
    country: "QA"
  },
  {
    id: "grand-hypermarket",
    name: "Grand Hypermarket",
    url: "online.grandhyper.com",
    logo: "https://cdn.clicflyer.com/appimages/retailers/retailer_1572_2023040612395295059.jpg",
    country: "QA"
  },
  {
    id: "food-express",
    name: "Food Express Supermarket",
    url: "foodexpress.supermarket",
    logo: "https://images.deliveryhero.io/image/talabat/restaurants/Logo638379747676468335.jpg?width=180",
    country: "QA"
  },
  {
    id: "family-food-centre",
    name: "Family Food Centre",
    url: "family.qa",
    logo: "https://family.qa/media/logo/stores/1/ffc_header.png",
    country: "QA"
  },
  {
    id: "souk-al-baladi",
    name: "Souq Al Baladi",
    url: "baladiholding.com",
    logo: "https://baladiholding.com/storage/companies/1677506079en.jpg",
    country: "QA"
  },
  {
    id: "new-indian-supermarket",
    name: "New Indian Supermarket",
    url: "newindiansm.com",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfTcgXWLT2J6kooSC_By2bY1QLqUPJlYrMuw&s",
    country: "QA"
  },
 
  // Saudi Arabia Stores
  {
    id: "lulu-sa",
    name: "LuLu Hypermarket",
    url: "lulugroup.com/en-sa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Lulu_Hypermarket_logo.png",
    country: "SA"
  },
  {
    id: "panda",
    name: "Panda Retail Company",
    url: "panda.com.sa",
    logo: "https://en.wikipedia.org/wiki/Panda_Retail_Company#/media/File:Panda_Retail_Company_Logo.svg",
    country: "SA"
  },
  {
    id: "al-othaim",
    name: "Al Othaim Markets",
    url: "othaimmarkets.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Abdullah_Al-Othaim_Markets_Logo.jpg",
    country: "SA"
  },
  {
    id: "tamimi",
    name: "Tamimi Markets",
    url: "tamimimarkets.com",
    logo: "https://www.tamimimarkets.com/__template/images/logo-01.png",
    country: "SA"
  },
  {
    id: "carrefour-sa",
    name: "Carrefour",
    url: "carrefourksa.com",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "SA"
  },
  {
    id: "bindawood",
    name: "BinDawood Stores",
    url: "bindawood.com",
    logo: "https://en.wikipedia.org/wiki/BinDawood_Stores#/media/File:BinDawood_logo.jpg",
    country: "SA"
  },
  {
    id: "danube",
    name: "Danube Company",
    url: "danube.sa",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/66/Danube.png",
    country: "SA"
  },
  {
    id: "al-raya",
    name: "Al Raya Supermarket",
    url: "alraya.com.sa",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0VJVqGvkffXwqChpNiKTLDn3Y1HQc1pC2CA&s",
    country: "SA"
  },
  {
    id: "farm",
    name: "Farm Superstores",
    url: "farmsuperstores.com",
    logo: "https://www.farm.com.sa/images/FrontEnd/New-Farm-Logo.png",
    country: "SA"
  },
  {
    id: "othaim-spar",
    name: "SPAR Saudi",
    url: "sparsak.com.sa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Spar_logo.svg/512px-Spar_logo.svg.png",
    country: "SA"
  },
  // UAE Stores
{
    id: "carrefour-uae",
    name: "Carrefour",
    url: "carrefouruae.com",
    logo: "https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg",
    country: "AE"
  },
  {
    id: "lulu-hypermarket",
    name: "LuLu Hypermarket",
    url: "luluhypermarket.com/en-ae",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Lulu_Hypermarket_logo.png",
    country: "AE"
  },
  {
    id: "spinneys-uae",
    name: "Spinneys",
    url: "spinneys.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/New_spinneys_logo.jpg",
    country: "AE"
  },
  {
    id: "union-coop",
    name: "Union Coop",
    url: "unioncoop.ae",
    logo: "https://en.wikipedia.org/wiki/Union_Coop#/media/File:Union_Coop.svg",
    country: "AE"
  },
  {
    id: "choithrams",
    name: "Choithrams",
    url: "choithrams.com",
    logo: "https://choithramsgcc.com/public/uploads/contents/Choithrams-logo.jpg",
    country: "AE"
  },
  {
    id: "geant",
    name: "Géant",
    url: "geant.ae",
    logo: "https://www.saharacentre.com/storage/attachments/0/Geant_Hypermarket_logo_Standard_Version_683248_147624.jpg",
    country: "AE"
  },
  {
    id: "waitrose-uae",
    name: "Waitrose",
    url: "waitrose.com/ae",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Waitrose_%26_Partners_logo.svg",
    country: "AE"
  },
  {
    id: "nesto",
    name: "Nesto",
    url: "nestogroup.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/88/NESTO_LOGO.jpg",
    country: "AE"
  },
  {
    id: "viva",
    name: "Viva Supermarket",
    url: "vivauae.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Viva_Logo.svg",
    country: "AE"
  }
  
  
  
  
  
  
  
  
  
];

// Helper function to get stores by country
export const getStoresByCountry = (country: string): GroceryStore[] => {
  return groceryStores.filter(store => store.country === country);
};

// Helper function to get all available countries
export const getAvailableCountries = (): string[] => {
  const countries = groceryStores.map(store => store.country);
  return [...new Set(countries)];
}; 