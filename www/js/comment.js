$(document).ready(function() {
	$( "#comment" ).click(function() {
  		$( "#commentField" ).slideToggle( "fast", function() {
    // Animation complete.
  	});
	});
});