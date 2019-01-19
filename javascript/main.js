var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
    $scope.trader_id = "NONE";
    $scope.price = 20; 
	$scope.orders = []

	$scope.trade = () => {$scope.orders.push(
		{"price":$scope.price, "trader_id":$scope.trader_id})
		console.log($scope.orders);
	};
});

