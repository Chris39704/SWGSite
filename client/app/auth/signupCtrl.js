(function () {
    'use strict';
    var controllerId = 'signupCtrl';
    angular.module('app').controller(controllerId, ['common', 'authIdentity', 'authService', '$location', signupCtrl]);

    function signupCtrl(common, authIdentity, authService, $location) {
        var getLogFn = common.logger.getLogFn;
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var logError = common.logger.getLogFn(controllerId, 'error');
        var session = common.setSession;

        var vm = this;
        vm.signup = signup;

        activate();

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () { });
        }

        vm.auth = authIdentity;
        function signup(user) {
            var userData = { username: user.username, email: user.email, password: user.password };
            authService.createUser(userData).then(function (success) {
                if (success) {
                    logSuccess('Account Created. Pending Email Verification.');
                    $location.path('/');
                } /* else {
                    logError('Error: Invalid Credentials');
                } */
            }, function (error) {
                if (error.data.errmsg.indexOf('E11000') > -1) {
                    logError(`Error: ${error.resource.username}`);
                } if (error.data.errmsg.indexOf('E11000') === -1) {
                    logError(`Unknown Error: ${error.statusText}`);
                }
            });
        }
    }
})();