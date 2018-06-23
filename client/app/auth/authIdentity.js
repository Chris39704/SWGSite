angular.module('app').factory('authIdentity', function ($window, ssUser) {
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
      return !!this.currentUser && this.currentUser.role.indexOf(role) > -1;
    }
  }
})