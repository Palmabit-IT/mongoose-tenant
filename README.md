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
#### It can't get a single doc without the tenant attr in conditions object


if you use findOneByTenant or findByTenant functions
you have to pass tenant attr in conditions object
or you got an error


```javascript
    

    Customer.findOneByTenant({}, function(err, result) {
      should.exist(err);
      done();
    });

  
```

#### It gets a single doc by tenant


You can get a single doc by tenant


```javascript
    

    Tenant.findOne({
      name: "Mario Inc."
    }, function(err, tenant) {
      assert.ifError(err);
      Customer.findOneByTenant({
        tenant: tenant._id
      }, function(err, result) {
        should.not.exist(err);
        result.should.have.property('name');
        done();
      });

    });

  
```

#### It gets 2 docs by tenant


You can limit docs


```javascript
    

    Tenant.findOne({
      name: "Mario Inc."
    }, function(err, tenant) {
      assert.ifError(err);

      Customer.findByTenant({
        tenant: tenant._id
      }, {}, {
        limit: 2
      }, function(err, result) {
        should.not.exist(err);
        result.should.have.length(2);
        for (var i = 0; i < 2; ++i) {
          result[i].should.have.property('name');
        }
        done();
      });

    });

  
```

#### It can get tenant field in schemas


You can get the `tenant` field from Model


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

#### It can populate


You can populate refs in schemas


```javascript
    

    Tenant.findOne({
      name: "Mario Inc."
    }, function(err, tenant) {
      assert.ifError(err);

      Customer.findOneByTenant({
        tenant: tenant._id,
        name: "Mario Rossi"
      }, {}, {
        populate: 'tenant'
      }, function(err, doc) {
        should.not.exist(err);
        assert.equal('Mario Inc.', doc.tenant.name);
        assert.equal('IT123456789', doc.tenant.vat);

        done();
      });

    });

  
```

#### It can settings populated fields


you can manually populate a field


```javascript
    

    Tenant.findOne({
      name: "Mario Inc."
    }, function(err, tenant) {
      assert.ifError(err);

      Customer.findOneByTenant({
        tenant: tenant._id,
        name: "Mario Rossi"
      }, {}, {
        populate: [{model:'tenant', fileds: '_id name'}]
      }, function(err, doc) {
        should.not.exist(err);
        doc.should.have.property('_id');

        assert.equal('Mario Inc.', doc.tenant.name);
        assert.equal(undefined, doc.tenant.vat);

        done();
      });

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
        name: 'Mario Reds',
        company: doc._id
      }, function(error, doc) {
        assert.ifError(error);
        assert.ok(doc);

        GoodCustomer
          .findOne({
            name: "Mario Reds"
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

## Author

[Palmabit Srl](http://www.palmabit.com)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
