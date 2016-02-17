(function(){
	
	var repositories = angular.module('repositories', []);
	
	repositories.factory('TodolistRepository',function(){
		
		var todolistRepository = {};
		
		todolistRepository.findNoteById = function(todolist,id) {
			for ( i=0; i < todolist.length ; i++) {
				for (j=0; j < todolist[i].subcategories.length ; j++ ) {
					for (k=0; k < todolist[i].subcategories[j].notes.length ; k++) {
						if ( todolist[i].subcategories[j].notes[k].id == id ) {
							return todolist[i].subcategories[j].notes[k];
						}
					}
				}
			}
		};
		
		todolistRepository.findSubCategoryByNoteId = function(todolist,id) {
			for ( i=0; i < todolist.length ; i++) {
				for (j=0; j < todolist[i].subcategories.length ; j++ ) {
					for (k=0; k < todolist[i].subcategories[j].notes.length ; k++) {
						if ( todolist[i].subcategories[j].notes[k].id == id ) {
							return todolist[i].subcategories[j];
						}
					}
				}
			}
		};
		
		todolistRepository.findSubCategoryByName = function(todolist,name) {
			for ( i=0; i < todolist.length ; i++) {
				for (j=0; j < todolist[i].subcategories.length ; j++ ) {
					if ( todolist[i].subcategories[j].name == name ) {
						return todolist[i].subcategories[j];
					}
				}
			}
		}
		
		todolistRepository.findCategoryBySubCategoryId = function(todolist,id) {
			for ( i=0; i < todolist.length ; i++) {
				for (j=0; j < todolist[i].subcategories.length ; j++ ) {
					if ( todolist[i].subcategories[j].id == id ) {
						return todolist[i];
					}
				}
			}
		};
		
		todolistRepository.findNoteEventByNoteId = function(noteEvents,id) {
			for ( i=0; i < noteEvents.length ; i++) {
				if ( noteEvents[i].id == id ) {
					return noteEvents[i];
				}
			}
		};
		
		return todolistRepository;
		
	});
	
	repositories.factory('TaskRepository',function(){
		var taskRepository = {};

		taskRepository.findTaskById = function(tasks,id) {
			for( var i = 0 ; i < tasks.length ; i++ ) {
				if(tasks[i].id == id) {
					return tasks[i];
				}
			}
		};
		
		return taskRepository;
	});
})();