var mongoose = require('mongoose'),
  assert = require('assert'),
  should = require('chai').should(),
  tenant_plugin = require('../'),
  Schema = mongoose.Schema,
  ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('mongodb://localhost:27017/tenant');

describe('mongoose-tenant plugin', function() {

  var Tenant;
  var Customer;

  before(function(done) {

    var customerSchema = new Schema({
      name: String
    });
    var tenantSchema = new Schema({
      name: String,
      vat: String
    });

    Tenant = mongoose.model('Tenant', tenantSchema, 'tenants');

    customerSchema.plugin(tenant_plugin);
    Customer = mongoose.model('Customer', customerSchema, 'customers');

    var mario = {
      name: 'Mario Rossi'
    };

    var jonh = {
      name: 'Jonh'
    };

    var tenant = {
      name: 'Mario Inc.',
      vat: 'IT123456789'
    };

    Customer.remove({}, function(error) {
      assert.ifError(error);
      Tenant.remove({}, function(error) {
        assert.ifError(error);
        Tenant.create(tenant, function(error, doc) {
          assert.ifError(error);
          assert.ok(doc);

          mario.tenant = doc._id;
          Customer.create(mario, function(error, doc) {
            assert.ifError(error);
            assert.ok(doc);
          });

          jonh.tenant = doc._id;
          Customer.create(jonh, function(error, doc) {
            assert.ifError(error);
            assert.ok(doc);
          });

          done();

        });
      });
    });

  });

  /**
   *  if you use findOneByTenant or findByTenant functions
   *  you have to pass tenant attr in conditions object
   *  or you got an error
   */
  it('can\'t get a single doc without the tenant attr in conditions object', function(done) {

    Customer.findOneByTenant({}, function(err, result) {
      should.exist(err);
      done();
    });

  });

  /**
   *  You can get a single doc by tenant
   */
  it('gets a single doc by tenant', function(done) {

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

  });

  /**
   *  You can limit docs
   */
  it('gets 2 docs by tenant', function(done) {

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

  });

  /**
   *  You can get the `tenant` field from Model
   */
  it('can get tenant field in schemas', function(done) {

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

  });

  /**
   *  `mongoose-tenant` also works on custom tenant field.
   */
  it('supports custom tenant field', function(done) {

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

  });


  /**
   *  For methods: `find()`, `findOne()`, `findOneAndUpdate()` and `count()`
   *  is added the `where` cond equivalent to { tenant: { $exists: true, $nin: [null, undefined, ''] }) }
   *  So docs without the `tenant` field are excluded from search.
   */
  it('exclude from search every doc without the `tenant` field', function(done) {

    var gost_customer = {
      name: 'Matteo'
    };

    Customer.create(gost_customer, function(err, doc) {
      assert.ifError(err);
      assert.ok(doc);

      Customer
        .find()
        .populate('tenant')
        .exec(function(err, docs) {
          assert.ifError(err);
          assert.equal(2, docs.length);

          Customer
            .find({
              name: 'Matteo'
            })
            .populate('tenant')
            .exec(function(err, docs) {
              assert.ifError(err);
              assert.equal(0, docs.length);
              done();
            });

        });

    });

  });

});
