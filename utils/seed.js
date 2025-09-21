const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Sales = require("../models/Sales");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected for seeding"))
.catch(err => console.error("❌ DB connection error:", err));

async function seedDB() {
  try {
    // Clear existing data
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Sales.deleteMany({});

    // Create Customers
    const customers = [];
    for (let i = 0; i < 15; i++) {
      const customer = new Customer({
        name: faker.person.fullName(),
        region: faker.helpers.arrayElement(["North", "South", "East", "West"]),
        type: faker.helpers.arrayElement(["Individual", "Business"]),
      });
      customers.push(customer);
    }
    await Customer.insertMany(customers);
    console.log("✅ Customers seeded");

    // Create Products
    const products = [];
    for (let i = 0; i < 15; i++) {
      const product = new Product({
        name: faker.commerce.productName(),
        category: faker.helpers.arrayElement(["Electronics", "Clothing", "Food", "Books"]),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      });
      products.push(product);
    }
    await Product.insertMany(products);
    console.log("✅ Products seeded");

    // Create Sales
    const sales = [];
    for (let i = 0; i < 50; i++) {
      const product = faker.helpers.arrayElement(products);
      const customer = faker.helpers.arrayElement(customers);
      const quantity = faker.number.int({ min: 1, max: 10 });
      sales.push(new Sales({
        product: product._id,
        customer: customer._id,
        quantity,
        totalRevenue: quantity * product.price,
        reportDate: faker.date.between({ from: '2023-01-01', to: '2025-12-31' })
      }));
    }
    await Sales.insertMany(sales);
    console.log("✅ Sales seeded");

    console.log("🎉 Database seeding complete!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDB();
