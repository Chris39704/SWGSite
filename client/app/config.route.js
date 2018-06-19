(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            //$routeProvider.when(r.url, r.config);
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });


        function setRoute(url, definition) {
            // Sets resolvers for all of the routes
            // by extending any existing resolvers (or creating a new one).
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime
            });

            $routeProvider.when(url, definition);
            return $routeProvider;
        }
    }

    prime.$inject = ['datacontext'];
    function prime(dc) { return dc.prime(); }

    // Define the routes
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'Dashboard',
                    settings: {
                        nav: 1,
                        content: '<b>Dashboard</b><i class="fa fa-2x fa-chart-line fa-pull-right"></i>'
                    }
                }
            }, {
                url: '/profile',
                config: {
                    title: 'User Profile',
                    templateUrl: 'app/dashboard/dashboard.html',
                    settings: {
                        nav: 2,
                        content: '<b>Profile</b><i class="fab fa-2x fa-old-republic fa-pull-right"></i>'
                    },
                }
            }, {
                url: '/members',
                config: {
                    title: 'Members',
                    templateUrl: 'app/dashboard/dashboard.html',
                    settings: {
                        nav: 3,
                        content: '<b>Members</b><i class="fa fa-2x fa-user-friends fa-pull-right" style="font-size: smaller;"></i>'
                    },
                }
            }, {
                url: '/server',
                config: {
                    title: 'Server Info',
                    templateUrl: 'app/dashboard/dashboard.html',
                    settings: {
                        nav: 4,
                        content: '<b>Server Info</b><i class="fa fa-2x fa-server fa-pull-right"></i>'
                    },
                }
            }, {
                url: '/signup',
                config: {
                    title: 'Sign Up',
                    templateUrl: 'app/auth/signup.html',
                    settings: {},
                }
            },
        ];

    }
})();