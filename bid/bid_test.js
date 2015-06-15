
describe('myApp.bid', function() {
  beforeEach(module('myApp.bid'));

  describe('BidController', function() {
    var bidCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        bidCtrl = $controller('BidController', {$scope: $scope});
      });
    });
    /*
    it('creates messages array in scope', function() {
      expect(Object.prototype.toString.call($scope.messages)).toBe('[object Array]');
    });
    */
  });
});