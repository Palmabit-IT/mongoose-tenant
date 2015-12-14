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
#### It cat get tenant field in schemas


You can get the `tenant` field from Model
This means that, every time you call `find()` or `findOne()`,
`mongoose-tenant` will automatically call `.populate('lead')`
for you.


```javascript
    

    Customer
      .findOne({
        name: "Mario Rossi"
      })
      .populate('tenant')
      .exec(function(err, doc) {
        assert.ifError(err);
        assert.equal('Mario Inc.', doc.tenant.name);
        done();
      });
  
```

#### It supports custom tenant field


`mongoose-tenant` also works on custom tenant field.


```javascript
    

    var customerSchema = new Schema({
      name: String
    });
    var companySchema = new Schema({
      name: String,
      vat: String
    });

    customerSchema.plugin(tenant_plugin, {
      tenant: 'company'
    });
    var Company = mongoose.model('Company', companySchema, 'companies');
    var GoodCustomer = mongoose.model('GoodCustomer', customerSchema, 'customers');

    Company.create({
      'name': 'Mario Company Srl'
    }, function(error, doc) {
      assert.ifError(error);
      assert.ok(doc);

      GoodCustomer.create({
        name: 'Mario Rossi',
        company: doc._id
      }, function(error, doc) {
        assert.ifError(error);
        assert.ok(doc);

        GoodCustomer
          .findOne({
            name: "Mario Rossi"
          })
          .populate('company')
          .exec(function(err, doc) {
            assert.ifError(err);
            assert.equal('Mario Company Srl', doc.company.name);
            done();
          });

      });
    });

  
```

#### It exclude from search every doc without the `tenant` field


For methods: `find()`, `findOne()`, `findOneAndUpdate()` and `count()`
is added the `where` cond equivalent to { tenant: { $exists: true, $nin: [null, undefined, ''] }) }
So docs without the `tenant` field are excluded from search.


```javascript
    

    var gost_customer = {
      name: 'Jonh'
    };

    Customer.create(gost_customer, function(err, doc) {
      assert.ifError(err);
      assert.ok(doc);

      Customer
        .find()
        .populate('tenant')
        .exec(function(err, docs) {
          assert.ifError(err);
          assert.equal(1, docs.length);
          done();
        });

    });

  
```

## Author

[Palmabit Srl](http://www.palmabit.com)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
