(function(){
	
	var categoryModule = angular.module('simpletodolist-category', ['simpletodolist-subcategory']);
	
	categoryModule.controller('CategoryController', function($scope) {
		
		this.category = {} ;
		this.logEntry = '';
		
		this.addCategory = function () {
			//create new category(id generated automatically)
			//update scope with the new category
			var newCategory = {
				id: $scope.indexLast[0] + 1, 
				position: $scope.todolist.length +1,
				name: this.category.name ,
				pending: 0, 
				sortableOptions: $scope.createOptionsCategory(this.category.name),
				subcategories: [] 
				};
				
			$scope.todolist.push(newCategory);
			$scope.showAdd[newCategory.name] = false;
			
			logEntry = "Category '"+ this.category.name +"' created  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
					
			$scope.indexLast[0]++;
			this.category = {};
			this.logEntry = "";//Reset.
		};
		
		this.deleteCategory = function(category){
		
			logEntry = "Category '"+ category.name +"' has been deleted!  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			this.logEntry = "";//Reset.
			
			index = $scope.todolist.indexOf(category);
			$scope.todolist.splice(index, 1);
			
			
		};
		
	});
	
	categoryModule.directive("addCategory", function(){
		return {
			restrict: 'E',
			templateUrl: 'todolist/category/add-category.html'
		};
	});
				
})();