/*
*Dependencies: phrase.js, bootstrap.min.js
*jQuery.scrollTo()
*@description popover touyr plugin
*@author Oleg Belousov 11/4/2012
*/
(function(){
	var currentPopOver = 0;
	var popovers = {};
	var topLayerPlaceHolder = 0;
	var topLayer = false;
	var JSONPath;
	var gridOpened = false;
	var presentationInProgress = false;
	var popoversSet;
	var __phrase = {}
	function get_phrase(key){
		return __phrase[key] ?  __phrase[key] : key;
	}
	$(function ()  
	{

	$('embed').css('display', 'none');

	$('body').on('click', '.popover .close', function(){
		presentationInProgress = false;
		unbindPopovers(popoversSet);
		$('[rel="popover"]').removeAttr('rel');
		$('#' + popovers[currentPopOver]['id']).popover('hide');
		$('.fadeMe').fadeOut(800);
		if(gridOpened)
			$('#returnToList').click();//temp fix for grid bug
	});

	$('body').on('click', '.popover .done', function(){	
		presentationInProgress = false; 
		unbindPopovers(popoversSet);
		$('#' + popovers[currentPopOver]['id']).popover('hide');
		$('.fadeMe').fadeOut(800);
	});

	$('body').on('click', '.popover .next', function () {
		if(typeof popovers[currentPopOver]['children'] === 'object' && typeof popovers[currentPopOver]['children']['0'] !== 'undefined'
			&& $('#' + popovers[currentPopOver]['clickElement']).length && $('#' + popovers[currentPopOver]['children']['0']['id']).length){
			topLayer = popovers;
			popovers = popovers[currentPopOver]['children'];
			topLayerPlaceHolder = currentPopOver;
			currentPopOver = 0;
			gridOpened = true;
			$('#' + topLayer[topLayerPlaceHolder]['clickElement']).click().delay(800).queue(function(next){
				$('#' + topLayer[topLayerPlaceHolder]['id']).popover('hide');
				next();
			});

			var prevLoc =  $("#" + topLayer[topLayerPlaceHolder]['id']);
			var thisLoc = $("#" + popovers[currentPopOver]['id']);
			scrollDelta =   thisLoc - prevLoc;
			nextPopOver(0);
			return;
		}
		else if(typeof  popovers[currentPopOver]['clickElement'] !== 'undefined' && $('#' + popovers[currentPopOver]['clickElement']).length){
			$('#' + popovers[currentPopOver]['clickElement']).click();
			gridOpened = true;
		}

	   if(typeof popovers[currentPopOver + 1] !== 'undefined'){//Itterator.advance()
		nextPopOver(1);
		}
		else if(topLayer){//return to topLayer
			$('#' + popovers[currentPopOver]['id']).popover('hide');
			$('#' + popovers[currentPopOver]['clickElement']).dblclick();
			gridOpened = false;
			var prevLoc =  $("#" + popovers[currentPopOver]['id']);
			var thisLoc = $("#" + topLayer[topLayerPlaceHolder + 1]['id']);
			scrollDelta =   thisLoc - prevLoc;
			$.scrollTo(thisLoc.offset().top + 100, {duration:500});
			popovers = topLayer;
			topLayer = false;
			currentPopOver = topLayerPlaceHolder;
			currentPopOver++;
			nextPopOver(0);
		}

	});

	$('body').on('click', '.popover .previous', function(){

	if(typeof popovers[currentPopOver - 1] !== undefined){
		nextPopOver(-1);
	}
	else if(typeof topLayer !== 'undefined'){
		$('#' + popovers[currentPopOver]['id']).popover('hide');
		popovers = topLayer;
		currentPopOver = topLayerPlaceHolder;
		$('#' + popovers[currentPopOver]['id']).click().delay(800).queue(function(next){
			nextPopOver(0);
			next();
		});
	}
		
	});

	$('body').on('click', '.popover .watchAgain', function(){
		
	 	$('#' + popovers[currentPopOver]['id']).popover('hide').delay(800).queue(function(next){
			currentPopOver = 0;
			$('#' + popovers[currentPopOver]['id']).popover('show');
			$('#' + popovers[currentPopOver]['id']).focus();
			next();
		});
	});



	});  

	function nextPopOver(direction){//1 - next, -1 previous
		var currentPopoverId = popovers[currentPopOver]['id'];
		var nextPopoverId = popovers[currentPopOver + direction]['id'];
		var prevLoc =  $("#" + currentPopoverId);
		var thisLoc = $("#" + nextPopoverId);

		if(thisLoc.offset().top != prevLoc.offset().top && direction != 0){
			scrollDelta =   thisLoc - prevLoc;
			$.scrollTo( thisLoc.offset().top - 100, {duration:500});
		}

		$('#' + currentPopoverId).popover('hide').delay(800).queue(function(next){
			$('#' + nextPopoverId ).popover('show');
			$('#' + nextPopoverId).focus();
			next();	
		});

		currentPopOver += direction;
	}

	function initPopover(jsonPath){
	JSONPath = jsonPath;
	try{
		var i = 0
		$.getJSON(jsonPath, function(json) {
			if(json ==  "" || $.isEmptyObject(json) || !json.hasOwnProperty('0')){
				return;
			}
				for(var j in json){
					popovers[j] = {};
					var nextIndex = parseInt(j) + 1 ;
					if(typeof json[nextIndex] === 'undefined'){
						popovers[j]['body'] = json[j]['body'] + "<div style='display:block;'><span class='btn btn-link done'>" + get_phrase('Done') + "</span><!--<span class='btn btn-link watchAgain'>" + get_phrase('watchAgain') + "</span>--></div>";
					}
					else{
						popovers[j]['body'] = json[j]['body'] + "<div style='display:block;'><span class='btn btn-link next'>" + get_phrase('Next') + "</span></div>";	
					}
					if(typeof json[j]['placement'] === 'undefine'){
						popovers[j]['placement'] == 'bottom'; //defualt placement
					}
					else{
						popovers[j]['placement'] = json[j]['placement'];
					}
					if(get_phrase('web_float') == "right"){
						popovers[j]['title'] = "<span style=\"padding-right:5px;\">" + json[j]['title']  + "</span><span class='close' stlye=\"text-align:right;vertical-align:top; font-size:12px;\">x</span>"		
					}
					else{
						popovers[j]['title'] = "<span style=\"padding-right:5px;\">" + json[j]['title']  + "</span><span class='close' stlye='text-align:left !important; direction:ltr; vertical-align:top; font-size:12px;'>x</span>";
					}
					popovers[j]['id'] = json[j]['id'];
					popovers[j]['clickElement'] = json[j]['clickElement'];

					$('#' + json[j]['id']).attr('rel', 'popover');
					if(typeof json[j]['children'] !== 'unefined'){
						popovers[j]['children'] = {};
						for(var k in json[j]['children']){
							var innerNextIndex = parseInt(k) + 1 ;
						
							popovers[j]['children'][k] = {};
							var nextIndex = parseInt(j) + 1 ;
							if(typeof json[j]['children'][innerNextIndex] === 'undefined' && json[j][nextIndex] === 'undefined'){
								popovers[j]['children'][k]['body'] = json[j]['children'][k]['body'] + "<div style='display:block;'><span class='btn btn-link next'>" + get_phrase('Done') + "</span><!--<span class='btn btn-link watchAgain'>" + get_phrase('watchAgain') + "</span>--></div>";
							}
							else{
								popovers[j]['children'][k]['body'] = json[j]['children'][k]['body'] + "<div style='display:block;'><span class='btn btn-link next'>" + get_phrase('Next') + "</span></div>";	
							}
							if(typeof json[j]['children'][k]['placement'] === 'undefine'){
								popovers[j]['children'][k]['placement'] == 'bottom'; //defualt placement
							}
							else{
								popovers[j]['children'][k]['placement'] = json[j]['children'][k]['placement'];
							}
							if(get_phrase('web_float') == "right"){
								popovers[j]['children'][k]['title'] = "<span style=\"padding-right:5px;\">" + json[j]['children'][k]['title']  + "</span><span class='close' stlye=\"text-align:right;vertical-align:top; font-size:12px;\">x</span>"		
							}
							else{
								popovers[j]['children'][k]['title'] = "<span style=\"padding-right:5px;\">" + json[j]['children'][k]['title']  + "</span><span class='close' stlye='text-align:left !important; direction:ltr; vertical-align:top; font-size:12px;'>x</span>";
							}
						
							popovers[j]['children'][k]['id'] = json[j]['children'][k]['id'];
							popovers[j]['children'][k]['clickElement'] = json[j]['children'][k]['clickElement'];
							$('#' + json[j]['children'][k]['id']).attr('rel', 'popover');
						}
					}
				}

				for(var i in popovers){
					initPopovers(popovers[i]);
					if(typeof popovers[i]['children'] !== 'undefined'){	
						for(var n in popovers[i]['children']){
							initPopovers(popovers[i]['children'][n]);
						}
					}
				}
				var j = 0;
				$('.page').append('<div class="fadeMe" style="display:none;"></div>').queue(function(next){
					$('#' + popovers[currentPopOver]['id']).popover('show');
					$('.fadeMe').fadeIn(500);
					next();
				});
				presentationInProgress = true;
				popoversSet = $('[rel="popover"]');
		});	

	}
	catch(e){
		console.log('Cannot open specified JSON file');
	}

	}

	function initPopovers(thisPopover){
					$('#' + thisPopover['id']).popover({
						html : true,
						placement : thisPopover['placement'],				
						title: thisPopover['title'],
						content: thisPopover['body'] /*function(){return $('#content' + currentConetnet).html()}*/
					})
					.on('click', function(e){
						if(presentationInProgress){
							e.preventDefault();
							if($(this).attr('id') != popovers[currentPopOver]['id']){
								$(this).popover('hide').queue(function(next){
								$(this).popover('hide');
								next();
								});
							}
							else{
								$(this).popover('hide').delay(300).queue(function(next){
								$(this).popover('show');
								next();
								});
							}
						}
					});
	}
	function unbindPopovers(popovers){
		popovers.each(function(){
			var myId = $(this).attr('id');
			$('#' + myId).popover('disable');
		});
	}
})()
