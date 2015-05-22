
$(document).ready(function() {
	$(".comment").click(function() {
  		$(this).next().slideToggle( "fast", function() {
    // Animation complete.
  	});
	});

	$(".partypoints").click(function(){

		var n = $(this).children().text();

		$(this).addClass('magictime boingInUp');

		if($(this).attr("pp") !== "true"){
			
			n++;

			$(this).children().text( " " + n);

			$(this).css( "color", "#489CAF");

			$(this).attr("pp", true);

		} else{

			n--;

			$(this).children().text( " " + n);

			$(this).css( "color", "black");

			$(this).attr("pp", false);
		}

	});


});