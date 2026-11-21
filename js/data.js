// SAMPLE DATA — destinations are real places, but every package, itinerary, price and
// availability figure below is illustrative sample content for this portfolio project. Nothing
// here is a live offer, and no booking provider or payment gateway is connected.
// Photos: Unsplash (https://unsplash.com/license), referenced by photo ID and served from images.unsplash.com.

export const REGIONS = ['Kerala', 'Rest of India', 'International'];
export const TRIP_TYPES = ['Beach', 'Hills', 'Backwaters', 'Heritage', 'Wildlife', 'Adventure', 'City'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PACKAGE_TIERS = [
  { id: 'standard', name: 'Standard', multiplier: 1, note: '3-star stays, shared transfers' },
  { id: 'comfort', name: 'Comfort', multiplier: 1.35, note: '4-star stays, private cab' },
  { id: 'premium', name: 'Premium', multiplier: 1.8, note: '5-star / boutique stays, private cab and guide' }
];

export const destinations = [
  {
    slug: 'munnar', name: 'Munnar', region: 'Kerala', country: 'India', types: ['Hills'], scene: 'hills',
    nights: 3, priceFrom: 11500, rating: 4.7, bestMonths: [9, 10, 11, 12, 1, 2, 3],
    summary: 'Rolling tea estates, misty viewpoints and cool mountain air in the Western Ghats.',
    description: 'Stay among tea gardens, walk through spice plantations and catch sunrise from Top Station. A relaxed hill escape with time for a tea-factory visit and a jeep ride to the high viewpoints.',
    highlights: ['Tea museum and estate walk', 'Eravikulam National Park', 'Top Station sunrise', 'Mattupetty dam and echo point'],
    itinerary: ['Arrive from Kochi, scenic drive past Cheeyappara falls, check in', 'Eravikulam National Park and tea museum', 'Top Station, Mattupetty dam and Kundala lake', 'Breakfast, spice garden stop, drive back to Kochi'],
    inclusions: ['Hotel stay with breakfast', 'Private cab for sightseeing', 'Driver allowance and tolls'],
    exclusions: ['Flights or trains', 'Entry tickets', 'Lunch and dinner']
  },
  {
    slug: 'alleppey-houseboat', name: 'Alleppey Houseboat', region: 'Kerala', country: 'India', types: ['Backwaters'], scene: 'backwaters',
    nights: 2, priceFrom: 13900, rating: 4.8, bestMonths: [8, 9, 10, 11, 12, 1, 2, 3],
    summary: 'Drift through palm-lined canals on a traditional kettuvallam with meals cooked on board.',
    description: 'A night on a private houseboat through the Vembanad backwaters, followed by a beach evening at Marari. Ideal for couples and families who want a slow, scenic break.',
    highlights: ['Overnight private houseboat', 'Village canoe ride', 'Marari beach sunset', 'Kerala meals on board'],
    itinerary: ['Board the houseboat at noon, cruise the backwaters, overnight on board', 'Disembark, canoe ride through village canals, transfer to Marari beach', 'Morning at leisure, depart'],
    inclusions: ['Houseboat with all meals', 'Beach resort with breakfast', 'Transfers from Kochi'],
    exclusions: ['Flights or trains', 'Personal expenses', 'Canoe tips']
  },
  {
    slug: 'wayanad', name: 'Wayanad', region: 'Kerala', country: 'India', types: ['Wildlife', 'Adventure', 'Hills'], scene: 'forest',
    nights: 3, priceFrom: 12800, rating: 4.5, bestMonths: [10, 11, 12, 1, 2, 3, 4, 5],
    summary: 'Forest trails, waterfalls and wildlife safaris in Kerala’s green highlands.',
    description: 'Trek to Chembra peak’s heart-shaped lake, explore the Edakkal caves and take an early jeep safari at Tholpetty. Stays are in plantation homestays or treehouse resorts.',
    highlights: ['Chembra peak trek', 'Edakkal caves', 'Tholpetty wildlife safari', 'Banasura dam'],
    itinerary: ['Arrive from Kozhikode, check in to plantation stay', 'Chembra trek and Soochipara falls', 'Edakkal caves, Banasura dam', 'Early safari, depart'],
    inclusions: ['Homestay with breakfast and dinner', 'Private cab', 'Trek guide for Chembra'],
    exclusions: ['Safari permits', 'Entry tickets', 'Travel to Kozhikode']
  },
  {
    slug: 'kovalam-varkala', name: 'Kovalam & Varkala', region: 'Kerala', country: 'India', types: ['Beach'], scene: 'beach',
    nights: 4, priceFrom: 14500, rating: 4.4, bestMonths: [10, 11, 12, 1, 2, 3],
    summary: 'Two of Kerala’s best beaches: lighthouse views at Kovalam and cliffs at Varkala.',
    description: 'Unwind on crescent beaches, try an Ayurvedic massage and watch the sunset from Varkala’s red cliffs. A short trip from Thiruvananthapuram airport.',
    highlights: ['Lighthouse beach', 'Varkala cliff walk', 'Ayurveda session', 'Poovar estuary boat ride'],
    itinerary: ['Arrive Thiruvananthapuram, transfer to Kovalam', 'Beach day and Poovar boat ride', 'Transfer to Varkala, cliff sunset', 'Leisure and Ayurveda session', 'Depart'],
    inclusions: ['Beach resort with breakfast', 'Airport and inter-city transfers', 'One Ayurveda session'],
    exclusions: ['Flights', 'Water sports', 'Meals not listed']
  },
  {
    slug: 'goa', name: 'Goa', region: 'Rest of India', country: 'India', types: ['Beach', 'Heritage'], scene: 'beach',
    nights: 4, priceFrom: 16900, rating: 4.5, bestMonths: [11, 12, 1, 2, 3],
    summary: 'Beaches, Portuguese-era churches and riverside cafés across north and south Goa.',
    description: 'Split your stay between the lively north and the quieter south. Includes a heritage walk in Old Goa and Fontainhas, a spice farm lunch and a sunset river cruise.',
    highlights: ['Old Goa churches', 'Fontainhas Latin quarter walk', 'Spice plantation lunch', 'Mandovi sunset cruise'],
    itinerary: ['Arrive, check in near Candolim', 'North Goa beaches and forts', 'Old Goa, Fontainhas, sunset cruise', 'Spice farm and south Goa', 'Depart'],
    inclusions: ['Hotel with breakfast', 'Airport transfers', 'Half-day heritage tour'],
    exclusions: ['Flights', 'Water sports', 'Cruise drinks']
  },
  {
    slug: 'jaipur-udaipur', name: 'Jaipur & Udaipur', region: 'Rest of India', country: 'India', types: ['Heritage', 'City'], scene: 'fort',
    nights: 5, priceFrom: 24500, rating: 4.6, bestMonths: [10, 11, 12, 1, 2, 3],
    summary: 'Forts, palaces and lake views across Rajasthan’s Pink City and City of Lakes.',
    description: 'Explore Amber Fort, the City Palace and bazaars of Jaipur, then travel to Udaipur for a boat ride on Lake Pichola and an evening folk performance.',
    highlights: ['Amber Fort', 'Hawa Mahal and City Palace', 'Lake Pichola boat ride', 'Bagore ki Haveli folk show'],
    itinerary: ['Arrive Jaipur', 'Amber Fort, Jal Mahal, City Palace', 'Bazaars, travel to Udaipur', 'City Palace Udaipur, Pichola boat ride', 'Saheliyon ki Bari, folk show', 'Depart'],
    inclusions: ['Heritage hotels with breakfast', 'Private car Jaipur to Udaipur', 'Local guide in each city'],
    exclusions: ['Flights', 'Monument tickets', 'Lunch and dinner']
  },
  {
    slug: 'manali', name: 'Manali', region: 'Rest of India', country: 'India', types: ['Hills', 'Adventure'], scene: 'snow',
    nights: 4, priceFrom: 18900, rating: 4.4, bestMonths: [3, 4, 5, 6, 10, 12, 1],
    summary: 'Snow peaks, pine forests and adventure sports in the Kullu valley.',
    description: 'Visit Solang valley for paragliding or snow activities, explore Old Manali’s cafés and take a day trip towards Atal Tunnel and Sissu (subject to road conditions).',
    highlights: ['Solang valley', 'Hadimba temple', 'Atal Tunnel day trip', 'Old Manali cafés'],
    itinerary: ['Arrive by overnight bus or flight to Bhuntar', 'Hadimba temple, Vashisht, Mall Road', 'Solang valley', 'Atal Tunnel and Sissu', 'Depart'],
    inclusions: ['Hotel with breakfast and dinner', 'Private cab for sightseeing', 'Bhuntar or bus-stand transfers'],
    exclusions: ['Adventure activities', 'Rohtang or Atal Tunnel permits', 'Travel to Manali']
  },
  {
    slug: 'andaman', name: 'Andaman Islands', region: 'Rest of India', country: 'India', types: ['Beach', 'Adventure'], scene: 'island',
    nights: 5, priceFrom: 32500, rating: 4.7, bestMonths: [11, 12, 1, 2, 3, 4],
    summary: 'Clear water, coral reefs and white-sand beaches at Havelock and Neil Island.',
    description: 'Ferry between Port Blair, Havelock (Swaraj Dweep) and Neil (Shaheed Dweep). Snorkel the reefs, relax on Radhanagar beach and visit the Cellular Jail light-and-sound show.',
    highlights: ['Radhanagar beach', 'Snorkelling at Elephant beach', 'Neil Island natural bridge', 'Cellular Jail show'],
    itinerary: ['Arrive Port Blair, Cellular Jail show', 'Ferry to Havelock, Radhanagar beach', 'Elephant beach snorkelling', 'Ferry to Neil Island', 'Return to Port Blair', 'Depart'],
    inclusions: ['Resorts with breakfast', 'Inter-island ferry tickets', 'All transfers'],
    exclusions: ['Flights to Port Blair', 'Scuba diving', 'Entry permits where applicable']
  },
  {
    slug: 'dubai', name: 'Dubai', region: 'International', country: 'United Arab Emirates', types: ['City', 'Adventure'], scene: 'skyline',
    nights: 4, priceFrom: 46900, rating: 4.6, bestMonths: [11, 12, 1, 2, 3],
    summary: 'Skyscrapers, desert safaris and souks, with easy flights from Kerala.',
    description: 'See the city from the Burj Khalifa observation deck, take an evening desert safari with dinner, cruise the creek on a dhow and wander the gold and spice souks.',
    highlights: ['Burj Khalifa observation deck', 'Desert safari with dinner', 'Dhow creek cruise', 'Gold and spice souks'],
    itinerary: ['Arrive, check in, Dubai Marina walk', 'City tour and Burj Khalifa', 'Desert safari', 'Souks and dhow cruise', 'Depart'],
    inclusions: ['Hotel with breakfast', 'Airport transfers', 'Desert safari and city tour'],
    exclusions: ['Flights', 'UAE visa fee', 'Burj Khalifa prime-time upgrade']
  },
  {
    slug: 'singapore', name: 'Singapore', region: 'International', country: 'Singapore', types: ['City'], scene: 'skyline',
    nights: 4, priceFrom: 54900, rating: 4.5, bestMonths: [2, 3, 4, 7, 8, 9],
    summary: 'Gardens, food courts and family attractions in one compact city.',
    description: 'Explore Gardens by the Bay, take a day at Sentosa, ride the cable car and eat your way through hawker centres. Easy to get around by MRT.',
    highlights: ['Gardens by the Bay', 'Sentosa island day', 'Night safari', 'Hawker centre food trail'],
    itinerary: ['Arrive, Marina Bay light show', 'City tour and Gardens by the Bay', 'Sentosa island', 'Night safari', 'Depart'],
    inclusions: ['Hotel with breakfast', 'Airport transfers', 'Sentosa and night safari tickets'],
    exclusions: ['Flights', 'Visa fee', 'Meals not listed']
  },
  {
    slug: 'bali', name: 'Bali', region: 'International', country: 'Indonesia', types: ['Beach', 'Heritage'], scene: 'rice',
    nights: 5, priceFrom: 49500, rating: 4.7, bestMonths: [4, 5, 6, 7, 8, 9],
    summary: 'Rice terraces, temples and beach clubs between Ubud and the south coast.',
    description: 'Start in Ubud with rice terraces, a monkey forest and temple visits, then move to the coast for beaches and the cliff-top Uluwatu temple at sunset.',
    highlights: ['Tegallalang rice terraces', 'Ubud monkey forest', 'Tanah Lot temple', 'Uluwatu sunset and Kecak dance'],
    itinerary: ['Arrive, transfer to Ubud', 'Rice terraces and monkey forest', 'Temples and coffee plantation', 'Transfer to Seminyak, Tanah Lot', 'Uluwatu and Kecak dance', 'Depart'],
    inclusions: ['Villas and hotels with breakfast', 'Private driver for tours', 'Airport transfers'],
    exclusions: ['Flights', 'Visa on arrival fee', 'Temple donations']
  },
  {
    slug: 'maldives', name: 'Maldives', region: 'International', country: 'Maldives', types: ['Beach'], scene: 'island',
    nights: 3, priceFrom: 68500, rating: 4.9, bestMonths: [11, 12, 1, 2, 3, 4],
    summary: 'Overwater villas, lagoons and reef snorkelling on a private island resort.',
    description: 'Transfer by speedboat to an island resort for snorkelling, sandbank picnics and sunset dolphin cruises. The resort tier sets the villa type.',
    highlights: ['Overwater or beach villa', 'House-reef snorkelling', 'Sunset dolphin cruise', 'Sandbank picnic'],
    itinerary: ['Arrive Malé, speedboat to resort', 'Snorkelling and leisure', 'Dolphin cruise', 'Depart'],
    inclusions: ['Resort stay with half board', 'Speedboat transfers', 'Snorkel equipment'],
    exclusions: ['Flights', 'Green tax', 'Excursions not listed']
  }
];

// Unsplash photo IDs per destination: [cover, gallery 2, gallery 3]
export const PHOTOS = {
  "munnar": [
    "1719831738921-972e0ec76337",
    "1711192702535-eac61a78ecb0",
    "1723709431768-d749b0d814b9"
  ],
  "alleppey-houseboat": [
    "1593693411515-c20261bcad6e",
    "1602216056096-3b40cc0c9944",
    "1593693401060-9fc28cf9e368"
  ],
  "wayanad": [
    "1623302485960-d61687113a11",
    "1691342538271-5a97b7c1c089",
    "1606388341424-54c9fe7a8270"
  ],
  "kovalam-varkala": [
    "1697193374263-8aeb5488dabe",
    "1609854534028-b512f5246abc",
    "1697193375091-f9bfe3d7ed7b"
  ],
  "goa": [
    "1614082242765-7c98ca0f3df3",
    "1512343879784-a960bf40e7f2",
    "1560179406-1c6c60e0dc76"
  ],
  "jaipur-udaipur": [
    "1477587458883-47145ed94245",
    "1589901164570-f9de6556e1c1",
    "1603262110263-fb0112e7cc33"
  ],
  "manali": [
    "1597167231350-d057a45dc868",
    "1712388430474-ace0c16051e2",
    "1773739967497-e09144a822d4"
  ],
  "andaman": [
    "1586359716568-3e1907e4cf9f",
    "1640618792277-b91f3199f6a8",
    "1586053226626-febc8817962f"
  ],
  "dubai": [
    "1512453979798-5ea266f8880c",
    "1651467606797-e1c660cf3fda",
    "1580674684081-7617fbf3d745"
  ],
  "singapore": [
    "1525625293386-3f8f99389edd",
    "1496939376851-89342e90adcd",
    "1686455746285-4a921419bc6c"
  ],
  "bali": [
    "1555400038-63f5ba517a47",
    "1558005530-a7958896ec60",
    "1513415756790-2ac1db1297d0"
  ],
  "maldives": [
    "1573843981267-be1999ff37cd",
    "1590523277543-a94d2e4eb00b",
    "1516815231560-8f41ec531527"
  ]
};

export const HERO_PHOTO = '1783068293579-ef1c7fe73eb9';
export const CTA_PHOTO = '1508978053361-f0df91897005';

/** Unsplash image URL for a photo ID at a given width. */
export const photoUrl = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
