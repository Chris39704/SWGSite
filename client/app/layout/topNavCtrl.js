(function () {
  'use strict';
  var controllerId = 'topNavCtrl';
  angular.module('app').controller(controllerId, ['common', 'authIdentity', 'authService', '$location', 'datacontext', topNavCtrl]);

  function topNavCtrl(common, authIdentity, authService, $location, datacontext) {
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);
    var logSuccess = common.logger.getLogFn(controllerId, 'success');
    var logError = common.logger.getLogFn(controllerId, 'error');

    var vm = this;

    vm.signin = signin;
    vm.signout = signout;
    vm.auth = authIdentity;


    activate();

    function activate() {
        var promises = [getUser()];
        /*  log('Activated Dashboard View'); */
        common.activateController(promises, controllerId)
            .then(function () { });
    }

    function getUser() {
      if(localStorage.getItem('x-auth')) {
        return datacontext.getPlayerInfo();
      }
    }

    function signin(username, password) {
      authService.authenticateUser(username, password).then(function (success) {
        if (success) {
          logSuccess('Successfully Signed In!');
        }  else {
          logError('Incorrect Username/Password');
        }
      }, function (error) {
        if (error.data.message) {
          logError(`Error: ${error.data.message}`);
        } else {
          logError(`Error: ${error.statusText}`);
        }

      });
    }

    function signout() {
      authService.logoutUser().then(function () {
        vm.username = "";
        vm.password = "";
        logSuccess('Successfully Signed Out!');
        $location.path('/');
      })
    }
  }
})();

