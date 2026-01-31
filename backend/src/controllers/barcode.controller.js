import axios from 'axios';

// Lookup barcode from Open Food Facts API
export const lookupBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;

    if (!barcode || !/^\d+$/.test(barcode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barcode format'
      });
    }

    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const response = await axios.get(apiUrl, { timeout: 10000 });

    if (response.data.status === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = response.data.product;
    const nutriments = product.nutriments || {};

    res.json({
      success: true,
      product: {
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        serving_size: product.serving_size || '',
        calories: Math.round(nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((nutriments.proteins_serving || nutriments.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((nutriments.fat_serving || nutriments.fat_100g || 0) * 10) / 10,
        image_url: product.image_url || null
      }
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Open Food Facts API request timed out'
      });
    }
    next(error);
  }
};
