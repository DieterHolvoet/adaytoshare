/* jshint
devel: true,
browser: true,
jquery: true
*/

if(location.search.split('login=')[1] !== "true") {
    location.href = "login.html";
}

$(document).ready(function() {
    $('.background').foggy();
});