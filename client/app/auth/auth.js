angular.module('app').factory('authService', ['$http', 'authIdentity', '$q', 'ssUser', 'common', function ($http, authIdentity, $q, ssUser, common) {

    var getLogFn = common.logger.getLogFn;
    var log = getLogFn('topNavCtrl');
    var logSuccess = common.logger.getLogFn('topNavCtrl', 'success');
    var logError = common.logger.getLogFn('topNavCtrl', 'error');


    return {
        authenticateUser: function (username, password) {
            var dfd = $q.defer();
            $http.post('/auth/players/login', { username: username, password: password }).then(function (response) {
                if (response.data) {
                    var user = new ssUser();
                    angular.extend(user, response.data);
                    authIdentity.currentUser = user;
                    let token = response.headers('x-auth');
                    common.setSession(token);
                    dfd.resolve(true);
                }
            }, function (error) {
                if (error.status == 400)
                    logError(`Error: ${error.status}, User Not Found`);
                else if (error.status != 400)
                    logError(`Error: ${error.statusText}`);

                dfd.resolve(false);
            });
            return dfd.promise;
        },

        getUserInfo: function () {
            var dfd = $q.defer();
            $http.get('/auth/players/me').then(function (response) {
                if (response.data) {
                    console.log(response.data);
                    var user = new ssUser();
                    angular.extend(user, response.data);
                    authIdentity.currentUser = user;
                    dfd.resolve(true);
                }
            }, function (error) {
                if (error.statusText)
                    logError(`Error: ${error.statusText}`);
                dfd.resolve(false);
            });
            return dfd.promise;
        },

        createUser: function (newUserData) {
            var newUser = new ssUser(newUserData);
            var dfd = $q.defer();

            newUser.$save().then(function () {
                dfd.resolve(true);
            }, function (response) {
                if (response.data.code)
                    dfd.reject('Error: Duplicate Username/Email.');
            });
            return dfd.promise;
        },
        updateCurrentUser: function (newUserData) {
            var dfd = $q.defer();

            var clone = angular.copy(authIdentity.currentUser);
            angular.extend(clone, newUserData);
            clone.$update().then(function () {
                authIdentity.currentUser = clone;
                dfd.resolve(true);
            }, function (response) {
                dfd.reject(response.data.reason);
            });
            return dfd.promise;
        },
        logoutUser: function () {
            var dfd = $q.defer();
            $http.delete('/auth/players/me/token').then(function (response) {
                authIdentity.currentUser = undefined;
                localStorage.removeItem('x-auth');
                localStorage.removeItem('expires_at');
                dfd.resolve(true);
            }, function (error) {
                logError(error);
                dfd.reject(error);
            });
            return dfd.promise;
        },
        authorizeCurrentUserForRoute: function (role) {
            if (authIdentity.isAuthorized(role) && isNotExpired) {
                return true;
            } else {
                logError('Not Authorized');
                return $q.reject('not authorized');
            }

        },
        authorizeAuthenticatedUserForRoute: function () {
            if (authIdentity.isAuthenticated() && common.isNotExpired) {
                return true;
            } else {
                logError('Not Authorized');
                return $q.reject('not authorized');
            }
        },
    }
}]);