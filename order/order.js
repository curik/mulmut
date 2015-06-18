(function (angular) {
    "use strict";

    var app = angular.module('myApp.order', ['ngRoute', 'ui.bootstrap.datetimepicker']);

    app.controller('OrderCtrl', ['$scope', '$filter', 'user', 'order', function($scope, $filter, user, order) {
        $scope.order = {};

        var getEstimatedRateString = function(vt, vc, d) {
            if (angular.isDefined($scope.estimatedRateObj) && vt && vc && d) {
                var quoteLow = $scope.estimatedRateObj[vt][vc][d].low;
                var quoteHigh = $scope.estimatedRateObj[vt][vc][d].high;
                var carSample = $scope.estimatedRateObj[vt][vc].sample;
                var combinedString = "Estimated rate: " + $filter('currency')(quoteLow, "Rp ", 0) + "-" + $filter('currency')(quoteHigh, "Rp ", 0) + "\n\nSample Vehicles:\n" + carSample;
                return combinedString;
            } else {
                return "";
            }
        }

        order.estimatedRateRef.on("value", function(snapshot) {
            $scope.estimatedRateObj = snapshot.val();
            $scope.estimatedRate = getEstimatedRateString( $scope.order.vehicleCategory, $scope.order.vehicleClass, $scope.order.driver);
        }, function (errorObject) {
            console.log("Read failed: " + errorObject.code);
        });


        //Apply default values

        $scope.order.status = "new";

        $scope.order.uid = user.uid;
       
        if (user.provider === "facebook") {
            $scope.order.name = user.facebook.displayName;
        } else {
            if (user.password && angular.isDefined(user.password.email)) {
                $scope.order.email = user.password.email;
            }
        }

        $scope.order.driver = "withDriver";
        $scope.order.vehicleCategory = "Hatchback";
        $scope.order.vehicleClass = "Standard";
        $scope.order.location = "Jakarta";
        $scope.order.rentDurationUnit = "Day";
        
        $scope.$watch('profileEmail', function() {
            $scope.order.email = $scope.profileEmail;
            $scope.order.name = $scope.profileName;
            $scope.order.phone = $scope.profilePhone;
        });

        $scope.updateDurationHours = function() {
            if ($scope.order.rentDurationUnit === "Hour") {
                $scope.order.rentDurationHours = $scope.order.rentDuration;
            } else if ($scope.order.rentDurationUnit === "Day") {
                $scope.order.rentDurationHours = $scope.order.rentDuration * 24;
            } else if ($scope.order.rentDurationUnit === "Week") {
                $scope.order.rentDurationHours = $scope.order.rentDuration * 24 * 7;
            }
        };

        $scope.updateDuration = function() {
            $scope.order.rentDuration = Math.ceil($scope.order.rentDuration);
        };

        $scope.updatePhoneNumber = function() {
            $scope.order.phone = $scope.order.phone.replace(/[\D]/g,'');
        };

        $scope.hidePremiumButton = function() {
            var hide =  ($scope.order.vehicleCategory === 'Hatchback') || ($scope.order.vehicleCategory === 'Minibus');

            //Also update info
            $scope.estimatedRate = getEstimatedRateString( $scope.order.vehicleCategory, $scope.order.vehicleClass, $scope.order.driver);

            if (hide) {
                $scope.order.vehicleClass = "Standard";
            }
            return hide;
        };

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var today = new Date();
            var threshold = new Date(today);
            threshold.setDate(today.getDate() - 1);
            var thresholdValue = threshold.getTime();
            angular.forEach($dates, function(value,key){
                if (value.utcDateValue < thresholdValue) {
                    value.selectable = false;
                }
            });
        }
        $scope.placeOrder = function() {
            /*
             var authData = order.ref.getAuth();

             if (authData) {
                console.log("User " + authData.uid + " is logged in with " + authData.provider);
             } else {
                console.log("User is logged out");
             }
             */

            if ($scope.order.name.toLowerCase() === "testing") {
                $scope.order.status = "test";
            }

            $scope.updateDurationHours();
            $scope.order.orderTime = (new Date()).toLocaleString();
            
            if(angular.isDefined($scope.order.when)) {
                $scope.order.reservationStartTimestamp = $scope.order.when.getTime();
                $scope.order.reservationStartTime = $scope.order.when.toLocaleString();
                $scope.order.reservationEndTimestamp = $scope.order.reservationStartTimestamp + ($scope.order.rentDurationHours * 3600000);
                $scope.order.reservationEndTime = (new Date($scope.order.reservationEndTimestamp)).toLocaleString();
            }

            //console.log(JSON.stringify($scope.order));
            order.placeOrder($scope.order);
        };
    }]);

    app.factory("order", [
        "$firebase",
        "$location",
        "$rootScope",
        "FBURL",
        function($firebase, $location, $rootScope, FBURL) {
            var factory = {};

            factory.ref = new Firebase(FBURL);
            factory.ordersRef = factory.ref.child("orders");
            factory.estimatedRateRef = factory.ref.child("estimatedRate");
            factory.orderIdRef = factory.ref.child("currentorderid");

            var authData = factory.ref.getAuth();
            factory.userOrdersRef = factory.ref.child("users/" + authData.uid + "/orders");

            //update the counter in the user's profile
            factory.userCounterRef = factory.ref.child("users/" + authData.uid + "/counter");
            factory.userCounterRef.transaction(function(counter){
                return counter+1;
            }); 
            
            factory.placeOrder = function(order) {
                var orderId = 0;
                var self = this;
                this.orderIdRef.transaction(function (current_value) {
                    orderId = (current_value || 0) + 1;
                    order.orderId = orderId;
                    order.timestamp = Firebase.ServerValue.TIMESTAMP;

                    if (order.whereTo === "withinCity") {
                        order.whereToArea = "";
                    }
                    
                    
                    if (orderId > 1000) {
                        var ref = self.ordersRef.push(order);
                        //console.dir(ref);
                        self.userOrdersRef.push({"orderRef": ref.key(), "orderId": order.orderId, 
                            "whereToArea": order.whereToArea, "whereTo": order.whereTo, 
                            "orderTime": order.orderTime, "location": order.location, 
                            "vehicleCategory": order.vehicleCategory, "vehicleClass": order.vehicleClass, 
                            "reservationStartTime": order.reservationStartTime, "rentDuration": order.rentDuration, 
                        });

                        $rootScope.$apply(function() {
                            //$location.path("/thankyou/" + orderId);
                            $location.path("/orderhistory");
                        });
                    }
                    return orderId;
                });
            }

            return factory;
        }
    ]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.whenAuthenticated('/order', {
            templateUrl: 'order/order.html',
            controller: 'OrderCtrl'
        });
    }]);

})(angular);