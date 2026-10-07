import type { LatLng } from "@/data/geography";

export type CatalogLocation = {
  id: string;
  queryKeys: string[];
  name: string;
  city: string;
  state: string;
  category: "venue" | "city" | "state" | "landmark";
  center: LatLng;
  zoom: number;
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  suggestedPolygon?: LatLng[];
};

export const POPULAR_VENUES: CatalogLocation[] = [
  // MANIPUR / IMPHAL
  {
    id: "manipur-imphal",
    queryKeys: ["manipur", "imphal", "kangla", "palace compound"],
    name: "Kangla Fort & Palace Compound",
    city: "Imphal",
    state: "Manipur",
    category: "venue",
    center: [24.8170, 93.9368],
    zoom: 14,
    boundingBox: { north: 24.8250, south: 24.8090, east: 93.9460, west: 93.9270 },
    suggestedPolygon: [
      [24.8250, 93.9270],
      [24.8250, 93.9460],
      [24.8090, 93.9460],
      [24.8090, 93.9270],
    ],
  },
  // MUMBAI
  {
    id: "mumbai-marine-drive",
    queryKeys: ["marine drive", "mumbai", "nariman point", "churchgate"],
    name: "Marine Drive Coastal Promenade",
    city: "Mumbai",
    state: "Maharashtra",
    category: "venue",
    center: [18.9438, 72.8232],
    zoom: 14,
    boundingBox: { north: 18.9550, south: 18.9320, east: 72.8350, west: 72.8150 },
    suggestedPolygon: [
      [18.9550, 72.8150],
      [18.9550, 72.8350],
      [18.9320, 72.8350],
      [18.9320, 72.8150],
    ],
  },
  {
    id: "mumbai-bkc",
    queryKeys: ["bkc", "bandra kurla complex", "bandra"],
    name: "Bandra Kurla Complex (BKC) Grounds",
    city: "Mumbai",
    state: "Maharashtra",
    category: "venue",
    center: [19.0660, 72.8680],
    zoom: 14,
    boundingBox: { north: 19.0750, south: 19.0570, east: 72.8760, west: 72.8600 },
    suggestedPolygon: [
      [19.0750, 72.8600],
      [19.0750, 72.8760],
      [19.0570, 72.8760],
      [19.0570, 72.8600],
    ],
  },
  {
    id: "mumbai-wankhede",
    queryKeys: ["wankhede", "wankhede stadium"],
    name: "Wankhede Stadium Precinct",
    city: "Mumbai",
    state: "Maharashtra",
    category: "venue",
    center: [18.9389, 72.8258],
    zoom: 16,
    boundingBox: { north: 18.9440, south: 18.9340, east: 72.8310, west: 72.8210 },
  },

  // DELHI
  {
    id: "delhi-kartavya-path",
    queryKeys: ["kartavya path", "india gate", "delhi", "rajpath", "new delhi"],
    name: "Kartavya Path & India Gate Lawns",
    city: "New Delhi",
    state: "Delhi",
    category: "venue",
    center: [28.6129, 77.2295],
    zoom: 14,
    boundingBox: { north: 28.6220, south: 28.6030, east: 77.2410, west: 77.2180 },
    suggestedPolygon: [
      [28.6220, 77.2180],
      [28.6220, 77.2410],
      [28.6030, 77.2410],
      [28.6030, 77.2180],
    ],
  },
  {
    id: "delhi-jln-stadium",
    queryKeys: ["jln stadium", "jawaharlal nehru stadium"],
    name: "Jawaharlal Nehru Stadium Arena",
    city: "New Delhi",
    state: "Delhi",
    category: "venue",
    center: [28.5826, 77.2344],
    zoom: 15,
    boundingBox: { north: 28.5890, south: 28.5760, east: 77.2420, west: 77.2260 },
  },

  // BENGALURU
  {
    id: "bengaluru-palace-grounds",
    queryKeys: ["palace grounds", "bengaluru", "bangalore"],
    name: "Bengaluru Palace Grounds",
    city: "Bengaluru",
    state: "Karnataka",
    category: "venue",
    center: [12.9985, 77.5925],
    zoom: 14,
    boundingBox: { north: 13.0080, south: 12.9890, east: 77.6020, west: 77.5830 },
    suggestedPolygon: [
      [13.0080, 77.5830],
      [13.0080, 77.6020],
      [12.9890, 77.6020],
      [12.9890, 77.5830],
    ],
  },
  {
    id: "bengaluru-chinnaswamy",
    queryKeys: ["chinnaswamy", "chinnaswamy stadium"],
    name: "M. Chinnaswamy Stadium Precinct",
    city: "Bengaluru",
    state: "Karnataka",
    category: "venue",
    center: [12.9788, 77.5996],
    zoom: 16,
    boundingBox: { north: 12.9840, south: 12.9730, east: 77.6050, west: 77.5940 },
  },

  // AHMEDABAD
  {
    id: "ahmedabad-motera",
    queryKeys: ["narendra modi stadium", "motera", "ahmedabad"],
    name: "Narendra Modi Stadium Complex",
    city: "Ahmedabad",
    state: "Gujarat",
    category: "venue",
    center: [23.0915, 72.5975],
    zoom: 15,
    boundingBox: { north: 23.1020, south: 23.0810, east: 72.6070, west: 72.5880 },
    suggestedPolygon: [
      [23.1020, 72.5880],
      [23.1020, 72.6070],
      [23.0810, 72.6070],
      [23.0810, 72.5880],
    ],
  },
  {
    id: "ahmedabad-riverfront",
    queryKeys: ["sabarmati riverfront", "riverfront"],
    name: "Sabarmati Riverfront Promenade",
    city: "Ahmedabad",
    state: "Gujarat",
    category: "venue",
    center: [23.0225, 72.5714],
    zoom: 14,
    boundingBox: { north: 23.0350, south: 23.0100, east: 72.5820, west: 72.5600 },
  },

  // KOLKATA
  {
    id: "kolkata-eden-gardens",
    queryKeys: ["eden gardens", "kolkata", "calcutta", "maidan"],
    name: "Eden Gardens & Maidan Precinct",
    city: "Kolkata",
    state: "West Bengal",
    category: "venue",
    center: [22.5646, 88.3433],
    zoom: 14,
    boundingBox: { north: 22.5740, south: 22.5530, east: 88.3520, west: 88.3340 },
    suggestedPolygon: [
      [22.5740, 88.3340],
      [22.5740, 88.3520],
      [22.5530, 88.3520],
      [22.5530, 88.3340],
    ],
  },
  {
    id: "kolkata-salt-lake",
    queryKeys: ["salt lake stadium", "yuva bharati"],
    name: "Salt Lake Stadium (Yuva Bharati Krirangan)",
    city: "Kolkata",
    state: "West Bengal",
    category: "venue",
    center: [22.5697, 88.4069],
    zoom: 15,
    boundingBox: { north: 22.5770, south: 22.5620, east: 88.4150, west: 88.3980 },
  },

  // PRAYAGRAJ
  {
    id: "prayagraj-sangam",
    queryKeys: ["prayagraj", "triveni sangam", "sangam", "kumbh", "maha kumbh", "allahabad"],
    name: "Triveni Sangam & Maha Kumbh Grounds",
    city: "Prayagraj",
    state: "Uttar Pradesh",
    category: "venue",
    center: [25.4255, 81.8820],
    zoom: 13,
    boundingBox: { north: 25.465, south: 25.370, east: 81.945, west: 81.845 },
    suggestedPolygon: [
      [25.465, 81.845],
      [25.465, 81.945],
      [25.370, 81.945],
      [25.370, 81.845],
    ],
  },

  // HYDERABAD
  {
    id: "hyderabad-charminar",
    queryKeys: ["charminar", "hyderabad", "old city hyderabad"],
    name: "Charminar Heritage & Public Plaza",
    city: "Hyderabad",
    state: "Telangana",
    category: "venue",
    center: [17.3616, 78.4747],
    zoom: 15,
    boundingBox: { north: 17.3700, south: 17.3530, east: 78.4830, west: 78.4660 },
  },
  {
    id: "hyderabad-hussain-sagar",
    queryKeys: ["hussain sagar", "tank bund", "necklace road"],
    name: "Hussain Sagar & Tank Bund Corridor",
    city: "Hyderabad",
    state: "Telangana",
    category: "venue",
    center: [17.4239, 78.4738],
    zoom: 14,
    boundingBox: { north: 17.4360, south: 17.4110, east: 78.4860, west: 78.4610 },
  },

  // CHENNAI
  {
    id: "chennai-marina",
    queryKeys: ["chennai", "marina beach", "madras"],
    name: "Marina Beach Promenade",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "venue",
    center: [13.0499, 80.2824],
    zoom: 14,
    boundingBox: { north: 13.0620, south: 13.0370, east: 80.2920, west: 80.2720 },
  },

  // JAIPUR
  {
    id: "jaipur-city-palace",
    queryKeys: ["jaipur", "city palace", "pink city"],
    name: "Jaipur City Palace & Jantar Mantar Grounds",
    city: "Jaipur",
    state: "Rajasthan",
    category: "venue",
    center: [26.9258, 75.8237],
    zoom: 15,
    boundingBox: { north: 26.9320, south: 26.9190, east: 75.8310, west: 75.8160 },
  },

  // GOA
  {
    id: "goa-panaji",
    queryKeys: ["goa", "panaji", "miramar"],
    name: "Panaji Waterfront & Miramar Promenade",
    city: "Panaji",
    state: "Goa",
    category: "venue",
    center: [15.4989, 73.8077],
    zoom: 14,
    boundingBox: { north: 15.5080, south: 15.4890, east: 73.8180, west: 73.7970 },
  },
];

export const FEATURED_CITIES = [
  { name: "Mumbai", state: "Maharashtra", venueCount: 3, id: "mumbai-marine-drive" },
  { name: "Delhi / NCR", state: "Delhi", venueCount: 2, id: "delhi-kartavya-path" },
  { name: "Bengaluru", state: "Karnataka", venueCount: 2, id: "bengaluru-palace-grounds" },
  { name: "Ahmedabad", state: "Gujarat", venueCount: 2, id: "ahmedabad-motera" },
  { name: "Kolkata", state: "West Bengal", venueCount: 2, id: "kolkata-eden-gardens" },
  { name: "Prayagraj", state: "Uttar Pradesh", venueCount: 1, id: "prayagraj-sangam" },
  { name: "Imphal / Manipur", state: "Manipur", venueCount: 1, id: "manipur-imphal" },
  { name: "Hyderabad", state: "Telangana", venueCount: 2, id: "hyderabad-charminar" },
];
