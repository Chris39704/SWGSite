(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules
        'common',           // common functions, logger, spinner

        // 3rd Party Modules
        'ui.bootstrap'      // ui-bootstrap (ex: carousel, pagination, dialog)
    ]);

    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$q', 'routemediator',
        function ($route, $rootScope, $q, routemediator) {
            // Include $route to kick start the router.
            routemediator.setRoutingHandlers();
        }]);
})();