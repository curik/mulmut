
describe('myApp.orderhistory', function() {
  beforeEach(module('myApp.orderhistory'));

  describe('OrderHistoryController', function() {
    var orderHistoryCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        orderHistoryCtrl = $controller('OrderHistoryController', {$scope: $scope});
      });
    });
  });
});