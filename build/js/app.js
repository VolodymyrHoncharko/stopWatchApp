var app = angular.module('myApp', []);


app.controller('timerCtrl', ['$scope', '$interval', 'timerService', 'lStorage', '$timeout', function ($scope, $interval, timerService, lStorage, $timeout) {
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

	var lapTimer = function () {
		$scope.lapTime = timerService.split(timeStatus);
		$scope.startTime = timeStatus;
	};

	var startTime = lStorage.getData('startTime');

	if (startTime) {
		var pauseTime = lStorage.getData('pauseTime');
		var timeDiff;
		if (pauseTime) {
			timeDiff = Math.floor((pauseTime - startTime) / 10);
		} else {
			timeDiff = Math.floor(((+new Date) - startTime) / 10);
		}

		timeStatus = timeDiff;

		$scope.timeStatus = timerService.split(timeDiff);

		if (lStorage.getData('run')) {
			startTimer();
		}

	}

	// starts the timer
	$scope.startTimer = startTimer;

	function startTimer() {
		$scope.timerIsRunning = true;
		$scope.startTime = timeStatus;

		var start = document.getElementsByClassName('buttons_link')[0];
		var pause = document.getElementsByClassName('pause')[0];
		var status = lStorage.getData('run');

		if (lStorage.getData('lapTime')) {
			$scope.laps = lStorage.getData('lapTime');
		}

		start.style.display = 'none';
		pause.style.display = 'block';


		if (!status) {
			lStorage.saveData('run', true);
			lStorage.clearData('pauseTime');

		}

		if (!lStorage.getData('startTime')) {
			lStorage.saveData('startTime', +new Date);
		}


		// clear the interval
		if ($scope.timeRun) {
			$interval.cancel($scope.timeRun);
		}

		// updates the timer
		function timeUpdate() {
			if (!lStorage.getData('run')) {
				stopTimer();
			}
			timeStatus += 1;
			$scope.timeStatus = timerService.split(timeStatus);
		}

		// set the interval
		$scope.timeRun = $interval(timeUpdate, 10);
	}

	// stopes the timer
	$scope.stopTimer = stopTimer;


	function stopTimer() {
		var start = document.getElementsByClassName('buttons_link')[0];
		var pause = document.getElementsByClassName('pause')[0];
		start.style.display = 'block';
		pause.style.display = 'none';

		$scope.timerIsRunning = false;
		if ($scope.timeRun) {
			$interval.cancel($scope.timeRun);
			lapTimer();
			$scope.startTime = timeStatus;
			lStorage.saveData('pauseTime', +new Date);
			lStorage.saveData('run', false);
		}
	}

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
		lStorage.clearData('startTime');
		lStorage.clearData('lapTime')
	};

	// add the lap time
	$scope.lapAdd = function () {
		if ($scope.timerIsRunning) {
			lapTimer();
		}

		var lapTime = lStorage.getData('lapTime');
		if (lapTime) {
			$scope.laps = lapTime;
		}
		$scope.laps.push($scope.lapTime);

		lStorage.saveData('lapTime', $scope.laps);
	};

	// remove the lap
	$scope.lapRemove = function (idx) {
		$scope.laps.splice(idx, 1);
		lStorage.saveData('lapTime', $scope.laps);
	};

	$interval(function () {
		var laps = lStorage.getData('lapTime');

		if (!laps) {
			laps = [];
		}

		if ($scope.laps.length !== laps.length) {
			$scope.laps = laps;
		}
	}, 100);

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
		saveData: function (key, val) {
			var value = JSON.stringify(val);
			$window.localStorage.setItem(key, value);
			return this;
		},
		getData: function (key) {
			var value = $window.localStorage.getItem(key);
			return JSON.parse(value);
		},
		clearData: function (key) {
			return $window.localStorage.removeItem(key);
		}
	};
});
