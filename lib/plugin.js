function multitenantPlugin(schema, options) {

  var tenant = 'tenant';
  var tenantType = schema.constructor.ObjectId;
  var tenantRef = 'Tenant';

  if (typeof options === 'object') {
    if (typeof options.tenant === 'string') {
      tenant = options.tenant;
    } else if (typeof options.tenant === 'object') {
      tenant = options.tenant.name || tenant;
      tenantType = options.tenant.type || tenantType;
    }
  }
  tenantRef = tenant[0].toUpperCase() + tenant.substr(1).toLowerCase()

  var dataObj = {};
  var index = {};

  dataObj[tenant] = {
    type: tenantType,
    ref: tenantRef,
    index: true
  };

  schema.add(dataObj);

  /**
   *  Attach a `findOneByTenant()` helper to the schema
   *  throw an exception if tenant is not in the conditions object
   */
  schema.statics.findOneByTenant = function (conditions, fields, options, callback) {
      var args = checkArgs(conditions, fields, options, callback);
      var populate;

      if (args.options.limit) {
        delete args.options.limit;
      }

      if (args.options.populate) {
        populate = args.options.populate;
        delete args.options.populate;
      }

      if (!conditions || !conditions[tenant]) {
        return args.callback(new Error('Tenant is required'), undefined);
      }

      var _this = this;

      var find = _this.findOne(args.conditions, args.fields, args.options);
      if (populate) {
        find.populate(populate);
      }
      find.exec(function (err, doc) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, doc);
      });

    };

  /**
   *  Attach a `findByTenant()` helper to the schema
   *  throw an exception if tenant is not in the conditions object
   */
  schema.statics.findByTenant = function(conditions, fields, options, callback) {
    var args = checkArgs(conditions, fields, options, callback);

    var limit = 1;
    var populate;

    if (args.options.limit) {
      limit = args.options.limit;
      delete args.options.limit;
    }

    if (args.options.populate) {
      populate = args.options.populate;
      delete args.options.populate;
    }

    if (!conditions || !conditions[tenant]) {
      return args.callback(new Error('Tenant is required'), undefined);
    }

    var _this = this;

    _this.count(args.conditions, function(err, num) {
      if (err) {
        return args.callback(err, undefined);
      }
      if (limit > num) {
        limit = num;
      }

      args.options.limit = limit;
      var find = _this.find(args.conditions, args.fields, args.options);
      if (populate) {
        find.populate(populate);
      }
      find.exec(function(err, docs) {
        if (err) {
          return args.callback(err, undefined);
        }
        return args.callback(undefined, docs);
      });
    });

  };

  var checkArgs = function(conditions, fields, options, callback) {
    if (typeof conditions === 'function') {
      callback = conditions;
      conditions = {};
      fields = {};
      options = {};
    } else if (typeof fields === 'function') {
      callback = fields;
      fields = {};
      options = {};
    } else if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    return {
      conditions: conditions,
      fields: fields,
      options: options,
      callback: callback
    }
  };


  /*
   * search only in documents that have the "tenant attribute"
   */
  function findWhereTenantExistAndIsNotNull(next) {
    this.where(tenant, {
      $exists: true,
      $nin: [null, undefined]
    });

    next();
  }

  schema.pre('find', findWhereTenantExistAndIsNotNull)
    .pre('findOne', findWhereTenantExistAndIsNotNull)
    .pre('findOneAndUpdate', findWhereTenantExistAndIsNotNull)
    .pre('count', findWhereTenantExistAndIsNotNull);

};

module.exports = multitenantPlugin;
