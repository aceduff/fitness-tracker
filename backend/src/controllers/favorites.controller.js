import {
  createFavoriteMeal,
  getFavoriteMeals,
  deleteFavoriteMeal
} from '../models/favoriteMeal.model.js';

export const addFavorite = async (req, res, next) => {
  try {
    const favorite = await createFavoriteMeal({
      user_id: req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, favorite });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await getFavoriteMeals(req.user.id);
    res.json({ success: true, favorites });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const deleted = await deleteFavoriteMeal(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    res.json({ success: true, message: 'Favorite removed' });
  } catch (error) {
    next(error);
  }
};
