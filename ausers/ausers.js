(function (angular) {
    "use strict";

    var app = angular.module('myApp.ausers', ['ngRoute']);

    app.controller('AUsersCtrl', ['$scope', '$location', '$firebaseArray', "getUsers", function($scope, $location, $firebaseArray, getUsers) {
           
        $scope.requests = $firebaseArray(getUsers.ref);
        $scope.status = "Retrieving users ...";

        
        $scope.requests.$loaded().then(function() {
           if (angular.isUndefined($scope.requests) || $scope.requests.length === 0) {
               alert("No users found");
           }
        });

        $scope.goToOrder = function (orderRef) {
            $location.path("/verify/" + orderRef);
        };

        $scope.$on('$destroy', function () {
            $scope.requests.$destroy();
        });


    }]);

    app.filter("getNumQuotes", function(){
        return function(quotesObj, scope){
            var count = 0;
            var match = 0;

            angular.forEach(quotesObj, function(value, key) {
                count = count + 1;
                if (value.email === scope.profileEmail) {
                    match = match + 1;
                }
            });

            if (match >= 1) {
                return count + " ✓";
            } else {
                return count;
            }
            /*
            if (angular.isDefined(quotesObj)) {
                return (Object.keys(quotesObj).length);
            } else {
                return 0;
            }
            */
        }
    });

    app.factory("getUsers", [
        "FBURL",
        function(FBURL) {
            var factory = {};
            factory.ref = new Firebase(FBURL + "/users");
            
            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/ausers', {
            templateUrl: 'ausers/ausers.html',
            controller: 'AUsersCtrl'
        });
    }]);

})(angular);