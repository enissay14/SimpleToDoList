(function(){
	
	var noteModule = angular.module('simpletodolist-note', ['repositories']);
	
	noteModule.controller('NoteController', function($scope,TodolistRepository) {
		this.note = {} ;
		this.miniGoal = {};
		this.done = false ;
		//create new note (id generated automatically)
		//update scope with the new note
		
		this.addNote = function (category,subCategory) {
			if (!this.note.start) {
				alert("Please define a dead line for the '"+this.note.title+"' first!");
			}else{

				var newNote =  {	
					id: $scope.indexLast[2] + 1,
					_id: $scope.indexLast[2] + 1,
					title: this.note.title,
					start: this.note.start,
					pending: true,
					miniGoals: []
					};
					
				
				newNote.start.setHours(23);
				
				subCategory.notes.push(newNote);
				$scope.noteEvents.push(newNote);
				
				subCategory.pending++;
				category.pending++;
				
				logEntry = "Note '" +category.name+"'>'"
					+ subCategory.name +"'>'"
					+ this.note.title +"' created  <br> ["+$scope.date()+"] ";
				$scope.sortinglog.push(logEntry);
				
				//Reset
				$scope.indexLast[2]++;
				this.note = {};
			}
			
		};
		
		this.addMiniGoal = function() {
			if (!this.miniGoal.title) {
				alert("Please define Mini Goal first!");
			}else{
				note = TodolistRepository.findNoteById($scope.todolist,$scope.ngDialogData.id);
				var miniGoal = {
					id: $scope.indexLast[3] + 1,
					title : this.miniGoal.title,
					checked : false
				};
				note.miniGoals.push(miniGoal);
				
				$scope.indexLast[3]++;
				this.miniGoal.title = '';
			}
		};
		
		this.deleteMiniGoal = function(todolist,miniGoal) {
			note = TodolistRepository.findNoteById(todolist,$scope.ngDialogData.id);
			index = note.miniGoals.indexOf(miniGoal);
			note.miniGoals.splice(index, 1);
		}
		
		this.doneNote = function() {
			note = TodolistRepository.findNoteById($scope.todolist,$scope.ngDialogData.id);
			subCategory = TodolistRepository.findSubCategoryByNoteId($scope.todolist,note.id);
			category = TodolistRepository.findCategoryBySubCategoryId($scope.todolist,subCategory.id);
			
			note.pending = false;
			note.done = $scope.date();
			$scope.donelist.push(note);
			
			logEntry = "Well Done! '" + category.name+ "'>'"+subCategory.name+"'>'" + note.title+ "' just get pawned !  <br> ["+$scope.date()+"] ";
			$scope.sortinglog.push(logEntry);
			logEntry = '';
			
			this.done = true;
			this.deleteNote(category,subCategory,note);
			
			
			$scope.closeThisDialog();
		};
		
		this.deleteNote = function(category,subCategory,note){
			if(!this.done){
				logEntry = "Note '" +category.name+"'>'"
						+ subCategory.name +"'>'"
						+ note.title +" has been deleted <br> ["+$scope.date()+"] ";
				$scope.sortinglog.push(logEntry);
			}
			
			index = subCategory.notes.indexOf(note);

			jQuery("#calendar").fullCalendar( 'removeEvents', note.id );
			
			subCategory.notes.splice(index, 1);
			
			subCategory.pending--;
			category.pending--;
			
			//Reset.
			this.done = false;
			this.logEntry = "";
		};
		
		this.deleteNoteFromModal = function(){
			console.log("deleteNoteFromModal");
			note = TodolistRepository.findNoteById($scope.todolist,$scope.ngDialogData.id);
			subCategory = TodolistRepository.findSubCategoryByNoteId($scope.todolist,note.id);
			category = TodolistRepository.findCategoryBySubCategoryId($scope.todolist,subCategory.id);
			
			this.deleteNote(category,subCategory,note);
			$scope.closeThisDialog();
			
		}
		
	});
	
	noteModule.directive("addNote", function(){
		return {
			restrict: 'E',
			templateUrl: 'todolist/note/add-note.html'
		};
	});
	
})()
	