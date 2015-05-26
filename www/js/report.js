$(document).ready(function() {

		$('#report').click(function() {
			$('.report').fadeIn( "fast" );
			$('.fab').css('display', 'none');
		});

		$('.report').click(function() {
			$('.report').fadeOut( "fast" );
			$('.fab').css('display', 'block');
		});

});