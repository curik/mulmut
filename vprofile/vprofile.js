(function (angular) {
  "use strict";

  var app = angular.module('myApp.vprofile', ['firebase', 'firebase.utils', 'firebase.auth', 'ngRoute']);

  app.controller('VProfileCtrl', ['$scope', '$rootScope','Auth', 'fbutil', 'user', '$location', '$firebaseObject',
    function($scope, $rootScope, Auth, fbutil, user, $location, $firebaseObject) {
        $scope.mode = "profile"; //profile or settings
        $scope.newVehicle = {};

      var unbind;
      // create a 3-way binding with the user profile object in Firebase
      //var vprofile = $firebaseObject(fbutil.ref('vendors', user.uid));
      var vprofile = $firebaseObject(fbutil.ref('vendors', $rootScope.vendorId));
      var hatchbackRef = fbutil.ref('vendors/' + user.uid + "/vehicles/Hatchback");
      var sedanRef = fbutil.ref('vendors/' + user.uid + "/vehicles/Sedan");
      var mpvRef = fbutil.ref('vendors/' + user.uid + "/vehicles/MPV");
      var suvRef = fbutil.ref('vendors/' + user.uid + "/vehicles/SUV");
      var busRef = fbutil.ref('vendors/' + user.uid + "/vehicles/Minibus");

      vprofile.$bindTo($scope, 'vprofile').then(function(ub) {
          unbind = ub;
      });
        

        $scope.addVehicle = function() {
            if(angular.isDefined($scope.newVehicle.vehicleCategory) && angular.isDefined($scope.newVehicle.vehicleMake) && angular.isDefined($scope.newVehicle.vehicleType) && angular.isDefined($scope.newVehicle.vehicleYear) && angular.isDefined($scope.newVehicle.transmission)) {
                $scope.newVehicle.string = $scope.newVehicle.vehicleMake + " " + $scope.newVehicle.vehicleType + " " + $scope.newVehicle.vehicleYear + " " + $scope.newVehicle.transmission;
                if ($scope.newVehicle.vehicleCategory === "Hatchback") {
                    hatchbackRef.push($scope.newVehicle);
                    $scope.newVehicle = {};
                } else if ($scope.newVehicle.vehicleCategory === "Sedan") {
                    sedanRef.push($scope.newVehicle);
                    $scope.newVehicle = {};
                } else if ($scope.newVehicle.vehicleCategory === "MPV") {
                    mpvRef.push($scope.newVehicle);
                    $scope.newVehicle = {};
                } else if ($scope.newVehicle.vehicleCategory === "SUV") {
                    suvRef.push($scope.newVehicle);
                    $scope.newVehicle = {};
                } else if ($scope.newVehicle.vehicleCategory === "Minibus") {
                    busRef.push($scope.newVehicle);
                    $scope.newVehicle = {};
                }
            }
        };

        $scope.removeVehicle = function(vCategory, key) {
            if (vCategory === "Hatchback") {
                hatchbackRef.child(key).remove();
            } else if (vCategory === "Sedan") {
                sedanRef.child(key).remove();
            } else if (vCategory === "MPV") {
                mpvRef.child(key).remove();
            } else if (vCategory === "SUV") {
                suvRef.child(key).remove();
            } else if (vCategory === "Minibus") {
                busRef.child(key).remove();
            }
        };


      $scope.$on('$destroy', function () {
          if( unbind ) { unbind(); }
          vprofile.$destroy();
      });
    }
  ]);

  app.config(['$routeProvider', function($routeProvider) {
    // require user to be authenticated before they can access this page
    // this is handled by the .whenAuthenticated method declared in
    // components/router/router.js
    $routeProvider.whenAuthenticated('/vprofile', {
      templateUrl: 'vprofile/vprofile.html',
      controller: 'VProfileCtrl'
    })
  }]);

})(angular);