(function () {
    'use strict';
    var controllerId = 'signupCtrl';
    angular.module('app').controller(controllerId, ['common', 'authIdentity', 'authService', '$location', signupCtrl]);

    function signupCtrl(common, authIdentity, authService, $location) {
        var getLogFn = common.logger.getLogFn;
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logError = common.logger.getLogFn(controllerId, 'error');

        var vm = this;

        activate();

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () { });
        }

        vm.auth = authIdentity;
        vm.signup = function (username, email, password) {
            var userData = { username, email, password };
            authService.createUser(userData).then(function (success) {
                if (success) {
                    logSuccess('Successfully Signed In!');
                    $location.path('/');
                } else {
                    logError('Incorrect Username/Password');
                }
            });
        }
    }
})();