
$(document).ready(function() {
	$(".comment").click(function() {
  		$(this).next().slideToggle( "fast", function() {
    // Animation complete.
  	});
	});

	$(".partypoints").click(function(){
		var n = $(".ppNumber").text();

		n++;

		$(".ppNumber").text(n);
	});
});