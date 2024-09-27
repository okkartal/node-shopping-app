const {
    CustomerModel,
    AddressModel
} = require('../models');

class CustomerRepository {
    async CreateCustomer({
        email,
        password,
        phone,
        salt
    }) {
        const customer = new CustomerModel({
            email,
            password,
            salt,
            phone,
            address: []
        });

        const customerResult = await customer.save();
        return customerResult;
    }

    async CreateAddress({
        _id,
        street,
        postalCode,
        city,
        country
    }) {
        const profile = await CustomerModel.findById({
            _id
        });

        if (profile) {
            const newAddress = new AddressModel({
                street,
                postalCode,
                city,
                country
            });

            await newAddress.save();

            profile.address.push(newAddress);
        }
        return await profile.save();
    }

    async FindCustomer({
        email
    }) {
        const existingCustomer = await CustomerModel.findOne({
            email: email
        });
        return existingCustomer;
    }

    async FindCustomerById({
        id
    }) {
        const existingCustomer = await CustomerModel.findById(id)
            .populate('address');

        return existingCustomer;
    }

    async WishList(customerId) {
        const profile = await CustomerModel.findById(customerId)
            .populate('wishlist');

        return profile.wishList;
    }

    async AddWishListItem(customerId, { _id, name, price, available, banner }) {

        const product = {
            _id, name, desc, price, available, banner
        };

        const profile = await CustomerModel.findById(customerId)
            .populate('wishlist');

        if (profile) {
            let wishList = profile.wishlist;

            if (wishList?.length > 0) {
                let isExist = false;

                wishList.map(item => {
                    if (item._id.toString() === product._id.toString()) {
                        const index = wishList.indexOf(item);
                        wishList.splice(index, 1);
                        isExist = trıe;
                    }
                });

                if (!isExist) {
                    wishList.push(product);
                }
            } else {
                wishList.push(product);
            }
            profile.wishList = wishList;
        }

        const profileResult = await profile.save();

        return profileResult.wishList;
    }

    async AddCartItem(customerId, { _id, name, desc, price, available, banner }, unit, isRemove) {

        const product = { _id, name, desc, price, available, banner };

        const profile = await CustomerModel.findById(customerId)
            .populate('cart');

        if (profile) {
            const cartItem = {
                product,
                unit: unit
            };

            let cartItems = profile.cart;

            if (cartItems.length > 0) {
                let isExist = false;
                cartItems.map((item) => {
                    if (item.product._id.toString() === product._id.toString()) {
                        if (isRemove) {
                            cartItems.splice(cartItems.indexOf(item), 1);
                        } else {
                            item.unit = unit;
                        }
                        isExist = true;
                    }
                });

                if (!isExist) {
                    cartItems.push(cartItem);
                }
            } else {
                cartItems.push(cartItem);
            }

            profile.cart = cartItems;

            const cartSaveResult = await profile.save();
            return cartSaveResult;
        }
    }

    async AddOrderToProfile(customerId, order) {
        const profile = await CustomerModel.findById(customerId);

        if (profile) {
            if (profile.orders == undefined) {
                profile.orders = [];
            }
        }
        profile.orders.push(order);

        profile.cart = [];

        const profileResult = await profile.save();

        return profileResult;
    }
}

module.exports = CustomerRepository;
