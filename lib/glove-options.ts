export const seriesOptions = [
  { name: "Ballerz Full Custom", price: 189 },
  { name: "Premier Ballerz Full Custom", price: 229 },
];

export const modelOptions = [
  "Fielder",
  "1B Open Back",
  "1B Closed Back",
  "Baseball Catcher",
  "Softball Catcher",
];

export const sportOptions = [
  "Baseball",
  "Softball",
  "Youth Baseball",
  "Youth Softball",
];

export const throwingHandOptions = [
  "Right-Hand Throw",
  "Left-Hand Throw",
];

export const sizeOptions = [
  "10.25",
  "11.0",
  "11.25",
  "11.5",
  "11.75",
  "12.0",
  "12.5",
  "12.75",
  "13.0",
];

export const startingColorOptions = [
  "Black",
  "Brown",
  "Tan",
  "Blonde",
  "Navy",
  "Red",
];

export const webStyleOptionsByModel: Record<string, string[]> = {
  Fielder: [
    "I-Web",
    "H-Web",
    "Cross Web",
    "Basket Web",
    "Full Web",
    "1-Piece Web",
    "I-WebLogo",
    "V-Web",
    "Modified Cross Web",
    "Net Web",
    "Laced H-Web",
    "Laced Cross Web",
    "Diamond Web",
  ],
  "1B Open Back": ["1B Standard"],
  "1B Closed Back": ["1B Closed"],
  "Baseball Catcher": ["Closed Web", "Half Moon"],
  "Softball Catcher": ["Closed Web", "Half Moon"],
};

/*
 * Most web styles are just a recolor of the same base glove mesh, so
 * they share one GLB by default. A web style that needs different
 * geometry (like Basket Web's woven pattern) gets its own GLB here,
 * and the 3D preview swaps to it while keeping every other color
 * choice the user already made.
 *
 * The default model itself (CrossWeb.glb) depicts a cross net, so
 * "Cross Web" is listed explicitly too even though it just points at
 * the same file as the default.
 */
export const defaultGloveModelPath = "/models/CrossWeb.glb";

export const webStyleModelPaths: Record<string, string> = {
  "Cross Web": "/models/CrossWeb.glb",
  "Basket Web": "/models/BasketWeb.glb",
  "Full Web": "/models/FullWeb.glb",
  "1-Piece Web": "/models/1-Piece.glb",
  "I-Web": "/models/I-Web.glb",
  "H-Web": "/models/H-Web.glb",
  "I-WebLogo": "/models/I-WebLogo.glb",
  "V-Web": "/models/V-Web.glb",
  "Modified Cross Web": "/models/ModCrossWeb.glb",
  "Net Web": "/models/NetWeb.glb",
  "Laced H-Web": "/models/LacedH-Web.glb",
  "Laced Cross Web": "/models/LaceCross.glb",
  "Diamond Web": "/models/DiamondWeb.glb",
  
};

export function getGloveModelPath(webStyle: string) {
  return webStyleModelPaths[webStyle] ?? defaultGloveModelPath;
}

export const laceColorOptions = [
  "Black",
  "Brown",
  "Tan",
  "Blonde",
  "Navy",
  "Red",
  "White",
];

export const logoColorOptions = [
  "Black",
  "White",
  "Gold",
  "Red",
  "Royal Blue",
];

export const embroideryColorOptions = [
  "White",
  "Black",
  "Gold",
  "Red",
  "Royal Blue",
  "Pink",
];

export const embroideryLocationOptions = [
  "Wrist Strap",
  "Thumb",
  "Index Finger",
  "Middle Finger",
  "Ring Finger",
  "Pinky Finger",
  "Back of Hand",
];

/*
 * Maps a user-facing embroidery location to the named material on the
 * glove GLB whose mesh the embroidery decal should be projected onto.
 * These names match the material_* keys recolored in Glove3DPreview.tsx,
 * so this stays valid across every web-style GLB without changes.
 */
export const embroideryLocationMaterialMap: Record<string, string> = {
  "Wrist Strap": "material_wrist",
  Thumb: "material_outerThumb",
  "Index Finger": "material_outerIndex",
  "Middle Finger": "material_outerMiddle",
  "Ring Finger": "material_outerRing",
  "Pinky Finger": "material_outerPinky",
  "Back of Hand": "material_outerPalm",
};

export const panelColorOptions = [
  "Black",
  "Brown",
  "Tan",
  "Blonde",
  "Navy",
  "Red",
  "White",
  "Pink",
  "Royal Blue",
  "Gray",
  "Purple",
  "Yellow",
];

export const colorMap: Record<string, string> = {
  Black: "#121212",
  Brown: "#6B4423",
  Tan: "#C19A6B",
  Blonde: "#D8B56A",
  Navy: "#1E3A5F",
  Red: "#C62828",
  White: "#F5F5F5",
  Pink: "#F48FB1",
  "Royal Blue": "#2962FF",
  Gray: "#8A8A8A",
  Purple: "#6A1B9A",
  Yellow: "#FBC02D",
  Gold: "#D4AF37",
};

export const prebuiltGloves = [
  {
    id: "banana-sluggers",
    name: "Banana Sluggers",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Purple / Yellow / Gray",
    image: "/images/gloves/Bananna_Sluggers.JPG",
    images: ["/images/gloves/Bananna_Sluggers.JPG"],
    description:
      "Bold purple and yellow prebuilt glove with Banana Sluggers patchwork styling.",
  },
  {
    id: "blue-leopard",
    name: "Blue Leopard",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Blue / Black / White",
    image: "/images/gloves/Blue_Leopard.JPG",
    images: ["/images/gloves/Blue_Leopard.JPG"],
    description:
      "Blue leopard-print glove with white lace for a loud, premium game-day look.",
  },
  {
    id: "coraline",
    name: "Coraline",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Purple / Royal Blue / Yellow",
    image: "/images/gloves/Caroline.JPG",
    images: ["/images/gloves/Caroline.JPG"],
    description:
      "Character-themed purple and blue glove with yellow accents and custom embroidery.",
  },
  {
    id: "chucky",
    name: "Chucky",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Sky Blue / Red / Cream",
    image: "/images/gloves/Chucky.JPG",
    images: ["/images/gloves/Chucky.JPG"],
    description:
      "Horror-inspired prebuilt glove with sky blue shell, red trim, and stitched character detail.",
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Pink / Light Blue",
    image: "/images/gloves/Cotton_Candy.JPG",
    images: ["/images/gloves/Cotton_Candy.JPG"],
    description:
      "Bright cotton-candy colorway with pink and light blue leather for a standout look.",
  },
  {
    id: "friday-13",
    name: "Friday 13",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Black / Red / Gray",
    image: "/images/gloves/Friday13.JPG",
    images: ["/images/gloves/Friday13.JPG"],
    description:
      "Dark Friday 13 theme glove featuring black leather, red accents, and horror-inspired artwork.",
  },
  {
    id: "gold-brown",
    name: "Gold Brown",
    price: 189,
    model: "Fielder",
    sport: "Baseball",
    color: "Brown / Gold",
    image: "/images/gloves/Gold_Brown.JPG",
    images: ["/images/gloves/Gold_Brown.JPG"],
    description:
      "Classic brown glove with gold detailing for a clean traditional style.",
  },
  {
    id: "gold-purple-flowers",
    name: "Gold Purple Flowers",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Purple / Gold / Mint",
    image: "/images/gloves/Gold_Purple_Flowers.JPG",
    images: ["/images/gloves/Gold_Purple_Flowers.JPG"],
    description:
      "Floral-pattern glove with purple leather, gold detailing, and mint lace accents.",
  },
  {
    id: "gold-red-flowers",
    name: "Gold Red Flowers",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Red / Gold / Navy",
    image: "/images/gloves/Gold_Red_Flowers.JPG",
    images: ["/images/gloves/Gold_Red_Flowers.JPG"],
    description:
      "Floral-pattern prebuilt glove with red leather, gold design work, and navy trim.",
  },
  {
    id: "h-web-woody",
    name: "H-Web Woody",
    price: 229,
    model: "H-Web Fielder",
    sport: "Baseball",
    color: "White / Brown / Blue / Pink / Yellow",
    image: "/images/gloves/H_Web_Woody.JPG",
    images: ["/images/gloves/H_Web_Woody.JPG"],
    description:
      "Woody-inspired H-web glove with playful western colors and character-themed artwork.",
  },
  {
    id: "i-web-woody",
    name: "I-Web Woody",
    price: 229,
    model: "I-Web Fielder",
    sport: "Baseball",
    color: "White / Brown / Blue / Pink / Green / Yellow",
    image: "/images/gloves/I_Web_Woody.JPG",
    images: ["/images/gloves/I_Web_Woody.JPG"],
    description:
      "Woody-inspired I-web glove with a colorful custom layout and bright lace accents.",
  },
  {
    id: "joker",
    name: "Joker",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Black / Purple / Red",
    image: "/images/gloves/Joker.JPG",
    images: ["/images/gloves/Joker.JPG"],
    description:
      "Joker-inspired glove with black and purple leather and custom villain-themed detailing.",
  },
  {
    id: "la-dodgers-plain",
    name: "LA Dodgers Plain",
    price: 189,
    model: "Fielder",
    sport: "Baseball",
    color: "White / Black / Royal Blue",
    image: "/images/gloves/LA_Dodgers_Plain.JPG",
    images: ["/images/gloves/LA_Dodgers_Plain.JPG"],
    description:
      "Simple Dodgers-inspired colorway with clean white leather and royal blue accents.",
  },
  {
    id: "la-dodgers",
    name: "LA Dodgers",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Royal Blue / White / Red / Gray",
    image: "/images/gloves/LA_Dogers.JPG",
    images: ["/images/gloves/LA_Dogers.JPG"],
    description:
      "Dodgers-inspired glove with team-style colors and embroidered LA branding.",
  },
  {
    id: "la-dodgers-player",
    name: "LA Dodgers Player",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Royal Blue / White / Red",
    image: "/images/gloves/LA_Dogers_Player.JPG",
    images: ["/images/gloves/LA_Dogers_Player.JPG"],
    description:
      "Dodgers player-inspired prebuilt glove with graphic artwork and strong team color blocking.",
  },
  {
    id: "la-rams",
    name: "LA Rams",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Royal Blue / Yellow",
    image: "/images/gloves/LA_Rams.JPG",
    images: ["/images/gloves/LA_Rams.JPG"],
    description:
      "LA Rams-themed glove in royal blue and yellow with matching logo embroidery.",
  },
  {
    id: "labubu",
    name: "Labubu",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Cream / Gray / Pink",
    image: "/images/gloves/Labubu.JPG",
    images: ["/images/gloves/Labubu.JPG"],
    description:
      "Soft neutral-toned prebuilt glove with pink embroidery and character-themed patchwork.",
  },
  {
    id: "pink-ice-cream",
    name: "Pink Ice Cream",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Cream / Pink",
    image: "/images/gloves/Pink_IceCream.JPG",
    images: ["/images/gloves/Pink_IceCream.JPG"],
    description:
      "Cream and pink glove with textured leather pattern for a premium boutique look.",
  },
  {
    id: "spider-man",
    name: "Spider-Man",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Red / Blue / Black / White",
    image: "/images/gloves/Spider_Man.JPG",
    images: [
      "/images/gloves/Spider_Man.JPG",
      "/images/gloves/Spider_Man2.JPG",
    ],
    description:
      "Spider-Man-themed glove with web-style paneling and bold comic-inspired colors.",
  },
  {
    id: "spongebob",
    name: "SpongeBob",
    price: 229,
    model: "Fielder",
    sport: "Baseball",
    color: "Yellow / Sky Blue / Pink / White",
    image: "/images/gloves/SpongeBob.JPG",
    images: ["/images/gloves/SpongeBob.JPG"],
    description:
      "SpongeBob-inspired prebuilt glove with bright cartoon colors and themed character detailing.",
  },
  {
    id: "teal",
    name: "Teal",
    price: 189,
    model: "Fielder",
    sport: "Baseball",
    color: "Teal",
    image: "/images/gloves/Teal.JPG",
    images: ["/images/gloves/Teal.JPG"],
    description:
      "Clean monochrome teal glove with a sleek minimal look and matching leather throughout.",
  },
  {
    id: "triple-white",
    name: "Triple White",
    price: 189,
    model: "Fielder",
    sport: "Baseball",
    color: "White",
    image: "/images/gloves/Triple_White.JPG",
    images: ["/images/gloves/Triple_White.JPG"],
    description:
      "All-white prebuilt glove with a crisp premium finish for a clean standout style.",
  },
];

export const buildPreviewImages: Record<string, string> = {
  Black: "/images/gloves/Triple_White.JPG",
  Brown: "/images/gloves/Gold_Brown.JPG",
  Tan: "/images/gloves/Gold_Brown.JPG",
  Blonde: "/images/gloves/LA_Dodgers_Plain.JPG",
  Navy: "/images/gloves/LA_Rams.JPG",
  Red: "/images/gloves/Spider_Man.JPG",
  White: "/images/gloves/Triple_White.JPG",
  Pink: "/images/gloves/Pink_IceCream.JPG",
  "Royal Blue": "/images/gloves/LA_Dogers_Player.JPG",
  Gray: "/images/gloves/Labubu.JPG",
  Purple: "/images/gloves/Joker.JPG",
  Yellow: "/images/gloves/SpongeBob.JPG",
};

export const modelPreviewFallbacks: Record<string, string> = {
  Fielder: "/images/gloves/LA_Dodgers_Plain.JPG",
  "1B Open Back": "/images/gloves/Gold_Brown.JPG",
  "1B Closed Back": "/images/gloves/Gold_Brown.JPG",
  "Baseball Catcher": "/images/gloves/Spider_Man.JPG",
  "Softball Catcher": "/images/gloves/Pink_IceCream.JPG",
};


export const gloveLayerAssets = {
  fielder: {
    base: "/images/layers/fielder/base.png",
    palm: "/images/layers/fielder/palm.png",
    welting: "/images/layers/fielder/welting.png",
    binding: "/images/layers/fielder/binding.png",
    lace: "/images/layers/fielder/lace.png",
    web: "/images/layers/fielder/web.png",
  },
};