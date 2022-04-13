const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function formatUSD(stripeAmount) {
    console.log(stripeAmount);
    return `$${(stripeAmount / 100).toFixed(2)}`;
}

exports.newProduct = async (req, res) => {
    res.send("I will create new product on stripe");
}

exports.getAllProducts = async (req, res) => {
    return Promise.all(
    [
        stripe.products.list({}),
        stripe.prices.list({})
    ]
    ).then(stripeData => {
    var products = stripeData[0].data;
    var price = stripeData[1].data; 

    products.forEach(product => {
        const filteredPrice = price.filter(price => {
        return price.product === product.id;
        });

        product.price = filteredPrice;
    });

    let response = {
        message: "All products and prices",
        response:{
            results: products
        }
    }

    res.json(response);
});

}