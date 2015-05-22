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
    var temp = "";
    
    if($(element).val() === "" || ($(element).attr("name") === "code" && $(element).val().length < 6)) {
        $(element).parent().addClass("invalid-input");
        $(element).addClass("invalid-input");
        temp = $(element).attr("placeholder");
        $(element).attr("placeholder", "Ongeldige invoer");
        return false;
        
    } else {
        $(element).parent().removeClass("invalid-input");
        $(element).attr("placeholder", temp);
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
        
        if (checkInvalidInput($("#login-code")) && checkInvalidInput($("#login-naam"))) {
            localStorage.setItem("username", $("#login-naam").val());
            events[0] = new Event($("#login-code").val());
            if(events.length > 1) {
                $("body").pagecontainer("change", "#page-eventlist", {});
            } else {
                $("body").pagecontainer("change", "#page-newsfeed", {});
            }
            
        } else {
            return false;
        }
    });
    
    $(".logout").on("click", function() {
        localStorage.removeItem("username");
        $("body").pagecontainer("change", "#page-login", {});
    });
    
    $("#login-naam, #login-code").on("blur", function(e) {
        checkInvalidInput($(this));
    });
    
    $('.formulierTekstbericht').on("submit", function(e){
        e.preventDefault();
        $("body").pagecontainer("change", "#page-newsfeed", {});
    });
    var totalheight = $(document).height();
    /*Test voor calc height*/
    $('#page-newpost').on("pageshow", function(){
        console.log("pagecontainerloaded");
        $('.nieuwBerichtBackground').foggy({blurRadius: 5});
    var imgDiv = $('.nieuwBerichtBackground').height();
    var header = $('#headerNewPost').height();
    var button = $('.verzendButton').height();
    console.log($('.nieuwBerichtBackground').height());
    console.log(totalheight);
    console.log(header);
    console.log(button);
    $('.boodschap').height(totalheight - button - header - imgDiv);    
    });
    
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");