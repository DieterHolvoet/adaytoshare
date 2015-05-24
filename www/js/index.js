/* jshint
devel: true,
browser: true,
jquery: true
*/

var events = [], activeNewsfeed;

function Event(code, name) {
    this.code = "";
    this.code = code;
    this.name = "";
    this.name = name;
    this.cover = "";
    this.myLikes = [];
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

function loadEvents() {
    for(var i = 0; i < events.length; i++) {
        $("#page-eventlist .ui-content").append("<a href=\'#page-newsfeed\' data-transition=\'slide\' data-ripple id=\'"
                                                + events[i].code + "\'>"
                                                + "<article class=\'event\'><div class=\'background\'></div>"
                                                + "<h2>" + events[i].name + "</h2>"
                                                + "<footer><time>" + "20 mei 2015" + "</time>"
                                                + "<span class=\'evt-photos\'>" + "103" + "</span>"
                                                + "<span class=\'evt-people\'>" + "80" + "</span>"
                                                + "</footer></article></a>");
    }
}

function loadNewsfeed(code) {
    if(code === undefined) {
        console.error("No code specified");
        return false;
    }
    
    $("#page-newsfeed .ui-content").empty();
    var index;
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) index = i;
    }
    console.log(index);
    $("#page-newsfeed .ui-content").prepend("<section class=\'eventHeader\'><div class=\'eventBackground\'></div><h1>" + events[index].name + "</h1>"
                                            + "<h2><span class=\'icon-pin56\'></span>" + "Locatie"
                                            + "<span class=\'icon-multiple25 spanHeaderRight\'>" + "108" + "</span>"
                                            + "<span class=\'icon-mail87 spanHeaderRight\'>" + "20" + "</span></h2></section>");
    
    $('.eventHeader .eventBackground').foggy();
    var messages = events[index].messages;
    for(var i = 0; i <  messages.length; i++) {
        var date = new Date(messages[i].timestamp * 1000);
        $("#page-newsfeed .ui-content .eventHeader").after("<article class=\'boodschapFeed clearfix\' data-enhance=\'false\'>"
                                                           + "<div>" + messages[i].from.charAt(0).toUpperCase() + "</div>"
                                                           + "<h1>" + messages[i].from + "</h1>"
                                                           + "<time>" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + "</time>"
                                                           + "<p>" + messages[i].message + "</p>"
                                                           + (messages[i].photoURL !== "" ? ("<img src=\'" + messages[i].photoURL + "\' alt=\'foto post\'>") : "")
                                                           + "<footer><span class=\'icon-wine65 partypoints\'>"
                                                           + messages[i].likes + " Party points" + "</span>"
                                                           + "<span class=\'icon-warning34 spanHeaderRight\'></span>"
                                                           + "<span class=\'icon-chat110 spanHeaderRight comment\'>" + messages[i].comments.length + "</span>"
                                                           + "<form class=\'commentField\'><textarea></textarea><button>Post</button></form></footer></article>");
    }
    
    elasticize($("textarea"));
    
    $(".comment").on("click", function() {
        $(this).next().slideToggle("fast");
    });

    $(".partypoints").on("click", function() {
        var n = $(this).text().replace(" Party points", "");
        
        if($(this).attr("pp") !== "true") {
            $(this).addClass('magictime boingInUp');
            n++;
            updateLikes($(this).parent().parent());
            $(this).css( "color", "#489CAF");
            $(this).attr("pp", true);

        } else {
            // Nog geen un-like-functionaliteit aanwezig in de API
//            n--;
//            updateLikes(index);
//            $(this).css( "color", "black");
//            $(this).attr("pp", false);
        }
    });
    
    activeNewsfeed = code;
}

// Krijg de index van het huidige evenement in het events-object
function getEventIndex() {
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === activeNewsfeed) return i;
    }
}

// Stuur een request om een post te liken, indien deze nog niet eerder geliked is
function updateLikes(elem) {
    console.log(elem);
    var messageID = events[getEventIndex()].messages[$(".boodschapFeed").index(elem)].messageID,
        myLikes = events[getEventIndex()].myLikes;
        alreadyLiked = false;
    
    for(var i = 0; i < myLikes.length; i++) {
        if(myLikes[i] === messageID) return false;
    }
    
    myLikes.push(messageID);
//    $.ajax({
//        url: "http://api.adaytoshare.be/1/platform/like",
//        data: {code: activeNewsfeed, messageID: messageID},
//        type: 'POST',
//        async: false,
//        success: function (data) {
//            if(data.success === 1) {
//
//            } else {
//                console.error(data.error_message);
//                result = false;
//            }
//        }
//    });
}

// Load the previously liked posts back in the interface
function loadLikes() {
    var messages = events[getEventIndex()].messages,
        myLikes = events[getEventIndex()].myLikes;
    for(var i = 0; i < messages.length; i++) {
        for(var j = 0; j < myLikes.length; j++) {
            console.log(messages[i].messageID, myLikes[j])
            if(messages[i].messageID === myLikes[j]) {
                var elem = ".boodschapFeed:eq(" + i + ") .partypoints";
                $(elem).css("color", "#489CAF");
                $(elem).attr("pp", true);
            }
        }
    }
}

// Add new event to the events object
function addEvent(code, name) {
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) return false;
    }
    events.push(new Event(code, name));
    fetchEventData(code, 5, 0);
    localStorage.setItem("events", JSON.stringify(events));
    console.log("New event added");
}

$(document).ready(function() {

    // Initialisatie van de pagina    
    if(localStorage.getItem("username")) {
        if(events.length > 1) {
            window.location.hash = "page-eventlist";
        } else {
            loadNewsfeed(events[0].code);
            window.location.hash = "page-newsfeed";
        }
        
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
                url: "http://api.adaytoshare.be/1/platform/check_code",
                data: {code: code},
                type: 'GET',
                async: false,
                success: function (data) {
                    if(data.success === 1) {
                        addEvent(code, data.album_name);
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
                loadNewsfeed(events[0].code);
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
    
    $(".event").on("click", function() {
        loadNewsfeed($(this).parent().attr("id"));
        $("body").pagecontainer("change", "#page-newsfeed", {});
    })
    
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
    
    
    $("#page-newpost").on("pageshow", function () {
        console.log("lol");
    });
    
    // Evenementenlijst
    $("#page-eventlist").on("pagecreate", function () {
        loadEvents();
    });
                            
    $("#page-eventlist").on("pageshow", function () {
        if (!localStorage.getItem('wasVisited')) {
            $("body").append("<div id=\'popup-eventlist\' style=\'display: none\'><div class=\'screen\'></div><p class=\'popup-list\'>Duw op het icoontje om een een nieuwe logincode in te voeren.</p></div>");
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
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");