import { categories, products, cartItems, type Category, type Product, type CartItem, type InsertCategory, type InsertProduct, type InsertCartItem } from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(categorySlug?: string, searchQuery?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, productId: number, quantity: number): Promise<void>;
  removeFromCart(sessionId: string, productId: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getProducts(categorySlug?: string, searchQuery?: string): Promise<Product[]> {
    let query = db.select().from(products);

    const conditions = [];

    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      if (category) {
        conditions.push(eq(products.categoryId, category.id));
      }
    }

    if (searchQuery) {
      const searchConditions = [
        ilike(products.name, `%${searchQuery}%`),
        ilike(products.description, `%${searchQuery}%`)
      ];
      conditions.push(or(...searchConditions));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isFeatured, true));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return result.map(row => ({
      ...row.cart_items,
      product: row.products
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, item.sessionId),
          eq(cartItems.productId, item.productId)
        )
      );

    if (existingItem) {
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [newItem] = await db
      .insert(cartItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateCartItemQuantity(sessionId: string, productId: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.sessionId, sessionId),
            eq(cartItems.productId, productId)
          )
        );
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(
          and(
            eq(cartItems.sessionId, sessionId),
            eq(cartItems.productId, productId)
          )
        );
    }
  }

  async removeFromCart(sessionId: string, productId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(sessionId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.sessionId, sessionId));
  }
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private currentCategoryId: number = 1;
  private currentProductId: number = 1;
  private currentCartItemId: number = 1;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoriesData: InsertCategory[] = [
      { name: "Vegetables", slug: "vegetables", description: "Fresh & Organic", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Fruits", slug: "fruits", description: "Sweet & Juicy", imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Dairy", slug: "dairy", description: "Fresh & Pure", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Spices", slug: "spices", description: "Authentic Flavors", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Household", slug: "household", description: "Daily Essentials", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Snacks", slug: "snacks", description: "Tasty Treats", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
    ];

    categoriesData.forEach(cat => {
      const category: Category = { ...cat, id: this.currentCategoryId++ };
      this.categories.set(category.id, category);
    });

    // Seed products
    const productsData: InsertProduct[] = [
      // Vegetables
      { name: "Fresh Tomatoes", description: "Organic vine-ripened tomatoes", price: "45.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 50, isAvailable: true, isFeatured: true, tags: ["organic", "fresh"] },
      { name: "Fresh Spinach", description: "Farm-fresh spinach leaves", price: "25.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 30, isAvailable: true, isFeatured: false, tags: ["organic", "green"] },
      { name: "Fresh Carrots", description: "Sweet orange carrots", price: "35.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: true, tags: ["fresh", "sweet"] },
      { name: "Onions", description: "Fresh red onions", price: "20.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a4d36963?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 60, isAvailable: true, isFeatured: false, tags: ["fresh"] },
      { name: "Potatoes", description: "Fresh potatoes", price: "30.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "2kg", stock: 80, isAvailable: true, isFeatured: false, tags: ["staple"] },
      { name: "Bell Peppers", description: "Colorful bell peppers", price: "60.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: false, tags: ["colorful", "fresh"] },
      { name: "Cauliflower", description: "Fresh white cauliflower", price: "40.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1510627489930-0c1b0e5bb90e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1 piece", stock: 20, isAvailable: true, isFeatured: false, tags: ["fresh", "white"] },
      { name: "Broccoli", description: "Fresh green broccoli", price: "80.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 15, isAvailable: true, isFeatured: false, tags: ["green", "healthy"] },

      // Fruits
      { name: "Fresh Apples", description: "Kashmir red delicious apples", price: "180.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1569870499705-504209102861?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 35, isAvailable: true, isFeatured: true, tags: ["premium", "sweet"] },
      { name: "Fresh Bananas", description: "Ripe yellow bananas", price: "60.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1 dozen", stock: 50, isAvailable: true, isFeatured: true, tags: ["ripe", "sweet"] },
      { name: "Fresh Oranges", description: "Juicy oranges", price: "120.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: false, tags: ["juicy", "vitamin-c"] },
      { name: "Fresh Grapes", description: "Sweet green grapes", price: "150.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 20, isAvailable: true, isFeatured: false, tags: ["sweet", "fresh"] },
      { name: "Mangoes", description: "Alphonso mangoes", price: "300.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 25, isAvailable: true, isFeatured: true, tags: ["alphonso", "premium"] },
      { name: "Pomegranates", description: "Fresh pomegranates", price: "200.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1553279147-83c56d5ad5b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 15, isAvailable: true, isFeatured: false, tags: ["antioxidant", "fresh"] },

      // Dairy
      { name: "Fresh Milk", description: "Full cream milk", price: "55.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1L", stock: 100, isAvailable: true, isFeatured: true, tags: ["fresh", "full-cream"] },
      { name: "Fresh Paneer", description: "Homemade cottage cheese", price: "80.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "200g", stock: 30, isAvailable: true, isFeatured: true, tags: ["homemade", "fresh"] },
      { name: "Greek Yogurt", description: "Thick Greek yogurt", price: "120.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: false, tags: ["greek", "thick"] },
      { name: "Butter", description: "Fresh white butter", price: "45.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "100g", stock: 40, isAvailable: true, isFeatured: false, tags: ["fresh", "white"] },

      // Spices
      { name: "Turmeric Powder", description: "Pure turmeric powder", price: "120.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 50, isAvailable: true, isFeatured: true, tags: ["pure", "organic"] },
      { name: "Red Chili Powder", description: "Spicy red chili powder", price: "100.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 45, isAvailable: true, isFeatured: false, tags: ["spicy", "hot"] },
      { name: "Garam Masala", description: "Traditional garam masala blend", price: "150.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "200g", stock: 30, isAvailable: true, isFeatured: true, tags: ["traditional", "blend"] },
      { name: "Cumin Powder", description: "Ground cumin seeds", price: "80.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "250g", stock: 35, isAvailable: true, isFeatured: false, tags: ["ground", "aromatic"] },

      // Household
      { name: "Dish Soap", description: "Lemon scented dish soap", price: "85.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1585012613961-90d70f8cc43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500ml", stock: 60, isAvailable: true, isFeatured: false, tags: ["lemon", "cleaning"] },
      { name: "Laundry Detergent", description: "Concentrated laundry detergent", price: "250.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1610557892929-4ac84ff08b0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: true, tags: ["concentrated", "effective"] },
      { name: "Toilet Paper", description: "Soft toilet paper rolls", price: "120.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1631947430066-48c30d57b943?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "6 rolls", stock: 80, isAvailable: true, isFeatured: false, tags: ["soft", "essential"] },
      { name: "All-Purpose Cleaner", description: "Multi-surface cleaner", price: "95.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "750ml", stock: 30, isAvailable: true, isFeatured: false, tags: ["multi-surface", "effective"] },

      // Snacks
      { name: "Mixed Nuts", description: "Premium mixed nuts", price: "450.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: true, tags: ["premium", "healthy"] },
      { name: "Potato Chips", description: "Crispy potato chips", price: "40.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "150g", stock: 100, isAvailable: true, isFeatured: false, tags: ["crispy", "salty"] },
      { name: "Dark Chocolate", description: "70% dark chocolate bar", price: "180.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "100g", stock: 35, isAvailable: true, isFeatured: true, tags: ["dark", "premium"] },
      { name: "Green Tea", description: "Organic green tea bags", price: "200.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1627933825978-fb3c8c0b1e79?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "25 bags", stock: 40, isAvailable: true, isFeatured: false, tags: ["organic", "healthy"] },
    ];

    productsData.forEach(prod => {
      const product: Product = { ...prod, id: this.currentProductId++, createdAt: new Date() };
      this.products.set(product.id, product);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = { ...category, id: this.currentCategoryId++ };
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async getProducts(categorySlug?: string, searchQuery?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      if (category) {
        products = products.filter(p => p.categoryId === category.id);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isFeatured);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = { ...product, id: this.currentProductId++, createdAt: new Date() };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!
    })).filter(item => item.product);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.sessionId === item.sessionId && cartItem.productId === item.productId
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      return existingItem;
    }

    const newItem: CartItem = { ...item, id: this.currentCartItemId++, createdAt: new Date() };
    this.cartItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateCartItemQuantity(sessionId: string, productId: number, quantity: number): Promise<void> {
    const item = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.sessionId === sessionId && cartItem.productId === productId
    );

    if (item) {
      if (quantity <= 0) {
        this.cartItems.delete(item.id);
      } else {
        item.quantity = quantity;
      }
    }
  }

  async removeFromCart(sessionId: string, productId: number): Promise<void> {
    const item = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.sessionId === sessionId && cartItem.productId === productId
    );

    if (item) {
      this.cartItems.delete(item.id);
    }
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    itemsToDelete.forEach(item => this.cartItems.delete(item.id));
  }
}

// Create a database storage instance and seed data on initialization
export const storage = new DatabaseStorage();

// Seed data on startup
async function seedDatabase() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      console.log('[database] Database already seeded');
      return;
    }

    console.log('[database] Seeding database...');

    // Seed categories
    const categoriesData: InsertCategory[] = [
      { name: "Vegetables", slug: "vegetables", description: "Fresh & Organic", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Fruits", slug: "fruits", description: "Sweet & Juicy", imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Dairy", slug: "dairy", description: "Fresh & Pure", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Spices", slug: "spices", description: "Authentic Flavors", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Household", slug: "household", description: "Daily Essentials", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
      { name: "Snacks", slug: "snacks", description: "Tasty Treats", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" },
    ];

    for (const categoryData of categoriesData) {
      await storage.createCategory(categoryData);
    }

    // Seed products
    const productsData: InsertProduct[] = [
      // Vegetables
      { name: "Fresh Tomatoes", description: "Organic vine-ripened tomatoes", price: "45.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 50, isAvailable: true, isFeatured: true, tags: ["organic", "fresh"] },
      { name: "Fresh Spinach", description: "Farm-fresh spinach leaves", price: "25.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 30, isAvailable: true, isFeatured: false, tags: ["organic", "green"] },
      { name: "Fresh Carrots", description: "Sweet orange carrots", price: "35.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: true, tags: ["fresh", "sweet"] },
      { name: "Onions", description: "Fresh red onions", price: "20.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a4d36963?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 60, isAvailable: true, isFeatured: false, tags: ["fresh"] },
      { name: "Potatoes", description: "Fresh potatoes", price: "30.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "2kg", stock: 80, isAvailable: true, isFeatured: false, tags: ["staple"] },
      { name: "Bell Peppers", description: "Colorful bell peppers", price: "60.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: false, tags: ["colorful", "fresh"] },
      { name: "Cauliflower", description: "Fresh white cauliflower", price: "40.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1510627489930-0c1b0e5bb90e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1 piece", stock: 20, isAvailable: true, isFeatured: false, tags: ["fresh", "white"] },
      { name: "Broccoli", description: "Fresh green broccoli", price: "80.00", categoryId: 1, imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 15, isAvailable: true, isFeatured: false, tags: ["green", "healthy"] },

      // Fruits
      { name: "Fresh Apples", description: "Kashmir red delicious apples", price: "180.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1569870499705-504209102861?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 35, isAvailable: true, isFeatured: true, tags: ["premium", "sweet"] },
      { name: "Fresh Bananas", description: "Ripe yellow bananas", price: "60.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1 dozen", stock: 50, isAvailable: true, isFeatured: true, tags: ["ripe", "sweet"] },
      { name: "Fresh Oranges", description: "Juicy oranges", price: "120.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: false, tags: ["juicy", "vitamin-c"] },
      { name: "Fresh Grapes", description: "Sweet green grapes", price: "150.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 20, isAvailable: true, isFeatured: false, tags: ["sweet", "fresh"] },
      { name: "Mangoes", description: "Alphonso mangoes", price: "300.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 25, isAvailable: true, isFeatured: true, tags: ["alphonso", "premium"] },
      { name: "Pomegranates", description: "Fresh pomegranates", price: "200.00", categoryId: 2, imageUrl: "https://images.unsplash.com/photo-1553279147-83c56d5ad5b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 15, isAvailable: true, isFeatured: false, tags: ["antioxidant", "fresh"] },

      // Dairy
      { name: "Fresh Milk", description: "Full cream milk", price: "55.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1L", stock: 100, isAvailable: true, isFeatured: true, tags: ["fresh", "full-cream"] },
      { name: "Fresh Paneer", description: "Homemade cottage cheese", price: "80.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "200g", stock: 30, isAvailable: true, isFeatured: true, tags: ["homemade", "fresh"] },
      { name: "Greek Yogurt", description: "Thick Greek yogurt", price: "120.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: false, tags: ["greek", "thick"] },
      { name: "Butter", description: "Fresh white butter", price: "45.00", categoryId: 3, imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "100g", stock: 40, isAvailable: true, isFeatured: false, tags: ["fresh", "white"] },

      // Spices
      { name: "Turmeric Powder", description: "Pure turmeric powder", price: "120.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 50, isAvailable: true, isFeatured: true, tags: ["pure", "organic"] },
      { name: "Red Chili Powder", description: "Spicy red chili powder", price: "100.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 45, isAvailable: true, isFeatured: false, tags: ["spicy", "hot"] },
      { name: "Garam Masala", description: "Traditional garam masala blend", price: "150.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "200g", stock: 30, isAvailable: true, isFeatured: true, tags: ["traditional", "blend"] },
      { name: "Cumin Powder", description: "Ground cumin seeds", price: "80.00", categoryId: 4, imageUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "250g", stock: 35, isAvailable: true, isFeatured: false, tags: ["ground", "aromatic"] },

      // Household
      { name: "Dish Soap", description: "Lemon scented dish soap", price: "85.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1585012613961-90d70f8cc43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500ml", stock: 60, isAvailable: true, isFeatured: false, tags: ["lemon", "cleaning"] },
      { name: "Laundry Detergent", description: "Concentrated laundry detergent", price: "250.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1610557892929-4ac84ff08b0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "1kg", stock: 40, isAvailable: true, isFeatured: true, tags: ["concentrated", "effective"] },
      { name: "Toilet Paper", description: "Soft toilet paper rolls", price: "120.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1631947430066-48c30d57b943?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "6 rolls", stock: 80, isAvailable: true, isFeatured: false, tags: ["soft", "essential"] },
      { name: "All-Purpose Cleaner", description: "Multi-surface cleaner", price: "95.00", categoryId: 5, imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "750ml", stock: 30, isAvailable: true, isFeatured: false, tags: ["multi-surface", "effective"] },

      // Snacks
      { name: "Mixed Nuts", description: "Premium mixed nuts", price: "450.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "500g", stock: 25, isAvailable: true, isFeatured: true, tags: ["premium", "healthy"] },
      { name: "Potato Chips", description: "Crispy potato chips", price: "40.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "150g", stock: 100, isAvailable: true, isFeatured: false, tags: ["crispy", "salty"] },
      { name: "Dark Chocolate", description: "70% dark chocolate bar", price: "180.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "100g", stock: 35, isAvailable: true, isFeatured: true, tags: ["dark", "premium"] },
      { name: "Green Tea", description: "Organic green tea bags", price: "200.00", categoryId: 6, imageUrl: "https://images.unsplash.com/photo-1627933825978-fb3c8c0b1e79?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=240", unit: "25 bags", stock: 40, isAvailable: true, isFeatured: false, tags: ["organic", "healthy"] },
    ];

    for (const productData of productsData) {
      await storage.createProduct(productData);
    }

    console.log('[database] Database seeded successfully');
  } catch (error) {
    console.error('[database] Error seeding database:', error);
  }
}

// Initialize seeding
seedDatabase();
