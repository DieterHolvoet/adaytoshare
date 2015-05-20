/* jshint
devel: true,
browser: true,
jquery: true
*/

$(document).ready(function() {
//    if($("#page-login").getActivePage());
    
    $("#loginform").on("submit", function(e) {
        e.preventDefault();
    })
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");