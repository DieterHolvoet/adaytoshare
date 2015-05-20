$(document).ready(function() {
	$( "#comment" ).click(function() {
  		$( "#commentField" ).slideToggle( "slow", function() {
    // Animation complete.
  	});
	});
});