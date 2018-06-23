angular.module('app').factory('ssUser', function ($resource) {
  var UserResource = $resource('/auth/players/:id', { _id: "@id" }, {
    update: { method: 'PUT', isArray: false }
  });

  UserResource.prototype.isAdmin = function () {
    return this.role && this.role.indexOf('admin') > -1;
  }

  return UserResource;
});