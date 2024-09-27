const ProductService = require('../services/product-service');
const { PublishCustomerEvent, PublishShoppingEvent } = require('../utils');
const UserAuth = require('./middlewares/auth');

module.exports = (app) => {
    const service = new ProductService();

    app.post('/create', async (req, res, next) => {
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

        const { data } = await service.GetProductPayload(_id,
            { productId: req.body._id }, 'ADD_TO_WISHLIST'
        )
        //get payload to send customer service
        PublishCustomerEvent(data);
        return res.status(200).json(data.data.product);
    });

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user;

        const productId = req.params.id;

        const { data } = await service.GetProductPayload(_id,
            { productId }, 'REMOVE_FROM_WISHLIST'
        )

        PublishCustomerEvent(data);
        return res.status(200).json(data.data.product);
    });

    app.put('/cart', UserAuth, async (req, res, next) => {
        const {
            _id,
        } = req.user;

        const { data } = await service.GetProductPayload(_id,
            { productId: req.body._id, quantity: req.body.quantity }, 'ADD_TO_CART'
        )

        PublishCustomerEvent(data);
        PublishShoppingEvent(data);

        const response = {
            product: data.data.product,
            unit: data.data.quantity
        };

        return res.status(200).json(response);
    });

    app.delete('/cart/:id', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user;

        const productId = req.params.id;

        const { data } = await service.GetProductPayload(_id,
            { productId }, 'REMOVE_FROM_CART'
        )

        PublishCustomerEvent(data);
        PublishShoppingEvent(data);

        const response = {
            product: data.data.product,
            unit: data.data.quantity
        };

        return res.status(200).json(response);
    });

    app.get('/', async (req, res, next) => {
        const {
            data
        } = await service.GetProducts();
        return res.status(200).json(data);
    })
}
