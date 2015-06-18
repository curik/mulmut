"use strict";
angular.module('myApp.login', ['firebase.utils', 'firebase.auth', 'ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html'
    });
  }])

  .controller('LoginCtrl', ['$scope', '$window','$rootScope', 'Auth', '$location', '$routeParams', 'fbutil',
      function($scope, $window, $rootScope, Auth, $location, $routeParams, fbutil) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;
    $scope.loginButtonDisabled = false;
    $scope.createButtonDisabled = false;

    $scope.facebookLogin = function() {

        Auth.$authWithOAuthPopup("facebook", {scope: "email"}).then(function(authData) {
            var ref = fbutil.ref('users', authData.uid);
            ref.once('value', function(dataSnapshot) {
                var profile = dataSnapshot.val();

                if (!profile || angular.isUndefined(profile) || angular.isUndefined(profile.mode)) {
                    var mode = "customer";
                    ref.set({email: authData.facebook.email, name: authData.facebook.displayName, phone: "", mode: mode, companyName: ""}, function(err) {
                        $rootScope.profileMode = mode;
                        $rootScope.profileName = authData.facebook.displayName;
                        $rootScope.profileEmail = authData.facebook.email;
                        $rootScope.$apply(function() {
                            $location.path("/order");
                        });
                    });
                } else {
                    $rootScope.profileMode = profile.mode;
                    $rootScope.profileName = profile.name;
                    $rootScope.profileEmail = profile.email;
                    $rootScope.$apply(function() {
                        //always customer mode
                        $location.path("/orderhistory");
                    });
                }
            });
        }).catch(function(error) {
            //console.log("Authentication failed:", error);
            $scope.err = "Facebook Authentication failed" + error;
        });


    }

    $scope.login = function(email, pass) {
      $scope.loginButtonDisabled = true;
      $scope.err = null;
      $scope.info = null;
      Auth.$authWithPassword({ email: email, password: pass })
        .then(function(user) {
              var ref = fbutil.ref('users', user.uid);
              ref.once('value', function(dataSnapshot) {
                  var profile = dataSnapshot.val();
                  $rootScope.profileMode = profile.mode;
                  $rootScope.profileName = profile.name;
                  $rootScope.profileEmail = profile.email;
                  $rootScope.profilePhone = profile.phone;

                  //$location.path('/order');
                  $rootScope.$apply(function() {
                      if(profile.mode === 'vendor') {
                          $window.sessionStorage.vendorId = user.uid;
                          $location.path("/bidboard");
                      } else if(profile.mode === 'admin') {
                          $location.path("/aorders");
                      } else {
                          $location.path("/orderhistory");

                      }
                  });
              });
        }, function(err) {
          $scope.err = errMessage(err);
          $scope.loginButtonDisabled = false;
        });
    };

    $scope.resetPassword = function(email) {
        $scope.err = null;
        $scope.info = null;
        Auth.$resetPassword({ email: email })
            .then(function(/* user */) {
                $scope.info = "A temporary password will be sent momentarily to " + email;
            }, function(err) {
                $scope.err = errMessage(err);
            });
    };

    $scope.createAccount = function() {
      $scope.createButtonDisabled = false;
      $scope.err = null;
      $scope.info = null;
      if( assertValidAccountProps() ) {
        var email = $scope.email;
        var pass = $scope.pass;
        var name = $scope.name;
        var phone = $scope.phone;
        var companyName = $scope.companyName;
        var counter = 0; // stores the # of orders made by this user
        var mode = "customer"; //user or vendor
        // create user credentials in Firebase auth system
        Auth.$createUser({email: email, password: pass})
          .then(function() {
            // authenticate so we have permission to write to Firebase
            return Auth.$authWithPassword({ email: email, password: pass });
          })
          .then(function(user) {
            // create a user profile in our data store
            var ref = fbutil.ref('users', user.uid);
            return fbutil.handler(function(cb) {
              ref.set({email: email, name: name||firstPartOfEmail(email), counter: counter, phone: phone, mode: mode, companyName: companyName||""}, cb);
            });
          })
          .then(function(/* user */) {
            // redirect
                $rootScope.profileMode = mode;
                $rootScope.profileName = name;
                $rootScope.profileEmail = email;
                if(mode === 'vendor') {
                    $location.path("/bidboard");
                } else {
                    $location.path("/orderhistory");
                }
                /*
                if (angular.isDefined($routeParams.redir) &&  $routeParams.redir.length > 0) {
                    $location.path('/' + $routeParams.redir);
                } else {
                    $location.path('/home');
                }
                */
          }, function(err) {
                $scope.err = errMessage(err);
                //$scope.createButtonDisabled = false;
          });
      }
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else if( $scope.createMode && !$scope.name) {
          $scope.err = 'Need a name';
      }
      else if( $scope.createMode && !$scope.phone) {
          $scope.err = 'Need a phone number';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }

    function firstPartOfEmail(email) {
      return ucfirst(email.substr(0, email.indexOf('@'))||'');
    }

    function ucfirst (str) {
      // inspired by: http://kevin.vanzonneveld.net
      str += '';
      var f = str.charAt(0).toUpperCase();
      return f + str.substr(1);
    }
  }]);

