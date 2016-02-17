(function(){
	
	var subcategoryModule = angular.module('simpletodolist-subcategory', ['simpletodolist-note','simpletodolist-category']);

	subcategoryModule.controller('SubCategoryController', function($scope) {
		this.subcategory = {} ;
		
		//create new subcategory(id generated automatically)
		//update scope with the new subcategory
		this.addSubcategory = function (category) {
			//get new subcategory from scope
			var newSubcategory = {
				id: $scope.indexLast[1] + 1, 
				position: category.subcategories.lenght + 1, 
				name: this.subcategory.name ,
				pending:  0,
				sortableOptions: $scope.createOptions(this.subcategory.name) ,
				notes: []
				};
			
			//add to data model
			category.subcategories.push(newSubcategory);
			$scope.showAdd[newSubcategory.name] = false;
			
			//log
			logEntry = "Subcategory '" +category.name+"'>'"
				+ this.subcategory.name +"' created  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			
			//increment Last SubCatecory Index
			$scope.indexLast[1]++;
			
			//Reset
			this.subcategory = {};
			this.logEntry = "";
		};
		
		this.deleteSubcategory = function(category,subcategory){
			
			logEntry = "Subcategory '" +category.name+"'>'"
				+ subcategory.name +"' has been deleted!  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			
			index = category.subcategories.indexOf(subcategory);
			category.subcategories.splice(index, 1);
			
			this.logEntry = "";//Reset.
		};
		
		
		});
	
	subcategoryModule.directive("addSubcategory", function(){
		return {
			restrict: 'E',
			templateUrl: 'todolist/subcategory/add-subcategory.html'
		};
	});

})();
	