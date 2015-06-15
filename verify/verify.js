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

        $scope.verifyOrder = function(status){
            console.log(status);
            $scope.request.update({status: status})
            var onComplete = function(error) {
                if (error) {
                    console.log('Synchronization failed');
                } else {
                    console.log('Synchronization succeeded');
                }
            }
        };
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

            var authData = factory.ref.getAuth();
            factory.vendorRef = factory.ref.child("vendors/" + authData.uid);
            //factory.vendorCurrentBalanceRef = factory.ref.child("vendorsInfo/" + authData.uid + "/balance/currentBalance");
            //factory.vendoradminsCountRef = factory.ref.child("vendorsInfo/" + authData.uid + "/metrics/adminsCount");

            /*
            factory.getBalance = function() {
                factory.vendorCurrentBalanceRef.on("value", function(snapshot) {
                    if(angular.isDefined(snapshot) && snapshot && snapshot.val() > 0) {
                        $rootScope.myBalance = snapshot.val();
                        return snapshot.val();
                    } else {
                        return 0;
                    }
                }, function (errorObject) {
                    console.log("Read failed: " + errorObject.code);
                });
            };

            factory.placeverify = function(admin, orderRef) {
                var self = this;
                var adminRef = factory.ref.child("orders/" + orderRef + "/admins");

                //TODO: error message of admins does not exist
                adminRef.push(admin);
                factory.vendorRef.child("admins").push(admin);
/*
                factory.vendoradminsCountRef.transaction(function (current_value) {
                    return (current_value || 0) + 1;
                });

                factory.vendorCurrentBalanceRef.transaction(function (current_value) {
                    return (current_value || 0) - 5000;
                });

                $location.path("/admin");
            };
            */

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/verify/:orderRef', {
            templateUrl: '/verify/verify.html',
            controller: 'VerifyCtrl'
        });
    }]);

})(angular);