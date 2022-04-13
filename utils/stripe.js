require('dotenv').config();
const stripe = require('stripe')("sk_test_51JKLraJHo7uP0Do5AHWOn1Ci9F3uaAIRpN3nC7K5zW00SjqKFpJGGPn68Wk7XVmLm9BoegvrXV3S892IotXrGpqH00YfYbZwLY");

    
function formatStripeAmount(USDString) {
    return parseFloat(USDString) * 100;
}

function createProduct(requestBody) {
    return stripe.products.create({
    name: requestBody.productName,
    type: 'service'
    });
}

function createPlan(requestBody) {
    return stripe.prices.create({
        unit_amount: formatStripeAmount(requestBody.planAmount),
        currency: 'usd',
        recurring: {interval: 'month'},
        product: requestBody.productId,
    });
}

module.exports = {
    createProduct,
    createPlan,
};
