const ProductService = require('../services/product-service');
const CustomerService = require('../services/customer-service');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
    const service = new ProductService();
    const customerService = new CustomerService();

    app.post('/product/create', async (req, res, next) => {
        const {
            name,
            desc,
            type,
            unit,
            price,
            available,
            supplier,
            banner
        } = req.body;
        const {
            data
        } = await service.CreateProduct({
            name,
            desc,
            type,
            unit,
            price,
            available,
            supplier,
            banner
        });
        return res.json(data);
    });

    app.get('/category/:type', async (req, res, next) => {
        const type = req.params.type;

        const {
            data
        } = await service.GetProductsByCategory(type);
        return res.status(200).json(data);
    });

    app.get('/:id', async (req, res, next) => {
        const productId = req.params.id;

        const {
            data
        } = await service.GetProductDescription(productId);
        return res.status(200).json(data);
    });

    app.post('/:ids', async (req, res, next) => {
        const {
            ids
        } = req.body;
        const products = await service.GetSelectedProducts(ids);
        return res.status(200).json(products);
    });

    app.put('/wishlist', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user; 

        const product = await service.GetProductById(req.body. _id);
        const wishList = await customerService.AddToWishList(_id, product);
        return res.status(200).json(wishList);
    });

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user;

        const productId = req.params.id;

        const product = await service.GetProductById(productId);
        const result = await customerService.AddToWishList(_id, product);
        return res.status(200).json(result);
    });

    app.put('/cart', UserAuth, async (req, res, next) => {
        const {
            _id,
            quantity
        } = req.body;

        const product = await service.GetProductById(_id);

        const result = await customerService.ManageCart(req.user._id, product, quantity, false);

        return res.status(200).json(result);
    });

    app.delete('/cart/:id', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user;

        const product = await service.GetProductById(req.params.id);
        const result = await customerService.ManageCart(_id, product, 0, true);
        return res.status(200).json(result);
    });

    app.get('/', async (req, res, next) => {
        const {
            data
        } = await service.GetProducts();
        return res.status(200).json(data);
    })
}
