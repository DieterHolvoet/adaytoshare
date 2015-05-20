$(document).ready(function() {
    $("form").on("submit", function(e) {
        window.location.replace("index.html?login=true");
        e.preventDefault();
    })
});