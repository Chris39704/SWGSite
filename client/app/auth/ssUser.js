(function () {
  'use strict';
  var controllerId = 'ssUser';
  angular.module('app').factory(controllerId, ['$resource', ssUser]);

  function ssUser($resource) {
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);

    var vm = this;

    var UserResource = $resource('/api/users/:id', { _id: "@id" }, {
      update: { method: 'PUT', isArray: false }
    });

    UserResource.prototype.isAdmin = function () {
      return this.roles && this.roles.indexOf('admin') > -1;
    }

    return UserResource;
  }
});