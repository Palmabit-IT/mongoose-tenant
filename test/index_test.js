var mongoose = require('mongoose');
var assert = require('assert');
var tenant_plugin = require('../');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

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
            done();
          });
        });
      });
    });
  });

  /**
   *  You can get the `tenant` field from Model
   *  This means that, every time you call `find()` or `findOne()`,
   *  `mongoose-tenant` will automatically call `.populate('lead')`
   *  for you.
   */
  it('cat get tenant field in schemas', function(done) {

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

  });

});
