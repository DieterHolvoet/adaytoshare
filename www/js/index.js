/* jshint
devel: true,
browser: true,
jquery: true
*/

function Event() {
    
}

$(document).ready(function() {
    if(!localStorage.getItem("username")) {
        $("body").pagecontainer("change", "#page-login", {});
        $("#loginform").on("submit", function(e) {
            e.preventDefault();
        });
    } else {
        if()
        $("body").pagecontainer("change", "#page-login", {});
    }
    
    
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");