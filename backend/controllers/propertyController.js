// controllers/propertyController.js
import Property from "../models/Property.js";

// Create a new property (Admin only)
export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, houseType, houseRules, checkInInstructions, wifiCode, parkingInstructions } = req.body;
    const parsedPrice = Number(price);

    if (!title?.trim() || Number.isNaN(parsedPrice)) {
      return res.status(400).json({ message: "Title and valid price are required" });
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    const property = await Property.create({
      title: title.trim(),
      description,
      price: parsedPrice,
      location,
      houseType,
      images,
      houseRules,
      checkInInstructions,
      wifiCode,
      parkingInstructions,
      createdBy: req.user._id,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all properties
export const getProperties = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = search
      ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single property
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update property (Admin only)
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    Object.assign(property, req.body);

    if (req.files) {
      property.images = req.files.map(file => file.path);
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete property (Admin only)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    await property.deleteOne();
    res.json({ message: "Property removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
