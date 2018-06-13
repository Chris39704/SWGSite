(function () {
  'use strict';

  var controllerId = 'userListCtrl';
  angular.module('app').controller(controllerId,
    ['$scope', 'ssUser', userListCtrl]);

  function userListCtrl($scope, ssUser) {
    var vm = this;
    var keyCodes = config.keyCodes;

    $scope.users = ssUser.query();

  }
});