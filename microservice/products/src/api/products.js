const { CUSTOMER_BINDING_KEY, SHOPPING_BINDING_KEY } = require('../config');
const ProductService = require('../services/product-service');
const { PublishMessage } = require('../utils');
const UserAuth = require('./middlewares/auth');

module.exports = (app, channel) => {
    const service = new ProductService();

    app.post('/create', async (req, res, next) => {
        const {
            name,
            description,
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
            description,
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
        PublishMessage(channel, CUSTOMER_BINDING_KEY, data);
        return res.status(200).json(data.data);
    });

    app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
        const {
            _id
        } = req.user;

        const productId = req.params.id;

        const { data } = await service.GetProductPayload(_id,
            { productId }, 'REMOVE_FROM_WISHLIST'
        )

        PublishMessage(channel, CUSTOMER_BINDING_KEY, data);
        return res.status(200).json(data.data);
    });

    app.put('/cart', UserAuth, async (req, res, next) => {
        const {
            _id,
        } = req.user;

        const { data } = await service.GetProductPayload(_id,
            { productId: req.body._id, quantity: req.body.quantity }, 'ADD_TO_CART'
        )

        PublishMessage(channel, CUSTOMER_BINDING_KEY, data);
        PublishMessage(channel, SHOPPING_BINDING_KEY, data);

        const response = {
            product: data.data?.product,
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

        PublishMessage(channel, CUSTOMER_BINDING_KEY, data);
        PublishMessage(channel, SHOPPING_BINDING_KEY, data);

        const response = {
            product: data.data?.product,
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
