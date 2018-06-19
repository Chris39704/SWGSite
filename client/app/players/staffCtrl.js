(function () {
    'use strict';
    var controllerId = 'staff';
    angular.module('app').controller(controllerId, ['common', 'datacontext', staff]);

    function staff(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        vm.content = {
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            title: 'Content',
            tracks: []
        };
        vm.discord = {
            title: 'SWGSource'
        };
        vm.staffBio = {
            interval: 5000,
            list: [{
                "imageSource": "DevHawk.jpg",
                // "firstName": "Cpt",
                "lastName": "Hawk",
                "bio": "Shadowfire EMU",
                "position": "Developer",
                "bioColor": "blue"
            }],
            // title: 'Top Rated Screenshots'
        };
        vm.news = {
            title: 'SWGSource 2.0',
            description: 'This webpage is brought to you by SWGSource NGE 2.0.'
        };
        vm.title = 'Dashboard';

        activate();

        function activate() {
            var promises = [];
            /*  log('Activated Dashboard View'); */
            common.activateController(promises, controllerId)
                .then(function () { });
        }

        /*  function getAttendeeCount() {
             return datacontext.getAttendeeCount().then(function(data) {
                 return vm.attendeeCount = data;
             });
         } */


        function setContentSort(prop) {
            vm.content.predicate = prop;
            vm.content.reverse = !vm.content.reverse;
        }

    }
})();