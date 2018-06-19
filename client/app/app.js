(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'angular-jwt',
        'ngResource',
        'ui.router',
        //  'ngMaterial',

        // Custom modules
        'common',           // common functions, logger, spinner

        // 3rd Party Modules
        'ui.bootstrap'      // ui-bootstrap (ex: carousel, pagination, dialog)
    ]);

    app.config(function ($locationProvider, $stateProvider, $urlRouterProvider, $httpProvider, jwtOptionsProvider) {
        var routeRoleChecks = {
            admin: {
                auth: function (authService) {
                    return authService.authorizeCurrentUserForRoute('admin');
                }
            },
            user: {
                auth: function (authService) {
                    return authService.authorizeAuthenticatedUserForRoute();
                }
            }
        }

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/dashboard/dashboard.html',
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'app/user/userProfile.html',
                resolve: routeRoleChecks.user
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'app/auth/signup.html',
            })
            .state('server', {
                url: '/server',
                templateUrl: 'app/dashboard/dashboard.html',
                resolve: routeRoleChecks.admin
            })
            .state('admin', {
                url: '/ssAdmin',
                templateUrl: 'app/admin/adminLogin.html',
                resolve: routeRoleChecks.admin
            })
            ;


        jwtOptionsProvider.config({
            tokenGetter: function () {
                return localStorage.getItem('access_token');
            },
            whiteListedDomains: ['localhost']
        });


        $httpProvider.interceptors.push('jwtInterceptor');
        $urlRouterProvider.otherwise('/');
        $locationProvider.hashPrefix('');

        // Comment out the line below to run the app
        // without HTML5 mode (will use hashes in routes)
        $locationProvider.html5Mode(true);

    });

    app.run(function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
            if (rejection === 'not authorized') {
                $location.path('/');
            }
        })
    })

})();
