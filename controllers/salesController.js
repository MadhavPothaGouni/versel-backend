const Sales = require("../models/Sales");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// GET Sales analytics
exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const sales = await Sales.find({
      reportDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).populate("product customer");

    // Total Revenue
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);

    // Average Order Value
    const avgOrderValue = sales.length ? totalRevenue / sales.length : 0;

    // Top Products
    const topProductsMap = {};
    sales.forEach((s) => {
      const key = s.product._id;
      topProductsMap[key] = topProductsMap[key] || { name: s.product.name, revenue: 0 };
      topProductsMap[key].revenue += s.totalRevenue;
    });
    const topProducts = Object.values(topProductsMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Top Customers
    const topCustomersMap = {};
    sales.forEach((s) => {
      const key = s.customer._id;
      topCustomersMap[key] = topCustomersMap[key] || { name: s.customer.name, revenue: 0 };
      topCustomersMap[key].revenue += s.totalRevenue;
    });
    const topCustomers = Object.values(topCustomersMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Region-wise revenue
    const regionMap = {};
    sales.forEach((s) => {
      const key = s.customer.region;
      regionMap[key] = regionMap[key] || 0;
      regionMap[key] += s.totalRevenue;
    });
    const regionSales = Object.entries(regionMap).map(([region, revenue]) => ({ region, revenue }));

    res.json({ totalRevenue, avgOrderValue, topProducts, topCustomers, regionSales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST Add new sale
exports.addSale = async (req, res) => {
  try {
    const { productId, customerId, quantity } = req.body;
    const product = await Product.findById(productId);
    const customer = await Customer.findById(customerId);
    if (!product || !customer) return res.status(404).json({ error: "Product or Customer not found" });

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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
