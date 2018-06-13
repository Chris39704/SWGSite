angular.module('app').factory('authService', ['$http', 'authIdentity', '$q', 'ssUser', function ($http, authIdentity, $q, ssUser) {

    return {
        authenticateUser: function (username, password) {
            var dfd = $q.defer();
            $http.post('/login', { username: username, password: password }).then(function (response) {
                if (response.data.success) {
                    var user = new ssUser();
                    angular.extend(user, response.data.user);
                    authIdentity.currentUser = user;
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
            return dfd.promise;
        },

        createUser: function (newUserData) {
            var newUser = new ssUser(newUserData);
            var dfd = $q.defer();

            newUser.$save().then(function () {
                authIdentity.currentUser = newUser;
                dfd.resolve();
            }, function (response) {
                dfd.reject(response.data.reason);
            });

            return dfd.promise;
        },

        updateCurrentUser: function (newUserData) {
            var dfd = $q.defer();

            var clone = angular.copy(authIdentity.currentUser);
            angular.extend(clone, newUserData);
            clone.$update().then(function () {
                authIdentity.currentUser = clone;
                dfd.resolve();
            }, function (response) {
                dfd.reject(response.data.reason);
            });
            return dfd.promise;
        },

        logoutUser: function () {
            var dfd = $q.defer();
            $http.post('/logout', { logout: true }).then(function () {
                authIdentity.currentUser = undefined;
                dfd.resolve();
            });
            return dfd.promise;
        },
        authorizeCurrentUserForRoute: function (role) {
            console.log('checking');
            if (authIdentity.isAuthorized(role)) {
                return true;
            } else {
                console.log('not authorized');
                return $q.reject('not authorized');
            }

        },
        authorizeAuthenticatedUserForRoute: function () {
            console.log('checking');
            if (authIdentity.isAuthenticated()) {
                return true;
            } else {
                console.log('not authorized');
                return $q.reject('not authorized');
            }
        }
    }
}]);