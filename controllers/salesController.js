const Sales = require("../models/Sales");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// GET Sales analytics
exports.getSales = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        query.reportDate = { $gte: start, $lte: end };
      }
    }

    const sales = await Sales.find(query).populate("product customer");

    if (!sales.length) {
      return res.json({ message: "No sales found for given dates", totalRevenue: 0, avgOrderValue: 0, topProducts: [], topCustomers: [], regionSales: [] });
    }

    // Total Revenue
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

    // Average Order Value
    const avgOrderValue = sales.length ? totalRevenue / sales.length : 0;

    // Top Products
    const topProductsMap = {};
    sales.forEach((s) => {
      if (!s.product) return;
      const key = s.product._id;
      topProductsMap[key] = topProductsMap[key] || { name: s.product.name, revenue: 0 };
      topProductsMap[key].revenue += s.totalRevenue || 0;
    });
    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top Customers
    const topCustomersMap = {};
    sales.forEach((s) => {
      if (!s.customer) return;
      const key = s.customer._id;
      topCustomersMap[key] = topCustomersMap[key] || { name: s.customer.name, revenue: 0 };
      topCustomersMap[key].revenue += s.totalRevenue || 0;
    });
    const topCustomers = Object.values(topCustomersMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Region-wise revenue
    const regionMap = {};
    sales.forEach((s) => {
      if (!s.customer || !s.customer.region) return;
      const key = s.customer.region;
      regionMap[key] = regionMap[key] || 0;
      regionMap[key] += s.totalRevenue || 0;
    });
    const regionSales = Object.entries(regionMap).map(([region, revenue]) => ({ region, revenue }));

    res.json({ totalRevenue, avgOrderValue, topProducts, topCustomers, regionSales });
  } catch (err) {
    console.error("❌ Error in getSales:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST Add new sale
exports.addSale = async (req, res) => {
  try {
    const { productId, customerId, quantity } = req.body;

    const product = await Product.findById(productId);
    const customer = await Customer.findById(customerId);
    if (!product || !customer) {
      return res.status(404).json({ error: "Product or Customer not found" });
    }

    const sale = new Sales({
      product: product._id,
      customer: customer._id,
      quantity,
      totalRevenue: quantity * product.price,
      reportDate: new Date(),
    });

    await sale.save();

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("salesUpdated");

    res.status(201).json(sale);
  } catch (err) {
    console.error("❌ Error in addSale:", err);
    res.status(500).json({ error: "Server error" });
  }
};
