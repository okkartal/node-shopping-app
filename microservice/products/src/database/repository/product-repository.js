const {
    ProductModel
} = require('../models');

class ProductRepository {
    async CreateProduct({
        name,
        description,
        type,
        unit,
        price,
        available,
        supplier,
        banner
    }) {
        const product = new ProductModel({
            name,
            description,
            type,
            unit,
            price,
            available,
            supplier,
            banner
        });

        const productResult = await product.save();
        return productResult;
    }

    async Products() {
        return await ProductModel.find();
    }

    async FindById(id) {
        return await ProductModel.findById(id);
    }

    async FindByCategory(category) {
        const products = await ProductModel.find({
            type: category
        });
    }

    async FindSelectedProducts(selectedIds) {
        const products = await ProductModel.find()
            .where("_id")
            .in(selectedIds.map((_id) => _id))
            .exec();

        return products;
    }
}

module.exports = ProductRepository;
