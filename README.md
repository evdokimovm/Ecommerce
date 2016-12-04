# Ecommerce

#### Features

- Local Sign Up ang Local Log In
- Log In with Facebook
- Verify Account by Verify Link. After Sign Up to Email Address Send Verify Link
- Enable Admin Status to Account
- Public API with Access by API Token
- Stripe Payment
- Payment History on Profile Page
- Search and Instant Search Using [$regex](https://docs.mongodb.com/manual/reference/operator/query/regex/)
- Add Categories and Delete Categories Only for Admin Account
- After Delete Category All Products from This Category Will Also Be Deleted
- Add Products and Delete Products Only for Admin Account
- Delete Account

#### Technologies

- [EJS templating](http://www.embeddedjs.com/)
- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](http://mongoosejs.com/)
- [Express](http://expressjs.com/)
- [Passport](http://passportjs.org/)
- [Stripe](https://stripe.com/)

#### Installation

Install:

```
$ git clone https://github.com/evdokimovm/Ecommerce.git
$ cd Ecommerce
```

In `config/secret.js` file use your `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.

In `helpers/send.js` use your gmail account credentials
to sending verify link to user's email after sign up. 
Or use another email sending tool instead of `nodemailer`.

In `public/js/custom.js` (on line 2) and in `routes/main.js` (on line 9)
use your test Stripe `public key` and `secret key`.
Test card numbers for testing stripe here [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)

Run:

```
$ bower install
$ npm install
$ mongod
$ node server.js
```
