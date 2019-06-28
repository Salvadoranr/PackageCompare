var myapp = angular.module('myapp', []);

myapp.controller('MainCtrl', function ($scope, $http) {

	$scope.csv_colum_delim = ";";
	$scope.csv_line_delim = "\n";
	$scope.reset = false;
	$scope.datos = [];// arreglo generado luego de la lectura de archivos 
	$scope.names = [];// arreglo generado luego de la lectura de archivos campo name del package
	$scope.nuevo = {};// mezcla de arreglos en datos
	$scope.dependencies = {};// guarda los dependencies de cada package
	$scope.outputCSV = [];
	$scope.counter=0;
	$scope.numfiles = [`file_${$scope.counter}`];

	$scope.showContent = function ($fileContent) {
		$scope.content = JSON.parse($fileContent);
		$scope.datos.push($scope.content.dependencies);
		$scope.names.push($scope.content.name);
		$scope.counter++
		$scope.numfiles.push(`file_${$scope.counter}`)
	};

	$scope.merge = function () {
		console.log('mezclando');
		for (let index = 0; index < $scope.datos.length; index++) {
			for (const key in $scope.datos[index]) {
				if (!$scope.nuevo.hasOwnProperty(key)) {
					$scope.nuevo[key] = "";
					$scope.dependencies[key] = {};
				}
				
			}

		}


	};
	$scope.resetear = function () {
		$scope.reset = true;
		$scope.datos = [];
		$scope.names = [];
		$scope.nuevo = {};
		$scope.dependencies = {};
		$scope.outputCSV = [];
		$scope.counter=0;
		$scope.numfiles = [$scope.counter];
	};
	$scope.versionar = function () {

		$scope.merge();
		for (let index = 0; index < $scope.datos.length; index++) {

			for (var key in $scope.datos[index]) {
				if ($scope.nuevo.hasOwnProperty(key)) {

					$scope.dependencies[key][`file_${index + 1}`] = $scope.datos[index][key];
				}

			}

		}

	};

	$scope.generarCSV = function () {
		var block = $scope.csv_colum_delim;
		for (var i = 0; i < $scope.names.length; i++) {
			block += $scope.names[i];
			block += $scope.csv_colum_delim;

		}
		var output = $scope.csv_colum_delim + "dependencies COMUNES" + block

		output += $scope.csv_line_delim;
		for (var key in $scope.dependencies) {

			output += $scope.csv_colum_delim;
			output += key;

			for (let index = 0; index < $scope.datos.length; index++) {
				output += $scope.csv_colum_delim;

				output += $scope.dependencies[key][`file_${index + 1}`] || "-";
			}
			output += $scope.csv_line_delim;
		}
		var encodedUri = encodeURI(output);
		var link = document.getElementById("linkcsv");
		var universalBOM = "\uFEFF"; // utf8 
		link.setAttribute("href", 'data:text/plain;charset=utf-8,' + universalBOM + encodedUri);
		link.setAttribute("download", "dependencies.csv");
		link.click();
	};

	$scope.showComponent = function (text) {
		console.log(text)
	}
});

myapp.directive('onInit', function ($parse) {

});

myapp.directive('onReadFile', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, element, attrs) {

			var fn = $parse(attrs.onReadFile);

			element.on('change', function (onChangeEvent) {
				var reader = new FileReader();

				reader.onload = function (onLoadEvent) {
					scope.$apply(function () {
						fn(scope, { $fileContent: onLoadEvent.target.result });

					});
				};

				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
});

