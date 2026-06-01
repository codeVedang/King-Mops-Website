import express from 'express';
import { getProduct, listProducts } from '../lib/store.js';

export const productsRouter = express.Router();

productsRouter.get('/', async (req, res, next) => {
  try {
    const result = await listProducts({
      category: req.query.category,
      search: req.query.search,
      sort: req.query.sort,
      page: req.query.page,
      pageSize: req.query.pageSize,
      featured: req.query.featured === 'true'
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const product = await getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const related = await listProducts({
      category: product.category,
      pageSize: 4
    });
    res.json({
      product,
      related: related.products.filter((item) => item.id !== product.id).slice(0, 3)
    });
  } catch (error) {
    next(error);
  }
});
