(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', 'authIdentity', 'authService', datacontext]);

    function datacontext(common, authIdentity, authService) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var primePromise;
        var $q = common.$q;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                player: false
            }
        };

        var service = {
            // getPlayerCount: getPlayerCount,
            getPlayerInfo: getPlayerInfo,
            prime: prime
        };

        return service;

        function getPlayerInfo(forceRemote) {

            if (_isPlayerLoaded() && !forceRemote) {
                let playerInfo = authIdentity.currentUser;
                return $q.when(playerInfo);
            }
            if (!forceRemote) {
                let player = authService.getUserInfo();
                return $q.when(player);
            }
        }

        function prime() {
            if (primePromise) return primePromise;

            primePromise = $q.all([])
                .then()
                .then(success);
            return primePromise;

            function success() {
                // setLookups();
            }

        }

        function setLookups() {
            service.lookupCachedData = {
            };
        }


        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retrieving data.' + error.message;
            logError(msg, error);
            throw error;
        }

        function _areSessionsLoaded(value) {
            return _areItemsLoaded('sessions', value);
        }

        function _isPlayerLoaded(value) {
            return _areItemsLoaded('player', value);
        }

        function _areItemsLoaded(key, value) {
            if (value === undefined) {
                return storeMeta.isLoaded[key]; // get
            }
            return storeMeta.isLoaded[key] = value; // set
        }

    }
})();