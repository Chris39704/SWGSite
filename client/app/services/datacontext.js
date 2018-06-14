(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', datacontext]);

    function datacontext(common) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var primePromise;
        var $q = common.$q;

        var storeMeta = {
            isLoaded: {
                sessions: false,
                attendees: false
            }
        };

        var service = {
            // getAttendeeCount: getAttendeeCount,
            // getAttendees: getAttendees,
            prime: prime
        };

        return service;

        function getAttendees(forceRemote) {

            if (_areAttendeesLoaded() && !forceRemote) {
                // Get the page of attendees from local cache
                return $q.when();
            }
        }

        function prime() {
            if (primePromise) return primePromise;

            primePromise = $q.all([])
                .then()
                .then(success);
            return primePromise;

            function success() {
                //  setLookups();
                // log('Data Primed');
            }

        }

        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(manager)
                .executeLocally();
        }

        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retrieving data.' + error.message;
            logError(msg, error);
            throw error;
        }

        function _areSessionsLoaded(value) {
            return _areItemsLoaded('sessions', value);
        }

        function _areAttendeesLoaded(value) {
            return _areItemsLoaded('attendees', value);
        }

    }
})();