var config_closeonopen = true;

function showHideSubMenu(elem,show,closeonopen){
	//Get submenu and submenu list children of parent element
	var submenu_list = $(elem).parent().parent().children(".submenu-wrapper");
	var submenu_item = $(elem).parent().parent();
	var show = (show == null ? (($(submenu_list).hasClass("submenu-open")) ? false : true) : show);
	if(!show){
		//If the submenu element is visible, close it
		if($(elem).hasClass('menu-open')){
			//If child menus are open, close
			$(submenu_list).children('.submenu-container').children('.submenu-inner').children('.submenu-label.menu-open').each(function(){
				showHideSubMenu(this, false, false);
			});
			
			//Hide submenu
			submenu_list.slideUp("medium", function(){
				//Switch title class to show that the submenu is open
				$(elem).removeClass('menu-open');
				$(elem).addClass('menu-closed');
				
				//Switch toggle class to show that the submenu is closed
				$(submenu_list).removeClass('submenu-open');
				$(submenu_list).addClass('submenu-closed');
			});
		}
	} else {
		//If the submenu element is closed, make it visible
		if($(elem).hasClass('menu-closed')){
			//If closeonopen is set & set to true, only allow one branch of tree to be open at one time
			if(closeonopen !="undefined" && closeonopen != false){
				$(submenu_item).parent().children('.submenu-container').children('.submenu-inner').children('.submenu-label.menu-open').each(function(){
					showHideSubMenu(this, false, false);
				})
			}
			
			submenu_list.slideDown("medium", function(){
				// Switch title class 
				$(elem).removeClass('menu-closed');
				$(elem).addClass('menu-open');
			});
			// Switch submenu class 
			$(submenu_list).removeClass('submenu-closed');
			$(submenu_list).addClass('submenu-open');

		}
	}
}

function popupInit(){
    //Get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    //Set height and width to mask to fill up the whole screen
    $('#global-popup-mask').css({'width':maskWidth,'height':maskHeight});
    // loading
    $('#global-popup-dialog').html('<p>Loading...</p>');
    //transition effect
    $('#global-popup-mask').fadeIn(250);
    $('#global-popup-mask').fadeTo('normal',0.8);
    //Get the window height and width
    var winH = $(window).height();
    var winW = $(window).width();
    //Set the popup window to center
    $('#global-popup-dialog').css('top',  winH/2-$('#global-popup-dialog').height()/2);
    $('#global-popup-dialog').css('left', winW/2-$('#global-popup-dialog').width()/2);

}
function popupExec(){
    // size the content (height)
    $('#global-popup-inner').height($('#global-popup-dialog').height()-30);
    $('#global-popup-inner').css('overflow', 'auto');

    //transition effect
    $('#global-popup-dialog').fadeIn(250);
}