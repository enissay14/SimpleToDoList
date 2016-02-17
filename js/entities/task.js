(function(){
	
	var eventModule = angular.module('simpletodolist-task', ['repositories']);
	
	eventModule.controller('TaskController', function($scope,TaskRepository) {
		
		this.task = {} ;
		this.logEntry = '';
		
		this.addTask = function () {
			
			var newTask = {
				id: $scope.indexLast[2] + 1, 
				_id: $scope.indexLast[2] + 1,
				title: this.task.title,
				place: this.task.place,
				description: this.task.description,
				start: $scope.ngDialogData 
				};
			
			$scope.tasks.push(newTask);
			$scope.taskEvents.push(newTask);
			
			logEntry = "Task '"+ this.task.title +"' created  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			
			/*2 way Sync Google		
			var end = $scope.ngDialogData;
			var end.setHours($scope.ngDialogData.getHours()+1);
			add_event_gcal(this.task.title,$scope.ngDialogData.format(),end.format(),place,this.task.description);  
			*/
			
			$scope.indexLast[2]++;
			this.task = {};
			this.logEntry = "";//Reset.
			
			$scope.closeThisDialog();
		};
		
		this.updateTask = function () {
			
			task = TaskRepository.findTaskById($scope.tasks,$scope.ngDialogData.id);
			
			logEntry = "Task updated from '"+ $scope.ngDialogData.title +"'"
					+" to '"+ this.task.title +"'  <br> ["+$scope.date()+"] ";
					
			$scope.sortinglog.push(logEntry);
			
			$scope.ngDialogData.title = this.task.title;
			$scope.ngDialogData.description = this.task.description;
			$('#calendar').fullCalendar('updateEvent', $scope.ngDialogData);
			
			task.title = this.task.title;
			task.description = this.task.description;

			this.task = {};
			$scope.closeThisDialog();
		};
		
		this.deleteTask = function() {
			
			task = $scope.ngDialogData ;
			
			logEntry = "Task '"+ task.title +"' has been deleted!  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			this.logEntry = "";//Reset.
			
			index = $scope.tasks.indexOf(task);
			jQuery("#calendar").fullCalendar( 'removeEvents', task.id );
			$scope.tasks.splice(index, 1);
			
			$scope.closeThisDialog();
		};
			
	});
	
// 	categoryModule.directive("addCategory", function(){
// 		return {
// 			restrict: 'E',
// 			templateUrl: 'todolist/category/add-category.html'
// 		};
// 	});
				
})();