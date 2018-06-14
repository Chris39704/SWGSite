(function () {
  'use strict';
  var controllerId = 'topNavCtrl';
  angular.module('app').controller(controllerId, ['common', 'authIdentity', 'authService', '$location', topNavCtrl]);

  function topNavCtrl(common, authIdentity, authService, $location) {
    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);

    var vm = this;

    vm.identity = authIdentity;
    vm.signin = function (username, password) {
      authService.authenticateUser(username, password).then(function (success) {
        if (success) {
          log('You have successfully signed in!');
        } else {
          log('Username/Password combination incorrect');
        }
      });
    }

    vm.signout = function () {
      authService.logoutUser().then(function () {
        vm.username = "";
        vm.password = "";
        log('You have successfully signed out!');
        $location.path('/');
      })
    }
  }
});

{/* <div data-ng-controller="topNavCtrl as vm"> */ }