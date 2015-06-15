
describe('myApp.order', function() {
  beforeEach(module('myApp.order'));

  describe('OrderController', function() {
    var orderCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        orderCtrl = $controller('OrderController', {$scope: $scope});
      });
    });
    /*
    it('creates messages array in scope', function() {
      expect(Object.prototype.toString.call($scope.messages)).toBe('[object Array]');
    });
    */
  });
});