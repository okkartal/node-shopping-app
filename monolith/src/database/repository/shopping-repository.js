const {
    CustomerModel,
    ProductModel,
    OrderModel
} = require('../models');
const {
    uuid
} = require('uuidv4');

class ShoppingRepository {

    async Orders(customerId) {
        const orders = await OrderModel.find({
                customerId
            })
            .populate('items.product');

        return orders;
    }

    async CreateNewOrder(customerId, txnId) {
        const profile = await CustomerModel.findById(customerId)
            .populate('cart.product');

        if (profile) {
            let amount = 0;
            let cartItems = profile.cart;

            if (cartItems.length > 0) {
                cartItems.map(item => {
                    amount += parseFloat(item.product.price) * parseFloat(item.unit);
                });

                const orderId = uuid();

                const order = new OrderModel({
                    orderId,
                    customerId,
                    amount,
                    txnId,
                    status: 'received',
                    items: cartItems
                });

                profile.cart = [];

                order.populate('items.product').execPopulate();
                const orderResult = await order.save();

                profile.orders.push(orderResult);
                await profile.save();

                return orderResult;
            }
        }
    }
}

module.exports = ShoppingRepository;
