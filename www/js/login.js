$(document).ready(function() {
    $("form").on("submit", function(e) {
        location.href = "index.html?login=true";
        e.preventDefault();
    })
});