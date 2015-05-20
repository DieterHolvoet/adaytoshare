/* jshint
devel: true,
browser: true,
jquery: true
*/

if(location.search.split('login=')[1] !== "true") {
    location.href = "login.html";
}

StatusBar.styleLightContent();
StatusBar.backgroundColorByHexString("#51b0c5");

$(document).ready(function() {
    $('.background').foggy();
});