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
   *  Attach a `findByTenant()` helper to the schema
   *  throw an exception if tenant is not in the conditions object
   */
  schema.statics.findByTenant = function(conditions, fields, options, callback) {
    if (!conditions || !conditions[tenant]) {
      throw new Error('Tenant is required');
    }
    return this.find(conditions, fields, options, callback);
  };

  /*
   * search only in documents that have the "tenant attribute"
   */
  function findWhereTenantExistAndIsNotNull(next) {
    this.where(tenant, {
      $exists: true,
      $nin: [null, undefined, '']
    });
    next();
  }

  schema.pre('find', findWhereTenantExistAndIsNotNull)
    .pre('findOne', findWhereTenantExistAndIsNotNull)
    .pre('findOneAndUpdate', findWhereTenantExistAndIsNotNull)
    .pre('count', findWhereTenantExistAndIsNotNull);

};

module.exports = multitenantPlugin;
