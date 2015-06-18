(function (angular) {
    "use strict";

    var app = angular.module('myApp.bid', ['ngRoute']);

    //Order status: new -> verified -> bidding -> closed

    app.controller('BidCtrl', ['$scope', '$routeParams', '$firebaseObject', '$filter', 'user', 'bid', function($scope, $routeParams, $firebaseObject, $filter, user, bid) {
        $scope.quote = {};
        $scope.quote.email = $scope.profileEmail;
        $scope.quote.baseRateUnit = "Day";
        var orderRef =  $routeParams.orderRef;
        $scope.request = $firebaseObject(bid.ordersRef.child(orderRef));
        $scope.vendor = $firebaseObject(bid.vendorRef);
        $scope.vehicles = {};
        $scope.balance = $firebaseObject(bid.vendorCurrentBalanceRef);



        $scope.vendor.$loaded().then(function() {
            if (angular.isDefined($scope.request.vehicleCategory) && angular.isDefined($scope.vendor.vehicles)) {
                $scope.vehicles = $scope.vendor.vehicles[$scope.request.vehicleCategory];
            }
            $scope.quote.company = $scope.vendor.companyName;
            $scope.quote.phone = $scope.vendor.pPhone;
            $scope.quote.contactPerson = $scope.vendor.contactPerson;

        });

        $scope.$watch('profileEmail', function() {
            $scope.quote.email = $scope.profileEmail;
            $scope.request.$loaded().then(function() {
                angular.forEach($scope.request.quotes, function(value, key) {
                    if (value.email === $scope.profileEmail) {
                        $scope.myQuote = value;
                    }
                });
            });
        });

        $scope.request.$loaded().then(function() {
            if (angular.isDefined($scope.vendor.vehicles)) {
                $scope.vehicles = $scope.vendor.vehicles[$scope.request.vehicleCategory];
            }
            $scope.quote.driver = $scope.request.driver;

            angular.forEach($scope.request.quotes, function(value, key) {
                if (value.email === $scope.profileEmail) {
                    $scope.myQuote = value;
                }
            });

        });

        $scope.balance.$loaded().then(function() {
            $scope.myBalance = $scope.balance.$value || 0;
        });

        $scope.isEnoughBalance = function() {
            return ($scope.myBalance > -5000);
        }

        // put vehicle data into variable quote when a vendor selects a car
        $scope.updateCarData = function() {       
            var carReference = $scope.quote.carReference;
            $scope.quote.vehicleCategory = $scope.vehicles[carReference].vehicleCategory;
            $scope.quote.vehicleMake = $scope.vehicles[carReference].vehicleMake;
            $scope.quote.vehicleType = $scope.vehicles[carReference].vehicleType;
            $scope.quote.vehicleYear = $scope.vehicles[carReference].vehicleYear;
            $scope.quote.transmission = $scope.vehicles[carReference].transmission;
            $scope.quote.vehicleString = $scope.vehicles[carReference].string;
            $scope.quote.baseRate = $scope.vehicles[carReference].dalkotRate;
            $scope.quote.baseTotal = $scope.quote.baseRate * $scope.request.rentDuration;
            $scope.quote.duration = $scope.vehicles[carReference].duration;

        }

        $scope.updatePhoneNumber = function() {
            $scope.quote.phone = $scope.quote.phone.replace(/[\D]/g,'');
        };

        $scope.placeBid = function() {
            $scope.quote.quoteTime = (new Date()).toLocaleString();
            $scope.quote.quoteTimestamp = (new Date()).getTime();
            $scope.quote.website = $scope.vendor.website;
            $scope.quote.companyProfile = $scope.vendor.companyProfile;
            $scope.quote.terms = $scope.vendor.advanced.terms;

            if ($scope.quote.driver === 'withDriver') {
                if (angular.isDefined($scope.vendor.advanced)) {
                    $scope.quote.driverHourlyOvertime = $scope.vendor.advanced.driverHourlyOvertime || 0;
                    $scope.quote.driverDailyAllowance = $scope.vendor.advanced.driverDailyAllowance || 0;
                }
            }

            //console.log(JSON.stringify($scope.quote));
            bid.placeBid($scope.quote, orderRef);
        };

        $scope.$on('$destroy', function () {
            $scope.request.$destroy();
            $scope.vendor.$destroy();
            $scope.balance.$destroy();
        });
    }]);

    app.factory("bid", [
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
            factory.vendorCurrentBalanceRef = factory.ref.child("vendorsInfo/" + authData.uid + "/balance/currentBalance");
            factory.vendorQuotesCountRef = factory.ref.child("vendorsInfo/" + authData.uid + "/metrics/quotesCount");

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

            factory.placeBid = function(quote, orderRef) {
                var self = this;
                var quoteRef = factory.ref.child("orders/" + orderRef + "/quotes");

                //TODO: error message of quotes does not exist
                quoteRef.push(quote);
                factory.vendorRef.child("quotes").push(quote);
/*
                factory.vendorQuotesCountRef.transaction(function (current_value) {
                    return (current_value || 0) + 1;
                });
*/
                factory.vendorCurrentBalanceRef.transaction(function (current_value) {
                    return (current_value || 0) - 5000;
                });

                $location.path("/bidboard");
            };


            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/bid/:orderRef', {
            templateUrl: 'bid/bid.html',
            controller: 'BidCtrl'
        });
    }]);

})(angular);