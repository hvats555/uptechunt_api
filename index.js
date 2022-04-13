require('dotenv').config();
require('module-alias/register');
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

require('./db')();

const app = express();

var corsOptions = {
    origin: '*'
}
app.use(cors(corsOptions));
// app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// route import

// authentication
const auth = require('@routes/auth/auth');
const verify = require('@routes/auth/verify');
const passwordReset = require('@routes/auth/passwordReset');

// client
const client = require('@routes/client/client');
const clientReview = require('@routes/client/clientReview');

// freelancer
const portfolio = require('@routes/freelancer/portfolio');
const freelancer = require('@routes/freelancer/freelancer');
const onboarding = require('@routes/freelancer/onboarding');
const application = require('@routes/freelancer/application');
const freelancerReview = require('@routes/freelancer/freelancerReview');

// payment
const payment = require('@routes/payments/payment');
const withdrawal = require('@routes/payments/withdrawal');
const paymentMethod = require('@routes/payments/paymentMethod');
const stripeConnect = require('@routes/payments/stripeConnect');

// user
const user = require('@routes/user/user');
const bannedUser = require('@routes/user/bannedUser');

// common routes
const job = require('@routes/common/job');
const work = require('@routes/common/work');
const skill = require('@routes/common/skill');
const upload = require('@routes/common/upload');
const dispute = require('@routes/common/dispute');
const proposal = require('@routes/common/proposal');
const contract = require('@routes/common/contract');
const statistics = require('@routes/common/statistics');
const skillCategory = require('@routes/common/skillCategory');

const product = require('@routes/stripe/product');
const stripeWebhook = require('@routes/webhooks/stripe');

const chat = require('@routes/chat/chat');

const { proposalCredit } = require('@controllers/cron/cron');
proposalCredit();

app.get('/', (req, res) => {res.send("Get India Work API, version:- 1")});

app.use('/api/auth', auth);
app.use('/api/password-reset', passwordReset);
app.use('/api/users', user);

// client reviews
app.use('/api/client/reviews', clientReview);
app.use('/api/clients', client);

// freelancer reviews
app.use('/api/freelancer/reviews', freelancerReview);
app.use('/api/freelancers', freelancer);

app.use('/api/portfolio', portfolio);

app.use('/api/skill-categories', skillCategory);
app.use('/api/skills', skill);

app.use('/api/jobs', job);
app.use('/api/proposals', proposal);

app.use('/api/contract', contract);

app.use('/api/work', work);

app.use('/api/payment', payment);

app.use('/api/upload', upload);

app.use('/api/verify', verify);

app.use('/api/payment-method', paymentMethod);

app.use('/api/products', product);
// app.use('/api/plan', plan);

app.use('/api/connect', stripeConnect);

app.use('/api/stripe/webhook', stripeWebhook);

// Seperate route for statistics
app.use('/api/statistics', statistics);

app.use('/api/application', application);
app.use('/api/disputes', dispute);
app.use('/api/ban', bannedUser);

app.use('/api/withdrawal', withdrawal);
app.use('/api/onboarding', onboarding);

app.use('/api/chat', chat);


// // handling 404 not found error
// app.use((req, res, next) => {
//     const error = res.status(404).json({"error": "route not found"})
//     next(error);
// });

// // handling 500 internal server error
// app.use((err, req, res, next) => {
//     res.status(500).json(error([err]));
// });

// server running
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`API service running on PORT : ${port}`);
});