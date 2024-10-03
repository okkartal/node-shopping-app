const {
    ShoppingRepository
} = require('../database');
const {
    FormateData
} = require('../utils');

class ShoppingService {

    constructor() {
        this.repository = new ShoppingRepository();
    }

    async GetCart({ _id }) {
        const cartItems = await this.repository.Cart({ _id });
        return FormateData(cartItems);
    }

    async PlaceOrder(userInput) {
        const {
            _id,
            txnNumber
        } = userInput;

        const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
        return FormateData(orderResult);
    }

    async GetOrders(customerId) {
        const orders = await this.repository.Orders(customerId);
        return FormateData(orders);
    }

    async ManageCart(customerId, item, quantity, isRemove) {
        const cartResult = await this.repository.AddCartItem(customerId, item, quantity, isRemove);
        return FormateData(cartResult);
    }

    async SubscribeEvents(payload) {

        payload = JSON.parse(payload);
        
        const {
            event,
            data
        } = payload;

        const {
            userId,
            product,
            quantity
        } = data;

        switch (event) {
           case 'ADD_TO_CART':
                this.ManageCart(userId, product, quantity, false);
                break;
            case 'REMOVE_FROM_CART':
                this.ManageCart(userId, product, quantity, true);
            default:
                break;
        }
    }

    async GetOrderPayload(userId, order , event) {
        if(order) {
            const payload = {
                event: event,
                data: { userId, order }
            }
            return FormateData(payload);
        } else {
            return FormateData({ error : 'No Order available'});
        }
    }
}

module.exports = ShoppingService;
