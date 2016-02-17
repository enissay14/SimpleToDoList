(function(){
	
	var app = angular.module('SimpleTodoList', ['repositories','simpletodolist-category','simpletodolist-subcategory','simpletodolist-note','simpletodolist-task','done-category','ui.sortable','ui.bootstrap','LocalStorageModule','xeditable','ngDialog','ui.calendar']);
	
	app.run(function(editableOptions) {
		editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
	});
	
	app.controller('TodoListController', ['$scope','localStorageService','ngDialog','$timeout','$filter','TodolistRepository','TaskRepository' ,function($scope,localStorageService,ngDialog,$timeout,$filter,TodolistRepository,TaskRepository) {
		$scope.receiver ;
		$scope.todolist = [];
		$scope.donelist = [];
		$scope.tasks = [];
		$scope.sortinglog = [];
		$scope.notes = [];
		$scope.checked = false;
		$scope.eventSources = [];
		$scope.noteEvents = [];
		$scope.taskEvents = [];
		$scope.indexLast = [];
		$scope.showAdd=[];
                $scope.efficency = 0;
		var logEntry;
		
		 // Disable weekend selection
		$scope.disabled = function(date, mode) {
			return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
		};

		$scope.open = function($event) {
			$scope.status.opened = true;
		};

		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};

		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		
		$scope.format = $scope.formats[0];

		$scope.status = {
			opened: false
		};
	
		$scope.picker = { opened: false }; 
  
		$scope.openPicker = function() {
			$timeout(function() {
				$scope.picker.opened = true;
			});
		};
		
		$scope.closePicker = function() {
			$scope.picker.opened = false;
		};
		
		$scope.freezeScroll = function() {
			var scrollPosition = [
				self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
				self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
			];
			var html = jQuery('html'); // it would make more sense to apply this to body, but IE7 won't have that
			html.data('scroll-position', scrollPosition);
			html.data('previous-overflow', html.css('overflow'));
			html.css('overflow', 'hidden');
			window.scrollTo(scrollPosition[0], scrollPosition[1]);
		};
		
		$scope.unfreezeScroll = function() {
			// un-lock scroll position
			var html = jQuery('html');
			var scrollPosition = html.data('scroll-position');
			html.css('overflow', html.data('previous-overflow'));
			window.scrollTo(scrollPosition[0], scrollPosition[1])
		};
		
		$scope.openOnWheel = function() {
			
			angular.element(document).on('mouseenter', '.wheelExpandCategory', function(){
				$scope.insideCategory = true;
				$scope.freezeScroll();
				var panelContent = jQuery(this).children().next();
				var panelCommand = jQuery( this ).children().children().children();
				var categoryName = panelContent.attr('id');

				jQuery(this).on('mousewheel', function(event){
					
					if ( !panelContent.hasClass('in') && event.deltaY == -1 && !$scope.showAdd[categoryName]) {
						
						panelCommand.click();
						$scope.showAdd[categoryName] = true;
						
						
					}
					if ( panelContent.hasClass('in') && event.deltaY == 1 && !$scope.insideSubCategory && $scope.showAdd[categoryName]) {
						
						panelCommand.click();
						$scope.showAdd[categoryName] = false;
						
					}
				 });
			});
			angular.element(document).on('mouseleave', '.wheelExpandCategory', function(){
				$scope.insideCategory = false;
				$scope.unfreezeScroll();
			});
			
			angular.element(document).on('mouseenter', '.wheelExpandSubCategory', function(){
				$scope.insideSubCategory = true;
				$scope.freezeScroll();
				var panelContent = jQuery(this).children().next();
				var panelCommand = jQuery( this ).children().children().children();
				var subCategoryName = panelContent.attr('id');
				
				jQuery(this).on('mousewheel', function(event){
					
					if ( !panelContent.hasClass('in') && event.deltaY == -1 && !$scope.showAdd[subCategoryName]) {
						
						panelCommand.click();
						$scope.showAdd[subCategoryName] = true;
						
					}
					if ( panelContent.hasClass('in') && event.deltaY == 1 && $scope.showAdd[subCategoryName]) {
						
						panelCommand.click();
						$scope.showAdd[subCategoryName] = false;
						
					}
				 });
			});
			angular.element(document).on('mouseleave', '.wheelExpandSubCategory', function(){
				$scope.insideSubCategory = false;
				$scope.unfreezeScroll();
			});
			
		};
		
		$scope.switchAdd = function(name) {
			
			if (!jQuery('#'+name+'').attr('class').indexOf("in") > -1 ) {
				//show
				$scope.showAdd[name] = true;
			}
			if(jQuery('#'+name+'').attr('class').indexOf("in") > -1) {
				//hide
				$scope.showAdd[name] = false;
			}
			
		}
		
		$scope.clickToOpen = function (note) {
			var status = '';
			if(note.pending) {
				status = 'pending'; 
				$scope.miniGoals = note.miniGoals;
				$scope.list = $scope.todolist;
				ngDialog.open({ 
					template: 
						'<p class="todo-title"> Todo : '+ note.title +'</p>'
						+'<div class="minigoals">'
							+'<p> Mini Goals :</p>'
							+'<div ng-controller="TodoListController as todolistCtrl">'
								+'<div class="minigoal" ng-repeat="minigoal in miniGoals">'
									+'<label><input type="checkbox" ng-model="minigoal.checked" />{{minigoal.title }} </label>'
									+'<div id="remove-minigoal" ng-controller="NoteController as noteCtrl">'
										+'<span class="glyphicon glyphicon-remove" ng-click="noteCtrl.deleteMiniGoal(list,minigoal)"></span>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
						+'<div ng-controller="NoteController as noteCtrl">'
							+'<div class="input-group" >'
								+'<input id="new-minigoal" type="text" ng-model="noteCtrl.miniGoal.title">'
								+'<div class="buttons">'
									+'<span class="glyphicon glyphicon-plus" ng-click="noteCtrl.addMiniGoal()"></span>'
								+'</div>'
							+'</div>'
							+'<span class="input-btn">'
								+'<button class="btn btn-danger" type="button" ng-click="noteCtrl.deleteNoteFromModal()">Delete</button>'
								+'<button class="btn btn-success" type="button" ng-click="noteCtrl.doneNote()">Done</button>'
							+'</span>'
						+'</div>',
					className: 'ngdialog-theme-default',
					controller: 'NoteController',
					scope: $scope,
					plain: true,
					data : note
				});
			}
		};
		
		$scope.numberPendingNotesInSubcategory = function(subcategory) {
			var numberNotes = 0;
			if (  subcategory ) {
				for(var k=0; k < subcategory.notes.length ; k++) {
					if( subcategory.notes[k].pending ) {
						numberNotes += 1 ;
					};
				};
			};
			return numberNotes;
		};	
		
		/* config calendar object */
		$scope.uiConfig = {
			
			calendar:{
				
				height: 480,
				googleCalendarApiKey: 'AIzaSyCUEnfbAfdk2TEk8YqE6kod8Es9cKGKgpw',
				editable: false,
				minTime: "05:00:00",
				maxTime: "23:00:00",
				defaultView: "agendaWeek",
				firstDay: 1,
				views: {
					agendaWeek: { 
						columnFormat: 'ddd D'
					}
				},
				customButtons: {
					refresh: {
					text: 'Refresh!',
					click: function() {
						jQuery("#calendar").fullcalendar(' refetchResources');
					}
					}
				},
				header:{
					left: 	'month agendaWeek agendaDay',
					center: 'title',
					right: 	'refresh today prev,next'
				},
				eventMouseover: function( event, jsEvent, view ) { 
					if (event.pending){
						note = TodolistRepository.findNoteById($scope.todolist,event.id);
						subCategory = TodolistRepository.findSubCategoryByNoteId($scope.todolist,note.id);
						category = TodolistRepository.findCategoryBySubCategoryId($scope.todolist,subCategory.id);
						
						this.setAttribute('title',category.name+'>'+subCategory.name);
					}
				},
				eventDrop: function( event ) {  
					if (event.pending){
						note = TodolistRepository.findNoteById($scope.todolist,event.id);
						var date = new Date(event.start);
						note.start = date;
						$('#calendar').fullCalendar('updateEvent', event);
					}else{
						task = TaskRepository.findTaskById($scope.tasks,event.id);
						task.start = event.start;
						task.end = event.end;
					}
				},
				eventResize: function(event, delta, revertFunc) {

					$('#calendar').fullCalendar('updateEvent', event);
					
					task = TaskRepository.findTaskById($scope.tasks,event.id);
					task.start = event.start;
					task.end = event.end;
					
				},
				dayClick: function(date, allDay, jsEvent, view) {
					var str = date.format("YYYY-MM-DD HH:mm:ss"); // Date to String
					var d = new Date(date);
					ngDialog.open({ 
						template: 'Add Task on : '+str+' '
								+'<div ng-controller="TaskController as taskCtrl">'
								+'<div class="input-group" >'
									+'<input type="text" class="form-control" ng-model="taskCtrl.task.title" placeholder="Title...">'
									+'<input type="text" class="form-control" ng-model="taskCtrl.task.place" placeholder="Place...">'
									+'<textarea type="text" class="form-control" ng-model="taskCtrl.task.description" placeholder="Description..."></textarea>'
								+'</div>'
								+'<span class="input-btn">'
								+'<button class="btn btn-default" type="button" ng-click="taskCtrl.addTask()">Add</button>'
								+'</span>'
							+'</div>',
						plain: true,
						controller: 'TaskController',
						scope: $scope,
						data: d
					});
				},
				eventClick: function(calEvent, jsEvent, view) {
					if (calEvent.pending){
						status = 'pending'; 
						$scope.miniGoals = calEvent.miniGoals;
						$scope.list = $scope.todolist;
						ngDialog.open({
							template: 
								'<p class="todo-title"> Todo : '+ calEvent.title +'</p>'
								+'<div class="minigoals">'
									+'<p> Mini Goals :</p>'
									+'<div ng-controller="TodoListController as todolistCtrl">'
										+'<div class="minigoal" ng-repeat="minigoal in miniGoals">'
											+'<label><input type="checkbox" ng-model="minigoal.checked" />{{minigoal.title }} ({{minigoal.checked }})</label>'
											+'<div id="remove-minigoal" ng-controller="NoteController as noteCtrl">'
												+'<span class="glyphicon glyphicon-remove" ng-click="noteCtrl.deleteMiniGoal(list,minigoal)"></span>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
								+'<div ng-controller="NoteController as noteCtrl">'
									+'<div class="input-group" >'
										+'<input id="new-minigoal" type="text" ng-model="noteCtrl.miniGoal.title">'
										+'<div class="buttons">'
											+'<span class="glyphicon glyphicon-plus" ng-click="noteCtrl.addMiniGoal()"></span>'
										+'</div>'
									+'</div>'
									+'<span class="input-btn">'
										+'<button class="btn btn-danger" type="button" ng-click="noteCtrl.deleteNoteFromModal()">Delete</button>'
										+'<button ng-controller="DoneController as doneCtrl" class="btn btn-success" type="button" ng-click="noteCtrl.doneNote()">Done</button>'
									+'</span>'
								+'</div>',
							plain: true,
							controller: 'NoteController',
							scope: $scope,
							data : calEvent,
						});
					}else{
						if (!calEvent.description) { calEvent.description = 'no description' }
						ngDialog.open({ 
							template: '<p style="text-align: center;">Update Task : '+calEvent.title+' </p>'
									+'<div ng-controller="TaskController as taskCtrl">'
									+'<form>'
										+'<div class="input-group" >'
											+'<div class="form-group">'
												+'<label >Title </label>'
												+'<input type="text" class="form-control" ng-model="taskCtrl.task.title" placeholder="'+ calEvent.title +'">'
											+'</div>'
											+'<div class="form-group">'
												+'<label>Place </label>'
												+'<input type="text" class="form-control" ng-model="taskCtrl.task.place" placeholder="'+ calEvent.place +'">'
											+'</div>'
											+'<div class="form-group">'
												+'<label>Description </label>'
												+'<textarea type="text" class="form-control" ng-model="taskCtrl.task.description" placeholder="'+ calEvent.description +'"></textarea>'
											+'</div>'
											+'<div class="form-group">'
												+'<label >File input</label>'
												+'<input type="file" id="exampleInputFile">'
											+'</div>'
										+'</div>'
										+'<span class="input-btn">'
											+'<button class="btn btn-danger" type="button" ng-click="taskCtrl.deleteTask(calEvent)">Delete</button>'
											+'<button class="btn btn-default" type="button" ng-click="taskCtrl.updateTask()">Update</button>'
										+'</span>'
									+'</form>'
								+'</div>',
							plain: true,
							controller: 'TaskController',
							scope: $scope,
							data : calEvent
						});
					}

				}
				
			}
		};
		
		$scope.refreshCalendar = function() {
			jQuery("#calendar").fullCalendar('refetchEvents');
		};
		
		$scope.eventSourceGMAIL = {
				url: "https://www.google.com/calendar/feeds/yassine.landa%40gmail.com/public/basic",
				className: 'gcal-event-yass'
			};
		
		$scope.eventSourceEMSE = {
				url: "https://www.google.com/calendar/feeds/lf2tk2auinqv84r51s6p2ope9g%40group.calendar.google.com/public/basic",
				className: 'gcal-event-emse'
			};
		
		$scope.init = function  () {
			
			if (localStorageService.get("todoList")===null) {
			   alert("Hey Welcome, Click the Plus Button to add new categories and new Notes!");
			}
			else{
				$scope.todolist = localStorageService.get("todoList");
				
                                var accomplished = 0;
                                var all = 0;
				for(var i=0; i < $scope.todolist.length; i++) {
					
					$scope.todolist[i].pending = 0;
					
					//sortable options for Categories
					$scope.todolist[i].sortableOptions = $scope.createOptionsCategory($scope.todolist[i].name);
					$scope.showAdd[$scope.todolist[i].name] = false;
					
					for(var j=0; j < $scope.todolist[i].subcategories.length; j++) {
						
						//sortable options for subcategories
						$scope.todolist[i].subcategories[j].sortableOptions = $scope.createOptions($scope.todolist[i].subcategories[j].name);
						$scope.showAdd[$scope.todolist[i].subcategories[j].name] = false;
						//number of pending notes
						$scope.todolist[i].subcategories[j].pending = $scope.numberPendingNotesInSubcategory($scope.todolist[i].subcategories[j]);
						$scope.todolist[i].pending += $scope.todolist[i].subcategories[j].pending;
						
						for(var k=0; k < $scope.todolist[i].subcategories[j].notes.length ; k++ ) {
							$scope.noteEvents.push($scope.todolist[i].subcategories[j].notes[k]);
                                                        
                                                        if($scope.todolist[i].subcategories[j].notes[k].miniGoals.length != 0){
                                                            for(var l=0; l < $scope.todolist[i].subcategories[j].notes[k].miniGoals.length ; l++ ) {
                                                                if($scope.todolist[i].subcategories[j].notes[k].miniGoals[l].checked){
                                                                    accomplished ++; 
                                                                }
                                                                all ++;
                                                            }
                                                        }else{
                                                            all ++;
                                                        }
						}
						
					};
					
				};
                                console.log(accomplished +' / '+all);
                                $scope.efficency = (accomplished / all ) *100 ;
				
				$scope.eventSourceNotes = { 
					events : $scope.noteEvents,
					color : '#3176B2',
					textColor: 'white',
					allDay : true,
					editable: true,
					durationEditable: false
				};
				
				
				if (localStorageService.get("indexLast")===null) {
					$scope.indexLast = [0,0,0,0];
				}else{
					$scope.indexLast = localStorageService.get("indexLast");
				}
				
			}
			
			if (localStorageService.get("doneList")===null ) {
				$scope.donelist = [];
			}
			else{
				$scope.donelist = localStorageService.get("doneList");
				$scope.donelist.sortableOptions = $scope.createOptions("doneList"); 
			}
			
			if( localStorageService.get("tasks")===null) {
				var date = new Date();
				$scope.tasks = [
					   {id:$scope.indexLast[2] + 1,title:'Event0', description:'init: Welcome to Simple Todo List', start:date}
					  ];
			}
			else{
				$scope.tasks = localStorageService.get("tasks");
				
				for(var i = 0; i < $scope.tasks.length ; i++ ) {
					$scope.taskEvents.push($scope.tasks[i]);
				}
				
				$scope.eventSourceTasks = { 
							events : $scope.taskEvents,
							color : 'white',
							textColor: 'black',
							editable: true ,
						};
						
				
			}
			
			if (localStorageService.get("sortingLog")===null ) {
				$scope.sortinglog = [];
			}
			else{
				$scope.sortinglog = localStorageService.get("sortingLog");
			}
			
			$scope.eventSources.push($scope.eventSourceNotes);
			$scope.eventSources.push($scope.eventSourceGMAIL);
			$scope.eventSources.push($scope.eventSourceEMSE);
			$scope.eventSources.push($scope.eventSourceTasks);
				
			$scope.openOnWheel();
			
		};
		
		$scope.loadCalendarData = function() {
			jQuery("#calendar").fullCalendar( 'removeEventSource', $scope.eventSourceNotes );
			jQuery("#calendar").fullCalendar( 'addEventSource', $scope.eventSourceNotes );
		};
		
		$scope.toggleCalendar = function(){
			if( !$scope.checked ){
				jQuery('#navigation').hide("slide", { direction: "left" }, 1000);
				jQuery('#sidebar').fadeOut('slow');
				jQuery('#todolist').fadeOut(750, function(){
					jQuery('#todolist').fadeIn( 1000);
				});
				
				jQuery('#calendar').show("slide", { direction: "right" }, 1000);
				jQuery("#calendar").fullCalendar('render');
				$scope.loadCalendarData();
				
				$scope.checked = true; 
				
			} else {
				$scope.checked = false;
				jQuery('#navigation').fadeIn('slow');
				jQuery('#sidebar').fadeIn('slow');
				jQuery('#calendar').fadeOut('slow');
			}
		};
	
	
		$scope.createOptions = function(listName) {
			var _listName = listName;
			var options = {
			  placeholder: "note",
			  connectWith: ".list-group",
			  cursor : "move",
			  start: function(e,ui) {
					newList = oldList = ui.item.parent().parent();
			  },
			  over: function(e,ui) {
					newList = ui.placeholder.parent().parent();
					newList.css('border','2px dotted red');
			  },
			  out: function(e,ui) {
					newList.css('border','none');
			  },
			  stop:function(e, ui){
					newList.css('border','none');
					
					var dropped = true;
					var priority = true;
					startIndex = ui.item.sortable.index + 1;
					
					if(ui.item.sortable.moved) {
						if(oldList.attr('id') != newList.attr('id') ){
							if(newList.attr('id') == 'Done'){	
								ui.item.sortable.moved.pending = false;
								ui.item.sortable.moved.done = $scope.date();
								
								subCategory = TodolistRepository.findSubCategoryByName($scope.todolist,oldList.attr('id'));
								category = TodolistRepository.findCategoryBySubCategoryId($scope.todolist,subCategory.id);
								
								jQuery("#calendar").fullCalendar( 'removeEvents', ui.item.sortable.moved.id);
								subCategory.pending--;
								category.pending--;
								
								logEntry = "Well Done! '" + oldList.attr('id') + "'>'" + ui.item.sortable.moved.title+ "' just get pawned !  <br> ["+$scope.date()+"] ";
								$scope.sortinglog.push(logEntry);
								logEntry = '';
								
								priority = false;
							}
							else if(oldList.attr('id') == 'Done'){
								ui.item.sortable.moved.pending = true;
								ui.item.sortable.moved.done = null;

								subCategory = TodolistRepository.findSubCategoryByNoteId($scope.todolist,ui.item.sortable.moved.id);
								category = TodolistRepository.findCategoryBySubCategoryId($scope.todolist,subCategory.id);
								
								jQuery("#calendar").fullCalendar( 'renderEvent', ui.item.sortable.moved , true );

								console.log($scope.noteEvents);
							
								subCategory.pending++;
								category.pending++;
								
								
								logEntry = "Shiit! '" + ui.item.sortable.moved.title+ "' is never ending ! Just have been moved to '" + newList.attr('id') + "'  <br> ["+$scope.date()+"] ";
								$scope.sortinglog.push(logEntry);
								
								logEntry = '';
								priority = false;
							} else {
								logEntry = "'" + ui.item.sortable.moved.title+ "' Moved from '" + oldList.attr('id') + "' to '" + newList.attr('id')+"'  <br> ["+$scope.date()+"] ";
								$scope.sortinglog.push(logEntry);
								logEntry = '';
								dropped = false;
							}
						}	
					}
					
					if(priority) {
						dropIndex = ui.item.sortable.dropindex + 1;
						if (dropIndex && dropIndex != startIndex) {
							logEntry = "Priority of '" + ui.item.sortable.model.title + "' changed from '" + startIndex + "' to '" + dropIndex +"'  <br> ["+$scope.date()+"] ";
							$scope.sortinglog.push(logEntry);
							logEntry = '';
						}
					}
			  }
			};
			return options;
		  }
		
		$scope.createOptionsCategory =  function(listName) {
			var _listName = listName;
			var options = {
			  placeholder: "subcategory",
			  connectWith: ".panel-group",
			  cursor : "move",
			  start: function(e,ui) {
					newList = oldList = ui.item.parent().parent();
			  },
			  over: function(e,ui) {
					newList = ui.placeholder.parent().parent();
					newList.css('border','2px dotted red');
			  },
			  out: function(e,ui) {
					newList.css('border','none');
			  },
			  stop:function(e, ui){
					newList.css('border','none');
					
					var dropped = true;
					startIndex = ui.item.sortable.index + 1;
					
					if(ui.item.sortable.moved) {
						if(oldList.attr('id') != newList.attr('id') ){
							logEntry = "'" + ui.item.sortable.moved.name + "' Moved from '" + oldList.attr('id') + "' to '" + newList.attr('id')+"'  <br> ["+$scope.date()+"] ";
							$scope.sortinglog.push(logEntry);
							logEntry = '';
						}
						
						dropIndex = ui.item.sortable.dropindex + 1;
						if (dropIndex != startIndex) {
							logEntry = "Priority of '" + ui.item.sortable.model.name + "' changed from '" + startIndex + "' to '" + dropIndex +"'  <br> ["+$scope.date()+"] ";
							$scope.sortinglog.push(logEntry);
							logEntry = '';
						}	
						dropped = false;
					}
					
					if(receiver && dropped){
						
						startIndex = ui.item.sortable.index + 1;
						dropIndex = 0;
						
						var sub_temp ;
						for(var i=0; i < $scope.todolist.length; i++) {
							if( $scope.todolist[i].name == oldList.attr('id') ) {
								for(var j=0; j < $scope.todolist[i].subcategories.length; j++) {
									if($scope.todolist[i].subcategories[j].id == ui.item.sortable.model.id ){
										sub_temp = $scope.todolist[i].subcategories[j];
										$scope.todolist[i].subcategories.splice(j, 1);
									}
								}
							}
						}
						for(var i=0; i < $scope.todolist.length; i++) {
							if( $scope.todolist[i].name == receiver.parent().attr('id') ) {
								$scope.todolist[i].subcategories.push(sub_temp);
								dropIndex = $scope.todolist[i].subcategories.length;
							}
						}
						
						if(oldList.attr('id') != receiver.parent().attr('id') ){
							logEntry = "'" + ui.item.sortable.model.name+ "' Moved from '" + oldList.attr('id') + "' to '" + receiver.parent().attr('id')+"'  <br> ["+$scope.date()+"] ";
							$scope.sortinglog.push(logEntry);
							logEntry = '';
						}
						
						if (dropIndex != startIndex) {
							logEntry = "Priority of '" + ui.item.sortable.model.name + "' changed from '" + startIndex + "' to '" + dropIndex +"'  <br> ["+$scope.date()+"] ";
							$scope.sortinglog.push(logEntry);
							logEntry = '';
						}
						
						receiver = null;
					}
					
					
			  }
			};
			return options;
		  }
		
		$scope.date = function() {
			var currentdate = new Date(); 
			var datetime = "Sync: " + currentdate.getDate() + "/"
						+ (currentdate.getMonth()+1)  + "/" 
						+ currentdate.getFullYear() + " @ "  
						+ currentdate.getHours() + ":"  
						+ currentdate.getMinutes() + ":" 
						+ currentdate.getSeconds();
							return datetime;
		};
			
		$scope.clearLog = function() {
			$scope.sortinglog = [];
		};
		
		$scope.swipeAll = function() {
			if(!($scope.tasks == [] && $scope.todolist== [] && $scope.donelist == [])){
				$scope.tasks = [];
				$scope.todolist= [];
				$scope.donelist = [];
				$scope.clearLog();
				
				logEntry = "Todo List initialized <br> ["+$scope.date()+"] ";
				$scope.sortinglog.push(logEntry);
				
				jQuery("#calendar").fullCalendar("refetchEvents");
			}
		}
		
		
		$scope.updateLog = function(newValue,oldValue) {
			logEntry = "'"+oldValue + "' changed to '"+ newValue +"' <br> ["+$scope.date()+"]"  ;
			$scope.sortinglog.push(logEntry);
			logEntry = '' ;
		};
		
		$scope.updateDeadLine = function(note,newValue,oldValue) {
			logEntry = "Changing DeadLine of '"+note.title+"' from '"+$filter('date')(oldValue,'dd-MMMM')+ "' to '"+ $filter('date')(newValue,'dd-MMMM') +"' <br> ["+$scope.date()+"]"  ;
			$scope.sortinglog.push(logEntry);
			logEntry = '' ;
		};
		
		$scope.$watch("todolist",function  (newVal,oldVal) {
			 if (newVal !== null && angular.isDefined(newVal) && newVal!==oldVal) {
				localStorageService.add("todoList",angular.toJson(newVal));
			 }
			},true);
			
		$scope.$watch("donelist",function  (newVal,oldVal) {
			 if (newVal !== null && angular.isDefined(newVal) && newVal!==oldVal) {
				localStorageService.add("doneList",angular.toJson(newVal));
			 }
			},true);
		
		$scope.$watch("tasks",function  (newVal,oldVal) {
			 if (newVal !== null && angular.isDefined(newVal) && newVal!==oldVal) {
				localStorageService.add("tasks",angular.toJson(newVal));
			 }
			},true);
		
		$scope.$watch("sortinglog",function  (newVal,oldVal) {
			 if (newVal !== null && angular.isDefined(newVal) && newVal!==oldVal) {
				localStorageService.add("sortingLog",angular.toJson(newVal));
			 }
			},true);
	
		$scope.$watch("indexLast",function  (newVal,oldVal) {
		 if (newVal !== null && angular.isDefined(newVal) && newVal!==oldVal) {
				localStorageService.add("indexLast",angular.toJson(newVal));
			 }
			},true);
		
	}]);
	
	app.directive( 'droppable' , function() {
		return {
			restrict: 'C',
			scope: { receiver : '=' },
			link: function ($scope, element, attrs ) {
				$(".droppable").droppable({
					drop: function( event, ui ) {	        
						var collapsedList = $(this).children().children().children() ;
						if ( collapsedList.hasClass('collapsed')) {
							collapsedList.click();
						}    
						
						receiver = jQuery(jQuery(collapsedList.parent().parent()[0]).next()[0]).children().eq(1);
					}
				});
				
			}
		};
		
	});
	
	/**
	* A generic confirmation for risky actions.
	* Usage: Add attributes: ng-really-message="Are you sure"? ng-really-click="takeAction()" function
	*/
	app.directive('ngReallyClick', [function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
			element.bind('click', function() {
				var message = attrs.ngReallyMessage;
				if (message && confirm(message)) {
				scope.$apply(attrs.ngReallyClick);
				}
			});
			}
		}
	}]);
	
	app.filter('unsafe', function($sce) {
	    return function(val) {
	        return $sce.trustAsHtml(val);
	    };
	});
	
})();