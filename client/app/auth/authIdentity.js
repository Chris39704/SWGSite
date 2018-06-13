(function () {
  'use strict';
  var controllerId = 'authIdentity';
  angular.module('app').factory(controllerId, ['$window', 'ssUser', authIdentity]);

  function authIdentity($window, ssUser) {
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);

    var vm = this;

    var currentUser;
    if (!!$window.bootstrappedUserObject) {
      currentUser = new ssUser();
      angular.extend(currentUser, $window.bootstrappedUserObject);
    }
    return {
      currentUser: currentUser,
      isAuthenticated: function () {
        return !!this.currentUser;
      },
      isAuthorized: function (role) {
        return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
      }
    }
  }
})