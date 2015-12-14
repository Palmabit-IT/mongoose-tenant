# mongoose-tenant

Add tenant ref attribute and helpers function to mongoose models.

[![Build Status](https://travis-ci.org/Palmabit-IT/mongoose-tenant.svg?branch=master)](https://travis-ci.org/Palmabit-IT/mongoose-tenant)
[![Coverage Status](https://coveralls.io/repos/Palmabit-IT/mongoose-tenant/badge.svg?branch=master&service=github)](https://coveralls.io/github/Palmabit-IT/mongoose-tenant?branch=master)

# Installation

```
npm install --save mongoose-tenant
```

# API

The `mongoose-tenant` module exposes a single function that you can
pass to the `mongoose.Schema.prototype.plugin()` function.

Suppose you have two collections, "users" and "companies". The `User` model
looks like this:

```javascript
var tenant = require('mongoose-tenant');

var companySchema = new Schema({ name: String });
Company = mongoose.model('Company', companySchema, 'companies');

var userSchema = new Schema({ name: String });
userSchema.plugin(tenant, {
  tenant: 'company'
});
User = mongoose.model('User', userSchema, 'users');

```

Suppose your "companies" collection has one document:

```javascript
{
  name: 'Mario Inc.',
  vat: 'IT1234567889'
  _id: '10ab3f375559dcaa649a3abc'
};
```

And your "users" collection has one document:

```javascript
{
  _id: '54ef3d123456abcd244a3abd',
  name: "Mario Rossi",
  company: '10ab3f375559dcaa649a3abc'
}
```
