
describe('myApp.thankyou', function() {
  beforeEach(module('myApp.thankyou'));

  describe('ThankYouCtrl', function() {
    var thankyouCtrl, $scope;
    beforeEach(function() {
      inject(function($controller) {
        $scope = {};
        thankyouCtrl = $controller('ThankYouCtrl', {$scope: $scope});
      });
    });
    /*
    it('creates messages array in scope', function() {
      expect(Object.prototype.toString.call($scope.messages)).toBe('[object Array]');
    });
    */
  });
});