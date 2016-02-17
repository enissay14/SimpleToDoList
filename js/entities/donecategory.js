(function(){
	var app = angular.module('done-category', []);
	
	app.controller('DoneController', function($scope) {
		
		this.deleteDoneNote = function(index){
			$scope.donelist.splice(index, 1);
		};
		
		this.numberNotesInDone = function() {
			return $scope.donelist.length;
		};
		
		this.clearDone = function() {
			$scope.donelist = [];
		};
	});
	
	app.directive("doneCategory", function(){
		return {
			restrict: 'E',
			templateUrl: 'todolist/category/done-category.html'
		};
	});
	
	
	
	
})();