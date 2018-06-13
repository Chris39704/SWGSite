(function () {
    'use strict';
    var controllerId = 'userProfileCtrl';
    angular.module('app').controller(controllerId, ['$scope', 'authService', 'authIdentity', 'common', userProfileCtrl]);

    function userProfileCtrl($scope, authService, authIdentity, common) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        $scope.email = authIdentity.currentUser.username;
        $scope.fname = authIdentity.currentUser.firstName;
        $scope.lname = authIdentity.currentUser.lastName;

        $scope.update = function () {
            var newUserData = {
                username: $scope.email,
                firstName: $scope.fname,
                lastName: $scope.lname
            }
            if ($scope.password && $scope.password.length > 0) {
                newUserData.password = $scope.password;
            }

            authService.updateCurrentUser(newUserData).then(function () {
                log('Your user account has been updated');
            }, function (reason) {
                log(reason);
            })
        }
    }
});