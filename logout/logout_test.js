
describe('myApp.logout', function() {
  beforeEach(module('myApp.logout'));

  describe('LogoutController', function() {
    var logoutCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        logoutCtrl = $controller('LogoutController', {$scope: $scope});
      });
    });
  });
});