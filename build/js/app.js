var app = angular.module('myApp', []);

app.controller('timerCtrl', ['$scope', '$interval', 'timerService', 'lStorage', function ($scope, $interval, timerService, lStorage) {
	'use strict';
	$scope.timerIsRunning = false;
	$scope.startTime = 0;
	$scope.lapTime = 0;
	$scope.laps = lStorage.getData() ? lStorage.getData() : []; // [];
	$scope.timeStatus = $scope.laps[$scope.laps.length - 1] || {
			minutes: '00',
			seconds: '00',
			ms: '00'
		};
	var timeStatus = 100 * (60 * parseInt($scope.timeStatus.minutes)
										+ parseInt($scope.timeStatus.seconds))
										+ parseInt($scope.timeStatus.ms);

	// remove the lap
	$scope.saveToLocalStorage = function () {
		lStorage.saveData($scope.laps);
	};

	var lapTimer = function () {
		$scope.lapTime = timerService.split(timeStatus);
		$scope.startTime = timeStatus;
	};

	// starts the timer
	$scope.startTimer = function () {
		$scope.timerIsRunning = true;
		$scope.startTime = timeStatus;

		var start = document.getElementsByClassName('buttons_link')[0];
		var pause = document.getElementsByClassName('pause')[0];
		start.style.display = 'none';
		pause.style.display = 'block';



		// clear the interval
		if ($scope.timeRun) {
			$interval.cancel($scope.timeRun);
		}

		// updates the timer
		$scope.timeUpdate = function () {
			timeStatus += 1;
			$scope.timeStatus = timerService.split(timeStatus);
		};
		// set the interval
		$scope.timeRun = $interval($scope.timeUpdate, 10);
	};

	// stopes the timer
	$scope.stopTimer = function () {
		var start = document.getElementsByClassName('buttons_link')[0];
		var pause = document.getElementsByClassName('pause')[0];
		start.style.display = 'block';
		pause.style.display = 'none';

		$scope.timerIsRunning = false;
		if ($scope.timeRun) {
			$interval.cancel($scope.timeRun);
			lapTimer();
			$scope.startTime = timeStatus;
		}
	};

	// resets the timer
	$scope.resetTimer = function () {
		timeStatus = 0;
		// clears the laps array
		$scope.laps = [];
		$interval.cancel($scope.timeRun);
		// resets the view
		$scope.timeStatus.minutes = '00';
		$scope.timeStatus.seconds = '00';
		$scope.timeStatus.ms = '00';
		// clears the local storage
		lStorage.clearData();
	};

	// add the lap time
	$scope.lapAdd = function () {
		if ($scope.timerIsRunning) {
			lapTimer();
		}
		$scope.laps.push($scope.lapTime);
		$scope.saveToLocalStorage();
	};

	// remove the lap
	$scope.lapRemove = function (idx) {
		$scope.laps.splice(idx, 1);
		$scope.saveToLocalStorage();
	};

}]);

// service that split the time into minutes, seconds and milliseconds and returns an object
app.factory('timerService', function () {
	'use strict';
	return {
		split: function (time) {
			var result = {
				ms: time % 100,
				seconds: Math.floor(time / 100) % 60,
				minutes: Math.floor(time / 6000)
			};

			if (result.minutes < 10) {
				result.minutes = '0' + result.minutes;
			}

			if (result.seconds < 10) {
				result.seconds = '0' + result.seconds;
			}

			if (result.ms < 10) {
				result.ms = '0' + result.ms;
			}

			return result;
		}
	};
});

// local storage services
app.factory('lStorage', function ($window, $rootScope) {
	'use strict';
	angular.element($window).on('storage', function (event) {
		if (event.key === 'laps_timer') {
			$rootScope.$apply();
		}
	});

	return {
		saveData: function (val) {
			var value = JSON.stringify(val);
			$window.localStorage.setItem('laps_timer', value);
			return this;
		},
		getData: function () {
			var value = $window.localStorage.getItem('laps_timer');
			return JSON.parse(value);
		},
		clearData: function () {
			return $window.localStorage.removeItem('laps_timer');
		}
	};
});