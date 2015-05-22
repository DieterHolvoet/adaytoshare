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
            url: 'crosscall.php',
            data: {url: "http://api.adaytoshare.be/1/guestbook/get_posts?code=" + code + "&limit=" + limit + "&offset=" + offset},
            type: 'POST',
            async: false,
            success: function (data) {
                data = JSON.parse(data);
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
                url: 'crosscall.php',
                data: {url: "http://api.adaytoshare.be/1/platform/check_code?code=" + code},
                type: 'POST',
                async: false,
                success: function (data) {
                    data = JSON.parse(data);
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
        $("body").pagecontainer("change", "#page-login", {});
    });
    
    $("#login-naam, #login-code").on("keyup", function(e) {
        if(checkInvalidInput($("#login-code")) && checkInvalidInput($("#login-naam"))) {
            $("#page-login input[type='submit']").animate({color: "#fff", "background-color": "#51b0c5"});
            $("#page-login input[type='submit']").css("cursor", "pointer");
            $("#page-login input[type='submit']").prop('disabled', false);
            
        } else {
            $("#page-login input[type='submit']").animate({color: "#f9f9f9", "background-color": "#9a9a9a"});
            $("#page-login input[type='submit']").css("cursor", "default");
            $("#page-login input[type='submit']").prop('disabled', true);
        }
    });
    
    $('.formulierTekstbericht').on("submit", function(e){
        e.preventDefault();
        $("body").pagecontainer("change", "#page-newsfeed", {});
    });
    
    
    $("#page-newpost").on("pagecreate", function () {
        console.log("lol");
    });
    
    $("#page-eventlist").on("pagecreate", function () {
        if (!localStorage.getItem('wasVisited')) {
            $("body").append("<div id=\'popup-eventlist\'><div class=\'screen\'></div><p class=\'popup-list\'>Duw op het icoontje om een een nieuwe logincode in te voeren.</p></div>");
            $("#popup-eventlist").on("click", function() {
                $(this).fadeOut(300);
                $(this).remove();
                localStorage.setItem('wasVisited','true');
            });
        }
        $('.background').foggy();
    });
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");