// The Threadline catalogue, ported from ERC20s/threadline (scripts/products.js).
// This is the single source of product data: the web pages read it through
// GET /products and GET /products/:id, never from a copy of their own.
// Images are seeded placeholder photographs; swap the `image` values for real
// photography when there is some.

const img = (seed) => `https://picsum.photos/seed/threadline-${seed}/900/1100`;

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
const ONE_SIZE = ["One size"];

export const ALL_CATEGORIES = "All";
export const RELATED_LIMIT = 4;

export const products = [
  {
    id: "everyday-tee",
    name: "Everyday Tee",
    price: 38,
    category: "Tops",
    featured: true,
    image: img("tee"),
    alt: "Model wearing the Threadline Everyday Tee",
    blurb: "Soft combed cotton, cut for a modern relaxed fit.",
    description: "The tee we make first every season. Mid-weight combed cotton that keeps its shape through the wash, with a slightly dropped shoulder and a clean twin-needle hem.",
    details: ["100% combed organic cotton, 180gsm", "Relaxed fit — size down for a closer cut", "Machine wash cold, dry flat"],
    sizes: CLOTHING_SIZES,
    fitNote: "Cut relaxed with a dropped shoulder — size down for a closer fit.",
  },
  {
    id: "relaxed-shirt",
    name: "Relaxed Shirt",
    price: 48,
    category: "Shirts",
    featured: true,
    image: img("relaxed-shirt"),
    alt: "Threadline Relaxed Shirt on a hanger",
    blurb: "An easy overshirt-weight button-down for every season.",
    description: "Washed cotton poplin with a soft collar and a single chest pocket. Roomy enough to layer over a tee, tidy enough to wear on its own.",
    details: ["Washed cotton poplin", "Boxy body, straight hem", "Corozo buttons"],
    sizes: CLOTHING_SIZES,
    fitNote: "Boxy and roomy enough to layer over a tee — take your usual size.",
  },
  {
    id: "lightweight-hoodie",
    name: "Lightweight Hoodie",
    price: 68,
    category: "Knitwear",
    featured: true,
    image: img("hoodie"),
    alt: "Threadline Lightweight Hoodie folded on a bench",
    blurb: "Loopback cotton that works indoors and out.",
    description: "A three-season hoodie in loopback cotton — warm without the bulk. Ribbed cuffs, a lined hood and a flat drawcord that stays put.",
    details: ["100% loopback cotton, 300gsm", "Ribbed cuffs and hem", "Unisex sizing"],
    sizes: CLOTHING_SIZES,
    fitNote: "Unisex and cut to layer — take your usual size, or size up to wear a knit under it.",
  },
  {
    id: "casual-pant",
    name: "Casual Pant",
    price: 58,
    category: "Bottoms",
    featured: true,
    image: img("pant"),
    alt: "Threadline Casual Pant photographed against a plain wall",
    blurb: "A tapered everyday trouser with a comfortable waist.",
    description: "Cotton twill with a touch of stretch, a half-elastic waistband and a taper that lands just above the ankle. Deep pockets, no fuss.",
    details: ["97% cotton, 3% elastane twill", "Half-elastic waistband", "Tapered leg, unfinished 32\" inseam"],
    sizes: CLOTHING_SIZES,
    fitNote: "The half-elastic waist gives about an inch — take your usual size.",
  },
  {
    id: "woven-shirt",
    name: "Woven Shirt",
    price: 52,
    category: "Shirts",
    featured: false,
    image: img("woven-shirt"),
    alt: "Threadline Woven Shirt with a textured weave",
    blurb: "Textured yarn-dyed cotton with a soft, lived-in hand.",
    description: "Yarn-dyed on a slow loom so the weave shows its texture. It arrives already soft and only gets better with wear.",
    details: ["Yarn-dyed cotton", "Regular fit", "Curved shirttail hem"],
    sizes: CLOTHING_SIZES,
    fitNote: "A regular fit — closer than the Relaxed Shirt, so take your usual size.",
  },
  {
    id: "classic-cap",
    name: "Classic Cap",
    price: 22,
    category: "Accessories",
    featured: false,
    image: img("cap"),
    alt: "Threadline Classic Cap in washed cotton",
    blurb: "Washed cotton six-panel with a soft, unstructured crown.",
    description: "An unstructured cap in washed cotton canvas with an embroidered Threadline stitch mark and a brass adjuster.",
    details: ["Washed cotton canvas", "Unstructured six-panel", "Brass slider, one size"],
    sizes: ONE_SIZE,
    fitNote: "One size — the brass slider covers a 22\" to 24\" head.",
  },
  {
    id: "merino-crew",
    name: "Merino Crew Knit",
    price: 88,
    category: "Knitwear",
    featured: false,
    image: img("merino"),
    alt: "Threadline Merino Crew Knit sweater",
    blurb: "Fine-gauge merino that layers under anything.",
    description: "Fine-gauge merino spun by a small mill, knitted to a true crew neck. Warm, breathable and thin enough to sit under an overshirt.",
    details: ["100% extra-fine merino wool", "Fully fashioned shoulders", "Hand wash cool, dry flat"],
    sizes: CLOTHING_SIZES,
    fitNote: "Fine-gauge and closer than our canvas layers — take your usual size, or size up to wear it over a shirt.",
  },
  {
    id: "canvas-overshirt",
    name: "Canvas Overshirt",
    price: 94,
    category: "Outerwear",
    featured: true,
    image: img("overshirt"),
    alt: "Threadline Canvas Overshirt worn open",
    blurb: "The layer between a shirt and a coat.",
    description: "Heavy cotton canvas that softens as you wear it, with two patch pockets and a shirt collar. Our most-repaired, longest-lived piece.",
    details: ["10oz cotton canvas", "Two patch pockets", "Free repairs for five years"],
    sizes: CLOTHING_SIZES,
    fitNote: "Cut to go over a shirt or a knit — take your usual size; size down if you want it as a shirt.",
  },
  {
    id: "linen-dress",
    name: "Linen Summer Dress",
    price: 76,
    category: "Dresses",
    featured: false,
    image: img("linen-dress"),
    alt: "Threadline Linen Summer Dress",
    blurb: "Washed European linen, cut long and loose.",
    description: "A simple column in washed linen with side seam pockets and a hem that falls mid-calf. Cool in high summer, easy over a knit in autumn.",
    details: ["100% washed European linen", "Side seam pockets", "Machine wash cold"],
    sizes: CLOTHING_SIZES,
    fitNote: "Long and loose — take your usual size; the hem falls mid-calf at 5′7\".",
  },
  {
    id: "ribbed-longsleeve",
    name: "Ribbed Longsleeve",
    price: 44,
    category: "Tops",
    featured: false,
    image: img("longsleeve"),
    alt: "Threadline Ribbed Longsleeve top",
    blurb: "A close-fitting rib that holds its shape.",
    description: "A 2x1 cotton rib with long sleeves and a neat neckband — the base layer that carries the rest of the wardrobe through winter.",
    details: ["2x1 cotton rib", "Close fit", "Ribbed neckband"],
    sizes: CLOTHING_SIZES,
    fitNote: "A close rib that stretches to fit — size up if you want it loose.",
  },
  {
    id: "wool-scarf",
    name: "Lambswool Scarf",
    price: 46,
    category: "Accessories",
    featured: false,
    image: img("scarf"),
    alt: "Threadline Lambswool Scarf",
    blurb: "Woven in a small mill, finished with a hand-tied fringe.",
    description: "Lambswool woven in a single colourway with a hand-tied fringe. Generous enough to double over without bulk.",
    details: ["100% lambswool", "180cm x 30cm", "Hand-tied fringe"],
    sizes: ONE_SIZE,
    fitNote: "One size — 180cm x 30cm, long enough to double over.",
  },
  {
    id: "denim-jacket",
    name: "Rigid Denim Jacket",
    price: 118,
    category: "Outerwear",
    featured: false,
    image: img("denim"),
    alt: "Threadline Rigid Denim Jacket",
    blurb: "Raw 12oz denim that fades to your own pattern.",
    description: "Unwashed 12oz selvedge denim, chain-stitched at the hem. It starts stiff and dark and becomes yours within a season.",
    details: ["12oz raw selvedge denim", "Chain-stitched hem", "Expect shrinkage on first wash"],
    sizes: CLOTHING_SIZES,
    fitNote: "Raw denim: stiff at first and it shrinks about half a size on the first wash — size up if you plan to wash it hot.",
  },
];

export const byId = (id) => products.find((p) => p.id === id) ?? null;

// "All" first, then each category in catalogue order.
export const categories = () => [ALL_CATEGORIES, ...new Set(products.map((p) => p.category))];

// ?category= is shopper input: match it case-insensitively against the
// catalogue's own spelling and fall back to "All" for anything else.
export function resolveCategory(value) {
  const wanted = String(value ?? "").trim().toLowerCase();
  return categories().find((c) => c.toLowerCase() === wanted) ?? ALL_CATEGORIES;
}

export function inCategory(category) {
  const resolved = resolveCategory(category);
  return resolved === ALL_CATEGORIES ? products : products.filter((p) => p.category === resolved);
}

// "You might also like": same category first, then featured pieces, then the
// rest of the catalogue, never the piece itself. Catalogue order decides
// within each band, so the result is stable.
export function related(product, limit = RELATED_LIMIT) {
  const bands = [
    products.filter((p) => p.category === product.category),
    products.filter((p) => p.featured),
    products,
  ];
  const out = [];
  for (const p of bands.flat()) {
    if (out.length >= limit) break;
    if (p.id !== product.id && !out.includes(p)) out.push(p);
  }
  return out;
}
