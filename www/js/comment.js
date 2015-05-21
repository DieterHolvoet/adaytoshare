$(document).ready(function() {
	$( ".comment" ).click(function() {
  		$(this).next().slideToggle( "fast", function() {
    // Animation complete.
  	});
	});
});