(function () {
  'use strict';
  var controllerId = 'topNavCtrl';
  angular.module('app').controller(controllerId, ['common', 'authIdentity', 'authService', '$location', topNavCtrl]);

  function topNavCtrl(common, authIdentity, authService, $location) {
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);
    var logSuccess = common.logger.getLogFn(controllerId, 'success');
    var logError = common.logger.getLogFn(controllerId, 'error');

    var vm = this;

    vm.auth = authIdentity;
    vm.signin = function (username, password) {
      authService.authenticateUser(username, password).then(function (success) {
        if (success) {
          logSuccess('Successfully Signed In!');
        } else {
          logError('Incorrect Username/Password');
        }
      });
    }

    vm.signout = function () {
      authService.logoutUser().then(function () {
        vm.username = "";
        vm.password = "";
        logSuccess('Successfully Signed Out!');
        $location.path('/');
      })
    }
  }
})();

