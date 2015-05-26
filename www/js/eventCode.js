
$(document).ready(function() {
	$("#addEvent").click(function() {
        $(".eventCodeToevoegen").slideToggle("fast", {queue: false});
        $("#addEvent").css("transform", "rotate(45deg)");
    });
	$("#closeEventCode").click(function() {
  		$(".eventCodeToevoegen").slideToggle("fast");
        $("#addEvent").css("transform", "rotate(45deg)");
	});
});