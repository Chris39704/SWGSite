(function () {

    'use strict';

    angular
        .module('app')
        .directive('navbar', navbar);

    function navbar() {
        return {
            templateUrl: 'app/layout/sidebar.html'
        }
    }

    navbarController.$inject = ['$scope', 'authService', '$timeout'];

    function navbarController($scope, authService, $timeout) {

        var vm = this;
        vm.auth = authService;


    }
})();