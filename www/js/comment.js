
$(document).ready(function() {
	$(".comment").click(function() {
  		$(this).next().slideToggle( "fast", function() {
    // Animation complete.
  	});
	});

	$(".partypoints").click(function(){
		if($(this).attr("pp") !== "true"){

			$(this).addClass('magictime puffIn');

			$(this).attr("pp", "true");
			var n = $(this).children().text();
			n++;

			$(this).children().text( " " + n);

			$(this).css( "color", "red");
		}
	});
});