(function (angular) {
    "use strict";

    var app = angular.module('myApp.logout', ['ngRoute']);

    app.controller('LogoutCtrl', ['$scope', '$rootScope', 'logout', function($scope, $rootScope, logout) {
        logout.logout();
        $rootScope.profileMode = "";
    }]);

    app.factory("logout", [
        "$firebase",
        "$location",
        "FBURL",
        function($firebase, $location, FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.logout = function() {
                this.ref.unauth();
                $location.path("/home");
            };

            
            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/logout', {
            templateUrl: 'logout/logout.html',
            controller: 'LogoutCtrl'
        });
    }]);

})(angular);