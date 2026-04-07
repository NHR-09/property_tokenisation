const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Load dataset
const rawData = JSON.parse(fs.readFileSync("./marketData.json"));
const marketData = rawData.pune_property_dataset;

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 7/12 Pricing Engine API is running");
});


// 🔹 GET Property by ID + Pricing
app.get("/api/property/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const property = marketData.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  let basePrice = 0;

  // ✅ Handle different property types
  if (property.property_type === "flat") {
    basePrice = property.area_sqft * property.rrr_rate_sqft;
  } 
  else if (property.property_type === "plot") {
    basePrice = property.area_sqft * property.rrr_rate_sqft;
  } 
  else if (property.property_type === "house") {
    const landValue = property.land_area_sqft * property.land_rrr_rate_sqft;
    const buildingValue = property.building_area_sqft * property.building_rate_sqft;
    basePrice = landValue + buildingValue;
  }

  // Initial demand = 0
  const demandIndex = 0;

  let maxCap;
  if (demandIndex > 0.8) {
    maxCap = basePrice * 1.3;
  } else {
    maxCap = basePrice * 1.1;
  }

  res.json({
    property,
    basePrice,
    maxCap
  });
});


// 🔹 VALIDATE USER PRICE
app.post("/api/pricing/validate", (req, res) => {
  const { id, userPrice } = req.body;

  const property = marketData.find(p => p.id === id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  let basePrice = 0;

  if (property.property_type === "flat" || property.property_type === "plot") {
    basePrice = property.area_sqft * property.rrr_rate_sqft;
  } 
  else if (property.property_type === "house") {
    const landValue = property.land_area_sqft * property.land_rrr_rate_sqft;
    const buildingValue = property.building_area_sqft * property.building_rate_sqft;
    basePrice = landValue + buildingValue;
  }

  const demandIndex = 0;

  let maxCap;
  if (demandIndex > 0.8) {
    maxCap = basePrice * 1.3;
  } else {
    maxCap = basePrice * 1.1;
  }

  if (userPrice > maxCap) {
    return res.json({
      isValid: false,
      maxAllowed: maxCap,
      message: "Price exceeds allowed limit"
    });
  }

  res.json({
    isValid: true,
    approvedPrice: userPrice
  });
});


// 🔹 Simulated Property State (for buy/sell)
let propertyState = {
  basePrice: 5000000,
  currentPrice: 5000000,
  tokensTotal: 1000,
  tokensSold: 0,
  priceHistory: [5000000]
};


// 🔹 BUY TOKENS
app.post("/api/buy", (req, res) => {
  const { quantity } = req.body;

  propertyState.tokensSold += quantity;

  const demandIndex = propertyState.tokensSold / propertyState.tokensTotal;

  let multiplier;
  if (demandIndex > 0.8) multiplier = 1.3;
  else if (demandIndex > 0.5) multiplier = 1.2;
  else multiplier = 1.1;

  propertyState.currentPrice = propertyState.basePrice * multiplier;
  propertyState.priceHistory.push(propertyState.currentPrice);

  res.json({
    demandIndex,
    newPrice: propertyState.currentPrice
  });
});


// 🔹 SELL TOKENS
app.post("/api/sell", (req, res) => {
  const { quantity } = req.body;

  propertyState.tokensSold -= quantity;
  if (propertyState.tokensSold < 0) propertyState.tokensSold = 0;

  const demandIndex = propertyState.tokensSold / propertyState.tokensTotal;

  let multiplier;
  if (demandIndex > 0.8) multiplier = 1.3;
  else if (demandIndex > 0.5) multiplier = 1.2;
  else if (demandIndex > 0) multiplier = 1.1;
  else multiplier = 0.9; // drop

  propertyState.currentPrice = propertyState.basePrice * multiplier;
  propertyState.priceHistory.push(propertyState.currentPrice);

  res.json({
    demandIndex,
    newPrice: propertyState.currentPrice
  });
});


// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});