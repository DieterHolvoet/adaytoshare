$(document).ready(function() {
    $("form").on("submit", function(e) {
        e.preventDefault;
        location.href = "index.html?login=true";
        return false;
    })
});