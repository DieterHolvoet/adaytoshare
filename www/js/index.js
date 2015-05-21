/* jshint
devel: true,
browser: true,
jquery: true
*/

var events = [];

function Event(code) {
    this.code = "";
    this.code = code;
    this.name = "";
    this.cover = "";
}

if(localStorage.getItem("events")) {
    events = JSON.parse(localStorage.getItem("events"));
}
               
function checkInvalidInput(element) {
    console.log(element);
    if($(element).val() === "") {
        $(element).parent().addClass("invalid-input");
        $(element).addClass("invalid-input");
        $(element).attr("placeholder", "Gelieve iets in te vullen")
        return false;
        
    } else {
        $(element).parent().removeClass("invalid-input");
        $(element).attr("placeholder", "Naam")
        return true;
    }
}

$(document).ready(function() {

    // Initialisatie van de pagina
    if(localStorage.getItem("username")) {
        window.location.hash = "page-eventlist";
    } else {
        window.location.hash = "page-login";
    }
    $.mobile.initializePage();
    
    // Controle login
    $("#loginform").on("submit", function(e) {
        e.preventDefault();

        return (checkInvalidInput($("#login-naam")) && checkInvalidInput($("#login-code")));
        localStorage.setItem("username", $("#login-naam").val());
        events[0] = new Event($("#login-code").val());
    });
    
    $("#login-naam, #login-code").on("blur", function(e) {
        checkInvalidInput($(this));
    });
    
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");