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
               
function checkInvalidInput(element, style) {
    var temp = "";
    
    if($(element).val() === "" || ($(element).attr("name") === "code" && !validateCode($(element).val()))) {
        if(style) {
            $(element).parent().addClass("invalid-input");
            $(element).addClass("invalid-input");
            temp = $(element).attr("placeholder");
            $(element).attr("placeholder", "Ongeldige invoer");
        }
        return false;

    } else {
        if(style) {
            $(element).parent().removeClass("invalid-input");
            $(element).attr("placeholder", temp);
        }
        return true;
    }
}

function validateCode(code) {
    if(new RegExp("^[0-9]{6}$").test(code)) {
        var result = false;
        $.ajax({
            url: "http://api.adaytoshare.be/1/platform/check_code?code=",
            data: {code: code},
            type: 'GET',
            async: false,
            success: function (data) {
                if(data.success === 1) {
                    console.log("Valid platform.")
                    result = true;
                } else {
                    console.error("Error " + data.errorcode + ": " + data.error_message);
                    result = false;
                }
            }
        });
        return result;
    } else {
        return false;
    }
}

function fetchEventData(code, limit, offset) {
    var result = true;
    if(code.length >= 6) {
        $.ajax({
            url: "http://api.adaytoshare.be/1/guestbook/get_posts",
            data: {code: code, limit: limit, offset: offset},
            type: 'GET',
            async: false,
            success: function (data) {
                if(data.success === 1) {
                    events[events.length - 1].messages = data.messages;
                } else {
                    console.error("Error " + data.errorcode + ": " + data.error_message);
                    result = false;
                }
            }
        });
        return result;
    } else {
        return false;
    }
}

function updateStorage() {
    localStorage.setItem("events", JSON.stringify(events));
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
            var code = $("#login-code").val();
            $.ajax({
                url: "http://api.adaytoshare.be/1/platform/check_code?code=",
                data: {code: code},
                type: 'GET',
                async: false,
                success: function (data) {
                    if(data.success === 1) {
                        events.push(new Event(code, data.album_name));
                        fetchEventData(code, 5, 0);
                        console.log("New event added!");
                        updateStorage();
                    } else {
                        console.error(data.error_message);
                        result = false;
                    }
                }
            });
            localStorage.setItem("username", $("#login-naam").val());
            
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
        localStorage.removeItem("events");
        localStorage.removeItem("wasVisited");
        $("body").pagecontainer("change", "#page-login", {});
    });
    
    $("#login-naam, #login-code").on("keyup", function(e) {
        if($(this).val() !== "") {
            checkInvalidInput($(this), true);
            if(checkInvalidInput($("#login-code"), false) && checkInvalidInput($("#login-naam"), false)) {
                $("#page-login input[type='submit']").animate({color: "#fff", "background-color": "#51b0c5"});
                $("#page-login input[type='submit']").css("cursor", "pointer");
                $("#page-login input[type='submit']").prop('disabled', false);

            } else {
                $("#page-login input[type='submit']").animate({color: "#f9f9f9", "background-color": "#9a9a9a"});
                $("#page-login input[type='submit']").css("cursor", "default");
                $("#page-login input[type='submit']").prop('disabled', true);
            }
        }
    });
    
    $('.formulierTekstbericht').on("submit", function(e) {
        e.preventDefault();
        $("body").pagecontainer("change", "#page-newsfeed", {});
    });
    
    
    /*Test voor calc height*/
    var totalheight = $(document).height();
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
    $('.boodschap').height(totalheight - button - header - imgDiv - 10);    
    });
    
    $("#page-eventlist").on("pageshow", function () {
        if (!localStorage.getItem('wasVisited')) {
            $("body").append("<div id=\'popup-eventlist\' style=\'display: none\'> <div class=\'screen\'><div class=\'cutOutPopUp\'> <div class =\'navbarbtn icon-plus'> </div> </div></div><p class=\'popup-list\'>Duw op het icoontje om een een nieuwe logincode in te voeren.</p></div>");
            
            $("#popup-eventlist").fadeIn(300);
            $("#popup-eventlist").on("click", function() {
                $(this).fadeOut(300, function() {
                    $(this).remove();
                });
                localStorage.setItem('wasVisited','true');
            });
        }
        $('.background').foggy();
    });
    
        $("#page-newsfeed").on("pageshow", function () {
        if (!localStorage.getItem('wasVisited2')) {
            $("body").append("<div id=\'popup-newsfeed\' style=\'display: none\'> <div class=\'screen\'></div><p class=\'popup-list\'>Wil je zelf een boodschap met eventueel een foto sturen? Duw op het plus-icoon.</p></div>");
            
            $("#popup-newsfeed").fadeIn(300);
            $("#popup-newsfeed").on("click", function() {
                $(this).fadeOut(300, function() {
                    $(this).remove();
                });
                localStorage.setItem('wasVisited2','true');
            });
        }
        $('.background').foggy();
    });
    
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");