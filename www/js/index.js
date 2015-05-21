/* jshint
devel: true,
browser: true,
jquery: true
*/

var events = [];

function Event(code, name) {
    this.code = "";
    this.code = code;
    this.name = "";
    this.name = name;
    this.cover = "";
}

if(localStorage.getItem("events")) {
    events = JSON.parse(localStorage.getItem("events"));
}
               
function checkInvalidInput(element) {
    var temp = "";
    
    if($(element).val() === "" || ($(element).attr("name") === "code" && !validateCode($(element).val()))) {
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

function validateCode(code) {
    var result = true;
    if(code.length >= 6) {
        $.ajax({
            url: 'crosscall.php',
            data: {url: "http://api.adaytoshare.be/1/platform/check_code?code=" + code},
            type: 'POST',
            async: false,
            success: function (data) {
                data = JSON.parse(data);
                if(data.success === 1) {
                    events.push(new Event(code, data.album_name));
                    console.log("New event added!")
                } else {
                    console.error(data.error_message);
                    result = false;
                }
            }
        });
        return result;
    } else {
        return false;
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
        var check_code = checkInvalidInput($("#login-code"));
        var check_login = checkInvalidInput($("#login-naam"));
        
        if (check_code && check_login) {
            
            localStorage.setItem("username", $("#login-naam").val());
            localStorage.setItem("events", JSON.stringify(events));
            
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
        if(checkInvalidInput($("#login-code")) && checkInvalidInput($("#login-naam"))) {
            $("#page-login input[type='submit']").animate({color: "#fff", "background-color": "#51b0c5"});
            $("#page-login input[type='submit']").css("cursor", "pointer");
            
        } else {
            $("#page-login input[type='submit']").animate({color: "#f9f9f9", "background-color": "#9a9a9a"});
            $("#page-login input[type='submit']").css("cursor", "default");
        }
    });
    
    $('.formulierTekstbericht').on("submit", function(e){
        e.preventDefault();
        $("body").pagecontainer("change", "#page-newsfeed", {});
    });
    
    
    $("#page-newpost").on("pagecreate", function () {
        console.log("lol");
    });
    
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");