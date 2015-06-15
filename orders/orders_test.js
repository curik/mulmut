
describe('myApp.orders', function() {
  beforeEach(module('myApp.orders'));

  describe('OrdersController', function() {
    var ordersCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        ordersCtrl = $controller('OrdersController', {$scope: $scope});
      });
    });
  });
});