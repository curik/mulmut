
describe('myApp.bidboard', function() {
  beforeEach(module('myApp.bidboard'));

  describe('BidBoardController', function() {
    var bidBoardCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        bidBoardCtrl = $controller('BidBoardController', {$scope: $scope});
      });
    });
  });
});