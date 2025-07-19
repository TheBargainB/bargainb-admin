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
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Edeka_Logo.svg/512px-Edeka_Logo.svg.png",
    country: "DE"
  },
  {
    id: "rewe",
    name: "REWE",
    url: "rewe.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Logo_REWE.svg/512px-Logo_REWE.svg.png",
    country: "DE"
  },
  {
    id: "aldi-nord",
    name: "Aldi Nord",
    url: "aldi-nord.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Aldi_Nord_Logo.svg/512px-Aldi_Nord_Logo.svg.png",
    country: "DE"
  },
  {
    id: "aldi-sued",
    name: "Aldi Süd",
    url: "aldi-sued.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Aldi_Sued_Logo.svg/512px-Aldi_Sued_Logo.svg.png",
    country: "DE"
  },
  {
    id: "lidl-de",
    name: "Lidl",
    url: "lidl.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lidl-Logo.svg/512px-Lidl-Logo.svg.png",
    country: "DE"
  },
  {
    id: "kaufland",
    name: "Kaufland",
    url: "kaufland.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kaufland_Logo.svg/512px-Kaufland_Logo.svg.png",
    country: "DE"
  },
  {
    id: "netto-marken-discount",
    name: "Netto Marken-Discount",
    url: "netto-online.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Netto_Marken-Discount_2018_logo.svg/512px-Netto_Marken-Discount_2018_logo.svg.png",
    country: "DE"
  },
  {
    id: "spar-de",
    name: "Spar",
    url: "spar.de",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Spar_logo.svg/512px-Spar_logo.svg.png",
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
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Delhaize_logo.svg/512px-Delhaize_logo.svg.png",
    country: "BE"
  },
  {
    id: "carrefour-market",
    name: "Carrefour Market",
    url: "carrefour.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Carrefour_Market_logo.svg/512px-Carrefour_Market_logo.svg.png",
    country: "BE"
  },
  {
    id: "lidl-be",
    name: "Lidl",
    url: "lidl.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lidl-Logo.svg/512px-Lidl-Logo.svg.png",
    country: "BE"
  },
  {
    id: "aldi-be",
    name: "Aldi",
    url: "aldi.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Aldi_Logo.svg/512px-Aldi_Logo.svg.png",
    country: "BE"
  },
  {
    id: "spar-be",
    name: "Spar",
    url: "spar.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Spar_logo.svg/512px-Spar_logo.svg.png",
    country: "BE"
  },
  {
    id: "okay",
    name: "OKay",
    url: "okay.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/OKay_logo.svg/512px-OKay_logo.svg.png",
    country: "BE"
  },
  {
    id: "bio-planet",
    name: "Bio‑Planet",
    url: "bioplanet.be",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Bio-Planet_logo.svg/512px-Bio-Planet_logo.svg.png",
    country: "BE"
  },
  // France Stores
{
    id: "e-leclerc",
    name: "E.Leclerc",
    url: "e.leclerc",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/E.Leclerc_logo.svg/512px-E.Leclerc_logo.svg.png",
    country: "FR"
  },
  {
    id: "carrefour",
    name: "Carrefour",
    url: "carrefour.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "FR"
  },
  {
    id: "intermarche",
    name: "Intermarché",
    url: "intermarche.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Intermarch%C3%A9_logo.svg/512px-Intermarch%C3%A9_logo.svg.png",
    country: "FR"
  },
  {
    id: "cooperative-u",
    name: "Coopérative U",
    url: "magasins-u.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Super_U_logo.svg/512px-Super_U_logo.svg.png",
    country: "FR"
  },
  {
    id: "auchan",
    name: "Auchan",
    url: "auchan.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Auchan_Logo.svg/512px-Auchan_Logo.svg.png",
    country: "FR"
  },
  {
    id: "monoprix",
    name: "Monoprix",
    url: "monoprix.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Monoprix_logo.svg/512px-Monoprix_logo.svg.png",
    country: "FR"
  },
  {
    id: "franprix",
    name: "Franprix",
    url: "franprix.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Franprix_logo.svg/512px-Franprix_logo.svg.png",
    country: "FR"
  },
  {
    id: "netto-fr",
    name: "Netto",
    url: "netto.fr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Netto_Logo.svg/512px-Netto_Logo.svg.png",
    country: "FR"
  },
  // Canada Stores
{
    id: "loblaws",
    name: "Loblaws",
    url: "loblaws.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Loblaws_logo.svg",
    country: "CA"
  },
  {
    id: "real-canadian-superstore",
    name: "Real Canadian Superstore",
    url: "realcanadiansuperstore.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Real_Canadian_Superstore_logo.svg/512px-Real_Canadian_Superstore_logo.svg.png",
    country: "CA"
  },
  {
    id: "no-frills",
    name: "No Frills",
    url: "nofrills.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/No_Frills_logo.svg/512px-No_Frills_logo.svg.png",
    country: "CA"
  },
  {
    id: "sobeys",
    name: "Sobeys",
    url: "sobeys.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Sobeys_logo.svg/512px-Sobeys_logo.svg.png",
    country: "CA"
  },
  {
    id: "metro",
    name: "Metro",
    url: "metro.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Metro_Inc_logo.svg/512px-Metro_Inc_logo.svg.png",
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
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/FreshCo_logo.svg/512px-FreshCo_logo.svg.png",
    country: "CA"
  },
  {
    id: "maxi",
    name: "Maxi",
    url: "maxi.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Maxi_logo.svg/512px-Maxi_logo.svg.png",
    country: "CA"
  },
  {
    id: "independent-grocer",
    name: "Your Independent Grocer",
    url: "yourindependentgrocer.ca",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Your_Independent_Grocer_Logo.svg/512px-Your_Independent_Grocer_Logo.svg.png",
    country: "CA"
  },
  // United Kingdom Stores
{
    id: "tesco",
    name: "Tesco",
    url: "tesco.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Tesco_Logo.svg/512px-Tesco_Logo.svg.png",
    country: "UK"
  },
  {
    id: "sainsburys",
    name: "Sainsbury's",
    url: "sainsburys.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Sainsburys_Logo.svg/512px-Sainsburys_Logo.svg.png",
    country: "UK"
  },
  {
    id: "asda",
    name: "Asda",
    url: "asda.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Asda_logo_2010.svg/512px-Asda_logo_2010.svg.png",
    country: "UK"
  },
  {
    id: "morrisons",
    name: "Morrisons",
    url: "morrisons.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Morrisons_logo.svg/512px-Morrisons_logo.svg.png",
    country: "UK"
  },
  {
    id: "aldi-uk",
    name: "ALDI",
    url: "aldi.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Aldi_Logo.svg/512px-Aldi_Logo.svg.png",
    country: "UK"
  },
  {
    id: "lidl-uk",
    name: "Lidl",
    url: "lidl.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lidl-Logo.svg/512px-Lidl-Logo.svg.png",
    country: "UK"
  },
  {
    id: "coop-food",
    name: "Co-op Food",
    url: "coop.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Co-operative_clover_leaf_logo.svg/512px-Co-operative_clover_leaf_logo.svg.png",
    country: "UK"
  },
  {
    id: "waitrose",
    name: "Waitrose",
    url: "waitrose.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Waitrose_%26_Partners_logo.svg/512px-Waitrose_%26_Partners_logo.svg.png",
    country: "UK"
  },
  {
    id: "londis",
    name: "Londis",
    url: "londis.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Londis_logo.svg/512px-Londis_logo.svg.png",
    country: "UK"
  },
  {
    id: "nisa",
    name: "Nisa",
    url: "nisa.co.uk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nisa_logo.svg/512px-Nisa_logo.svg.png",
    country: "UK"
  },
  // Spain Stores
{
    id: "mercadona",
    name: "Mercadona",
    url: "mercadona.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mercadona_logo.svg/512px-Mercadona_logo.svg.png",
    country: "ES"
  },
  {
    id: "carrefour-es",
    name: "Carrefour",
    url: "carrefour.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "ES"
  },
  {
    id: "lidl-es",
    name: "Lidl",
    url: "lidl.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lidl-Logo.svg/512px-Lidl-Logo.svg.png",
    country: "ES"
  },
  {
    id: "aldi-es",
    name: "Aldi",
    url: "aldi.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Aldi_Logo.svg/512px-Aldi_Logo.svg.png",
    country: "ES"
  },
  {
    id: "eroski",
    name: "Eroski",
    url: "eroski.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Eroski_logo.svg/512px-Eroski_logo.svg.png",
    country: "ES"
  },
  {
    id: "dia",
    name: "DIA",
    url: "dia.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Día_Logo.svg/512px-Día_Logo.svg.png",
    country: "ES"
  },
  {
    id: "alcampo",
    name: "Alcampo",
    url: "alcampo.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Alcampo_logo.svg/512px-Alcampo_logo.svg.png",
    country: "ES"
  },
  {
    id: "consum",
    name: "Consum",
    url: "consum.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Consum_logo.svg/512px-Consum_logo.svg.png",
    country: "ES"
  },
  {
    id: "bonpreu",
    name: "Bon Preu",
    url: "bonpreu.cat",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bon_Preu_logo.svg/512px-Bon_Preu_logo.svg.png",
    country: "ES"
  },
  {
    id: "hipercor",
    name: "Hipercor",
    url: "hipercor.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hipercor_logo.svg/512px-Hipercor_logo.svg.png",
    country: "ES"
  },
  {
    id: "spar-es",
    name: "SPAR",
    url: "spar.es",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Spar_logo.svg/512px-Spar_logo.svg.png",
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
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "EG"
  },
  {
    id: "spinneys-eg",
    name: "Spinneys",
    url: "spinneys.com.eg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Spinneys_logo.svg/512px-Spinneys_logo.svg.png",
    country: "EG"
  },
  {
    id: "hyper-one",
    name: "Hyper One",
    url: "hyperone.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Hyper_One_logo.png/512px-Hyper_One_logo.png",
    country: "EG"
  },
  {
    id: "metro-eg",
    name: "Metro",
    url: "metro-markets.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Metro_markets_logo.svg/512px-Metro_markets_logo.svg.png",
    country: "EG"
  },
  {
    id: "kazyon",
    name: "Kazyon",
    url: "kazyon.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Kazyon_logo.svg/512px-Kazyon_logo.svg.png",
    country: "EG"
  },
  {
    id: "fathalla-market",
    name: "Fathalla Market",
    url: "fathallamarkets.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Fathalla_Markets_logo.svg/512px-Fathalla_Markets_logo.svg.png",
    country: "EG"
  },
  {
    id: "seoudi",
    name: "Seoudi",
    url: "seoudi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Seoudi_logo.svg/512px-Seoudi_logo.svg.png",
    country: "EG"
  },
  {
    id: "bim-eg",
    name: "BIM",
    url: "bim.com.eg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/BIM_logo.svg/512px-BIM_logo.svg.png",
    country: "EG"
  },
  {
    id: "ragab-sons",
    name: "Ragab Sons",
    url: "ragabsons.com.eg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Ragab_Sons_logo.svg/512px-Ragab_Sons_logo.svg.png",
    country: "EG"
  },
  {
    id: "kheir-zaman",
    name: "Kheir Zaman",
    url: "kheir-zaman.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Kheir_Zaman_logo.svg/512px-Kheir_Zaman_logo.svg.png",
    country: "EG"
  },
  // Qatar Stores
{
    id: "al-meera",
    name: "Al Meera",
    url: "almeera.com.qa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Al+Meera",
    country: "QA"
  },
  {
    id: "carrefour-qa",
    name: "Carrefour",
    url: "carrefourqatar.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "QA"
  },
  {
    id: "lulu-qa",
    name: "LuLu Hypermarket",
    url: "luluhypermarket.com/en-qa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7f/LuLuGroupInternationalLogo.png",
    country: "QA"
  },
  {
    id: "safari-hypermarket",
    name: "Safari Hypermarket",
    url: "safarihypermarket.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Safari",
    country: "QA"
  },
  {
    id: "rawabi-hypermarket",
    name: "Rawabi Hypermarket",
    url: "rawabihypermarket.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Rawabi",
    country: "QA"
  },
  {
    id: "paris-hypermarket",
    name: "Paris Hypermarket",
    url: "parishypermarket.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Paris",
    country: "QA"
  },
  {
    id: "grand-hypermarket",
    name: "Grand Hypermarket",
    url: "online.grandhyper.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Grand",
    country: "QA"
  },
  {
    id: "food-express",
    name: "Food Express Supermarket",
    url: "foodexpress.supermarket",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Food+Express",
    country: "QA"
  },
  {
    id: "family-food-centre",
    name: "Family Food Centre",
    url: "family.qa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Family+Food",
    country: "QA"
  },
  {
    id: "souk-al-baladi",
    name: "Souq Al Baladi",
    url: "baladiholding.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Al+Baladi",
    country: "QA"
  },
  {
    id: "new-indian-supermarket",
    name: "New Indian Supermarket",
    url: "newindiansm.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=New+Indian",
    country: "QA"
  },
  {
    id: "al-shair",
    name: "Al Shair Supermarket",
    url: "alshair.com.qa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Al+Shair",
    country: "QA"
  },
  // Saudi Arabia Stores
  {
    id: "lulu-sa",
    name: "LuLu Hypermarket",
    url: "lulugroup.com/en-sa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7f/LuLuGroupInternationalLogo.png",
    country: "SA"
  },
  {
    id: "panda",
    name: "Panda Retail Company",
    url: "panda.com.sa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Panda",
    country: "SA"
  },
  {
    id: "al-othaim",
    name: "Al Othaim Markets",
    url: "othaimmarkets.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Al+Othaim",
    country: "SA"
  },
  {
    id: "tamimi",
    name: "Tamimi Markets",
    url: "tamimimarkets.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Tamimi",
    country: "SA"
  },
  {
    id: "carrefour-sa",
    name: "Carrefour",
    url: "carrefourksa.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "SA"
  },
  {
    id: "bindawood",
    name: "BinDawood Stores",
    url: "bindawood.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=BinDawood",
    country: "SA"
  },
  {
    id: "danube",
    name: "Danube Company",
    url: "danube.sa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Danube",
    country: "SA"
  },
  {
    id: "al-raya",
    name: "Al Raya Supermarket",
    url: "alraya.com.sa",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Al+Raya",
    country: "SA"
  },
  {
    id: "farm",
    name: "Farm Superstores",
    url: "farmsuperstores.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Farm",
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
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carrefour_Logo.svg/512px-Carrefour_Logo.svg.png",
    country: "AE"
  },
  {
    id: "lulu-hypermarket",
    name: "LuLu Hypermarket",
    url: "luluhypermarket.com/en-ae",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7f/LuLuGroupInternationalLogo.png",
    country: "AE"
  },
  {
    id: "spinneys-uae",
    name: "Spinneys",
    url: "spinneys.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Spinneys",
    country: "AE"
  },
  {
    id: "union-coop",
    name: "Union Coop",
    url: "unioncoop.ae",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Union+Coop",
    country: "AE"
  },
  {
    id: "choithrams",
    name: "Choithrams",
    url: "choithrams.com",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Choithrams",
    country: "AE"
  },
  {
    id: "geant",
    name: "Géant",
    url: "geant.ae",
    logo: "https://via.placeholder.com/512x512/00B207/FFFFFF?text=Geant",
    country: "AE"
  },
  {
    id: "waitrose-uae",
    name: "Waitrose",
    url: "waitrose.com/ae",
    logo: "https://upload.wikimedia.org/wikipedia/commons/…/Waitrose_logo.svg",
    country: "AE"
  },
  {
    id: "nesto",
    name: "Nesto",
    url: "nestogroup.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/…/NESTO_LOGO.jpg",
    country: "AE"
  },
  {
    id: "viva",
    name: "Viva Supermarket",
    url: "vivauae.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/…/Viva_logo.svg",
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