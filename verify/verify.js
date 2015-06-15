(function (angular) {
    "use strict";

    var app = angular.module('myApp.verify', ['ngRoute']);

    //Order status: new -> verified -> verifyding -> closed

    app.controller('VerifyCtrl', ['$scope', '$routeParams', '$firebaseObject', '$filter', 'user', 'verify', function($scope, $routeParams, $firebaseObject, $filter, user, verify) {
        $scope.admin = {};
        //$scope.admin.email = $scope.profileEmail;
        //$scope.admin.baseRateUnit = "Day";
        var orderRef =  $routeParams.orderRef;
        $scope.request = $firebaseObject(verify.ordersRef.child(orderRef));
        //$scope.vendor = $firebaseObject(verify.vendorRef);
        //$scope.vehicles = {};
        //$scope.balance = $firebaseObject(verify.vendorCurrentBalanceRef);

        /*$scope.vendor.$loaded().then(function() {
            if (angular.isDefined($scope.request.vehicleCategory) && angular.isDefined($scope.vendor.vehicles)) {
                $scope.vehicles = $scope.vendor.vehicles[$scope.request.vehicleCategory];
            }
            $scope.admin.company = $scope.vendor.companyName;
            $scope.admin.phone = $scope.vendor.pPhone;
            $scope.admin.contactPerson = $scope.vendor.contactPerson;
        });*/
        $scope.$watch('profileEmail', function() {
            $scope.admin.email = $scope.profileEmail;
            $scope.admin.name = $scope.profileName;
            $scope.admin.phone = $scope.profilePhone;

        });

        
        /*
        $scope.$watch('profileEmail', function() {
            $scope.admin.email = $scope.profileEmail;
            $scope.request.$loaded().then(function() {
                angular.forEach($scope.request.admins, function(value, key) {
                    if (value.email === $scope.profileEmail) {
                        $scope.myadmin = value;
                    }
                });
            });
        });
        /*
        $scope.request.$loaded().then(function() {
            if (angular.isDefined($scope.vendor.vehicles)) {
                $scope.vehicles = $scope.vendor.vehicles[$scope.request.vehicleCategory];
            }
            $scope.admin.driver = $scope.request.driver;

            angular.forEach($scope.request.admins, function(value, key) {
                if (value.email === $scope.profileEmail) {
                    $scope.myadmin = value;
                }
            });

        });

        $scope.balance.$loaded().then(function() {
            $scope.myBalance = $scope.balance.$value || 0;
        });

        $scope.isEnoughBalance = function() {
            return ($scope.myBalance > 5000);
        }
        */

        $scope.verifyOrder = function(){
            verify.verifyOrder($scope.admin.orderStatus,orderRef);

        };

        $scope.$on('$destroy', function () {
            $scope.request.$destroy();
            //$scope.vendor.$destroy();
            //$scope.balance.$destroy();
        });
    }]);

    app.factory("verify", [
        "$firebase",
        "$location",
        "$rootScope",
        "FBURL",
        function($firebase, $location, $rootScope, FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.ordersRef = factory.ref.child("orders");
            
            factory.verifyOrder = function(newstatus,orderRef){
                alert("Order " + newstatus);
                factory.orderRef = factory.ref.child("orders/" + orderRef);
                factory.orderRef.update({status : newstatus});
            };

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/verify/:orderRef', {
            templateUrl: 'verify/verify.html',
            controller: 'VerifyCtrl'
        });
    }]);

})(angular);