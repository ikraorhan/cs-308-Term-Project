// src/product_manager_api/index.js

const products = [
  // 1. Food (Mama)
  {
    id: 1,
    name: "Cat Food – Adult Salmon 1.5kg",
    description: "High protein salmon food for adult cats.",
    price: 150,
    image_url: "/images/Cat Food – Adult Salmon 1.5kg.jpg",
    category: "Food",
    quantity_in_stock: 25,
  },
  {
    id: 2,
    name: "Cat Food – Kitten Chicken 2kg",
    description: "Balanced nutrition chicken food for kittens.",
    price: 180,
    image_url: "/images/Cat Food – Kitten Chicken 2kg.jpg",
    category: "Food",
    quantity_in_stock: 20,
  },
  {
    id: 3,
    name: "Dog Food – Adult Lamb 3kg",
    description: "Lamb dry food for adult dogs.",
    price: 250,
    image_url: "/images/Dog Food – Adult Lamb 3kg.jpg",
    category: "Food",
    quantity_in_stock: 30,
  },
  {
    id: 4,
    name: "Dog Food – Puppy Chicken 3kg",
    description: "Easy to digest chicken food for puppies.",
    price: 230,
    image_url: "/images/Dog Food – Puppy Chicken 3kg.jpg",
    category: "Food",
    quantity_in_stock: 18,
  },
  
  // 2. Collars & Leashes (Tasma & Gezdirme)
  {
    id: 5,
    name: "Adjustable Cat Collar with Bell",
    description: "Comfortable adjustable collar with bell for cats. Available in multiple colors.",
    price: 45,
    image_url: "/images/Adjustable Cat Collar with Bell.jpg",
    category: "Collars & Leashes",
    quantity_in_stock: 15,
  },
  {
    id: 6,
    name: "Small Breed Dog Nylon Collar",
    description: "Durable nylon collar for small breed dogs. Lightweight and comfortable.",
    price: 55,
    image_url: "/images/Small Breed Dog Nylon Collar.jpg",
    category: "Collars & Leashes",
    quantity_in_stock: 12,
  },
  {
    id: 7,
    name: "Automatic Retractable Leash 5m",
    description: "5-meter retractable leash with ergonomic handle and safety lock.",
    price: 120,
    image_url: "/images/Automatic Retractable Leash 5m.jpg",
    category: "Collars & Leashes",
    quantity_in_stock: 8,
  },
  {
    id: 8,
    name: "Chest Harness for Medium Dogs",
    description: "Comfortable chest harness that distributes pressure evenly. Perfect for walks.",
    price: 95,
    image_url: "/images/Chest Harness for Medium Dogs.jpg",
    category: "Collars & Leashes",
    quantity_in_stock: 10,
  },
  
  // 3. Food & Water Bowls (Su & Mama Kapları)
  {
    id: 9,
    name: "Stainless Steel Food Bowl (Cat/Small Dog)",
    description: "Durable stainless steel bowl, easy to clean and hygienic.",
    price: 35,
    image_url: "/images/Stainless Steel Food Bowl (Cat-Small Dog).jpg",
    category: "Food & Water Bowls",
    quantity_in_stock: 22,
  },
  {
    id: 10,
    name: "Dual Compartment Plastic Food-Water Bowl",
    description: "Two-compartment bowl for food and water. Space-saving design.",
    price: 40,
    image_url: "/images/Dual Compartment Plastic Food-Water Bowl.jpg",
    category: "Food & Water Bowls",
    quantity_in_stock: 16,
  },
  {
    id: 11,
    name: "Non-Slip Ceramic Cat Bowl",
    description: "Ceramic bowl with non-slip base. Elegant design for your cat.",
    price: 50,
    image_url: "/images/Non-Slip Ceramic Cat Bowl.jpg",
    category: "Food & Water Bowls",
    quantity_in_stock: 14,
  },
  {
    id: 12,
    name: "Automatic Water Dispenser 1.5L",
    description: "Automatic water dispenser with 1.5L capacity. Keeps water fresh and clean.",
    price: 180,
    image_url: "/images/Automatic Water Dispenser 1.5L.jpg",
    category: "Food & Water Bowls",
    quantity_in_stock: 6,
  },
  
  // 4. Toys (Oyuncak)
  {
    id: 13,
    name: "Cat Fishing Rod with Feather",
    description: "Interactive fishing rod toy with feathers. Perfect for playtime with your cat.",
    price: 65,
    image_url: "/images/Cat Fishing Rod with Feather.jpg",
    category: "Toys",
    quantity_in_stock: 20,
  },
  {
    id: 14,
    name: "Cat Ball with Bell (3-Pack)",
    description: "Set of 3 jingle balls for cats. Stimulates play and exercise.",
    price: 30,
    image_url: "/images/Cat Ball with Bell (3-Pack).jpg",
    category: "Toys",
    quantity_in_stock: 25,
  },
  {
    id: 15,
    name: "Plush Dog Toy (Bite Resistant)",
    description: "Durable plush toy for dogs. Resistant to chewing and tearing.",
    price: 75,
    image_url: "/images/Plush Dog Toy (Bite Resistant).jpg",
    category: "Toys",
    quantity_in_stock: 18,
  },
  {
    id: 16,
    name: "Rope Tug Toy for Dogs",
    description: "Strong rope toy for tug-of-war games. Promotes bonding and exercise.",
    price: 55,
    image_url: "/images/Rope Tug Toy for Dogs.jpg",
    category: "Toys",
    quantity_in_stock: 15,
  },
  
  // 5. Grooming & Hygiene (Bakım & Hijyen)
  {
    id: 17,
    name: "Clumping Cat Litter 10L",
    description: "Highly absorbent clumping cat litter. Easy to clean and odor control.",
    price: 85,
    image_url: "/images/Clumping Cat Litter 10L.jpg",
    category: "Grooming & Hygiene",
    quantity_in_stock: 30,
  },
  {
    id: 18,
    name: "Dog Shampoo (Sensitive Skin)",
    description: "Gentle shampoo for dogs with sensitive skin. Hypoallergenic formula.",
    price: 60,
    image_url: "/images/Dog Shampoo (Sensitive Skin).jpg",
    category: "Grooming & Hygiene",
    quantity_in_stock: 12,
  },
  {
    id: 19,
    name: "Fur Comb (Cat/Dog)",
    description: "Professional grooming comb for removing loose fur and preventing matting.",
    price: 45,
    image_url: "/images/Fur Comb (Cat-Dog).jpg",
    category: "Grooming & Hygiene",
    quantity_in_stock: 20,
  },
  {
    id: 20,
    name: "Pet Cleaning Wipes (50 Pack)",
    description: "Gentle cleaning wipes for paws, face, and body. Aloe vera enriched.",
    price: 35,
    image_url: "/images/Pet Cleaning Wipes (50 Pack).jpg",
    category: "Grooming & Hygiene",
    quantity_in_stock: 28,
  },
  
  // 6. Treats & Snacks (Ödül & Atıştırmalıklar)
  {
    id: 21,
    name: "Cat Treat – Salmon Cubes 60g",
    description: "Delicious salmon-flavored treats for cats. High protein, low calorie.",
    price: 25,
    image_url: "/images/Cat Treat – Salmon Cubes 60g.jpg",
    category: "Treats & Snacks",
    quantity_in_stock: 35,
  },
  {
    id: 22,
    name: "Cat Treat – Cheese Flavored Crunch 50g",
    description: "Crunchy cheese-flavored treats. Irresistible for your cat.",
    price: 22,
    image_url: "/images/Cat Treat – Cheese Flavored Crunch 50g.jpg",
    category: "Treats & Snacks",
    quantity_in_stock: 32,
  },
  {
    id: 23,
    name: "Dog Treat Biscuit – Chicken 200g",
    description: "Tasty chicken-flavored biscuits for dogs. Training rewards or snacks.",
    price: 40,
    image_url: "/images/Dog Treat Biscuit – Chicken 200g.jpg",
    category: "Treats & Snacks",
    quantity_in_stock: 24,
  },
  {
    id: 24,
    name: "Dog Chew Bone – Mini (5-Pack)",
    description: "Set of 5 mini chew bones. Promotes dental health and satisfies chewing needs.",
    price: 50,
    image_url: "/images/Dog Chew Bone – Mini (5-Pack).jpg",
    category: "Treats & Snacks",
    quantity_in_stock: 18,
  },
];

// basit sahte API
export const productsAPI = {
  async getProducts(params = {}) {
    let filteredProducts = [...products];
    
    // Category filter
    if (params.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === params.category
      );
    }
    
    // Search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort filter
    if (params.sort === "price") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (params.sort === "popularity") {
      // Sort by stock quantity (higher stock = more popular)
      filteredProducts.sort((a, b) => (b.quantity_in_stock || 0) - (a.quantity_in_stock || 0));
    }
    
    return Promise.resolve({ data: filteredProducts });
  },
};
