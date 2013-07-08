var app = angular.module('mtg-expected-value', []);

app.directive('numeric', function() {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, elem, attr, ngModelCtrl) {
			ngModelCtrl.$parsers.push(function(inputValue) {
				var parsed = parseFloat(inputValue, 10);
				if (isNaN(parsed)) { return 0; }
				return parsed;
			});
		}
	};
});

var tourneyCtrl = function($scope) {

	$scope.packSettings = packSettings;
	$scope.formats = mtgFormats(packSettings);
	$scope.format = $scope.formats[0];

	var formatIndex = 0;

	$scope.playerSettings = {
		minElo: 100,
		myElo: 1600,
		meanElo: 1600,
		stddevElo: 100
	};

	$scope.iterations = 1000;

	$scope.$watch('format', function() {
		formatIndex = $scope.formats.indexOf($scope.format);
		recalculate();
	});

	$scope.$watch('iterations', function() {
		recalculate();
	});

	$scope.$watch('playerSettings', function() {
		recalculate();
	}, true);

	$scope.$watch('packSettings', function() {
		recalculate();
	}, true);

	var recalculate = function() {

		var formats = mtgFormats($scope.packSettings);
		var format = formats[formatIndex];
		var iterations = $scope.iterations;
		var playerSettings = $scope.playerSettings;

		var totalValue = 0;

		for (var i=0;i<iterations;i++) {
			var players = tournament(playerSettings, format);
			for (var j=0;j<players.length;j++) {
				if (players[j].name === 'me') {
					totalValue += format.prizes[players[j].score];
				}
			}
		}

		console.log(totalValue);

		$scope.expectedValue = (totalValue - iterations*(format.entryFee - format.totalPackValue))/iterations;
	};

	recalculate();
};
