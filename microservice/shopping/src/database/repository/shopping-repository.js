const {
    OrderModel,
    CartModel
} = require('../models');
const {
    uuid
} = require('uuidv4');

class ShoppingRepository {

    async Orders(customerId) {
        const orders = await OrderModel.find({
                customerId
            });

        return orders;
    }

    async Cart(customerId) {
        const cartItems = await CartModel.find({ customerId: customerId });

        return cartItems ? cartItems : {message: 'Data not found'};
    }

    async AddCartItem(customerId, item, quantity, isRemove) {

        const cart = await CartModel.findOne({ customerId: customerId });

        const { _id } = item;

        if (cart) {

            let isExist = false;

            let cartItems = cart.items;

            if (cartItems.length > 0) {
                cartItems.map((item) => {
                    if (item.product._id.toString() === product._id.toString()) {
                        if (isRemove) {
                            cartItems.splice(cartItems.indexOf(item), 1);
                        } else {
                            item.unit = quantity;
                        }
                        isExist = true;
                    }
                });

                if (!isExist && !isRemove) {
                    cartItems.push(cartItem);
                }
                cart.items = cartItems;

                return await cart.save();
            } else {
                return await CartModel.create({
                    customerId,
                    items: [{ product: {...item}, unit: quantity }]
                });
            }
        }
        return { message: 'Data not found'};
    }

    async CreateNewOrder(customerId, txnId) {

        const cart = await CartModel.findOne({ customerId: customerId});

        if (cart) {
            let amount = 0;
            let cartItems = cart.cart;

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

                cart.items = [];
 
                const orderResult = await order.save();

                cart.orders.push(orderResult);
                await cart.save();

                return orderResult;
            }
        }
    }
}

module.exports = ShoppingRepository;
