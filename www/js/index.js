/* jshint
devel: true,
browser: true,
jquery: true
*/

var events = [], activeNewsfeed, myScroll;

setTimeout(function () {
    myScroll = new iScroll("newsfeed-wrapper", {});
}, 100);

function Event(code, name, cover) {
    this.code = "";
    this.code = code;
    this.name = "";
    this.name = name;
    this.cover = "";
    this.cover = cover;
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
            url: "http://api.adaytoshare.be/1/platform/check_code",
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
                    for(var i = 0; i < data.messages.length; i++) {
                        data.messages[i].likes = parseInt(data.messages[i].likes);
                    }
                    events[getEventIndex(code)].messages = data.messages;
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
                                                + "<article class=\'event\'><div class=\'background\' style=\'background-image: url(" 
                                                + events[i].cover + ")\'></div>"
                                                + "<h2>" + events[i].name + "</h2>"
                                                + "<footer><time>" + "20 mei 2015" + "</time>"
                                                + "<span class=\'evt-photos\'>" + "103" + "</span>"
                                                + "<span class=\'evt-people\'>" + "80" + "</span>"
                                                + "</footer></article></a>");
    }
}

function loadNewsfeed(code) {
    var content;
    if($("#page-newsfeed .iscroll-scroller").length) {
        content = "#page-newsfeed .ui-content .iscroll-content";
        $(content).empty();
        
    } else {
        content = "#page-newsfeed .ui-content";
    }
    
    if(code === undefined) {
        console.error("No code specified");
        return false;
    }
    
    var index = getEventIndex(code);
    
    $(content).append("<section class=\'eventHeader\'><div class=\'eventBackground\' style=\'background-image: url(" 
                                                + events[index].cover + ")\'></div><h1>" + events[index].name + "</h1>"
                                            + "<h2><span class=\'icon-pin56\'></span>" + "Locatie"
                                            + "<span class=\'icon-multiple25 spanHeaderRight\'>" + "108" + "</span>"
                                            + "<span class=\'icon-mail87 spanHeaderRight\'>" + "20" + "</span></h2></section>"
                                            + "<div id=\'newsfeed-list\'></div>"
                                            + "<div class=\'fab\'><span class=\'icon-plus\'></span></div>");
    
//    if($("#page-newsfeed .iscroll-scroller").length) $("#page-newsfeed .iscroll-content .iscroll-pulldown").remove();
    $('.eventHeader .eventBackground').foggy();
    var messages = events[index].messages;
    for(var i = 0; i <  messages.length; i++) {
        var date = new Date(messages[i].timestamp * 1000);
        $(content).children("#newsfeed-list").append("<article class=\'boodschapFeed clearfix\' data-enhance=\'false\' id=\'" + messages[i].messageID + "\'>"
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
    
    activeNewsfeed = code;
    loadLikes();
    elasticize($("textarea"));
    
    $(".comment").on("tap", function() {
        $(this).next().slideToggle();
    });

    $(".partypoints").on("click", function() {
        var messageID = $(this).parent().parent().attr("id");
        var n = $(this).text().replace(" Party points", "");
        if($(this).attr("pp") !== "true") {
            $(this).addClass('magictime boingInUp');
            updateLikes($(this).parent().parent());
            fetchEventData(activeNewsfeed, events[getEventIndex()].messages.length, 0);
            events[getEventIndex()].messages[getMessageIndex(activeNewsfeed, messageID)].likes += 1; // Tijdelijke fix
            $(this).text(events[getEventIndex()].messages[getMessageIndex(activeNewsfeed, messageID)].likes + " Party points")
            $(this).css( "color", "#489CAF");
            $(this).attr("pp", true);
        }
    });
}

function loadMoreNewsfeed() {
    fetchEventData(activeNewsfeed, 5 + events[getEventIndex()].messages.length, 0);
    loadNewsfeed(activeNewsfeed);
    refresh();
}

function updateNewsfeed() {
    fetchEventData(activeNewsfeed, events[getEventIndex()].messages.length, 0);
    loadNewsfeed(activeNewsfeed);
    refresh();
}

function refresh() {
    $("[data-iscroll]").iscrollview().iscrollview('refresh');
}

// Krijg de index van een evenement in het events-object
function getEventIndex(code) {
    if(arguments.length === 0) code = activeNewsfeed;
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) return i;
    }
}

// Krijg de index van een evenement in het events-object
function getMessageIndex(code, messageID) {
    for(var i = 0; i < events[getEventIndex(code)].messages.length; i++) {
        if(events[getEventIndex(code)].messages[i].messageID === messageID) return i;
    }
}

// Stuur een request om een post te liken, indien deze nog niet eerder geliked is
function updateLikes(elem) {
    var messageID = events[getEventIndex()].messages[$(".boodschapFeed").index(elem)].messageID,
        alreadyLiked = false,
        myLikes;
    
    if(events[getEventIndex()].myLikes === undefined){
        events[getEventIndex()].myLikes = [];
    } else {
        myLikes = events[getEventIndex()].myLikes;
    }  

    for(var i = 0; i < myLikes.length; i++) {
        if(myLikes[i] === messageID) return false;
    }
    
    events[getEventIndex()].myLikes.push(messageID);
    updateStorage();

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
    if(events[getEventIndex()].myLikes !== undefined) {
        var messages = events[getEventIndex()].messages,
            myLikes = events[getEventIndex()].myLikes;
        for(var i = 0; i < messages.length; i++) {
            for(var j = 0; j < myLikes.length; j++) {
                if(messages[i].messageID === myLikes[j]) {
                    var elem = ".boodschapFeed:eq(" + i + ") .partypoints";
                    $(elem).css("color", "#489CAF");
                    $(elem).attr("pp", true);
                }
            }
        }
    } else {
        for(var i = 0; i < messages.length; i++) {
            var elem = ".boodschapFeed:eq(" + i + ") .partypoints";
            $(elem).css("color", "inherit");
            $(elem).attr("pp", false);
        }
    }
    
}

// Add new event to the events object
function addEvent(code, name, cover) {
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) return false;
    }
    events.push(new Event(code, name, cover));
    fetchEventData(code, 5, 0);
    updateStorage();
    console.log("New event added");
}

function updateStorage() {
    localStorage.setItem("events", JSON.stringify(events));
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
    
    // Loginpagina
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
                        addEvent(code, data.album_name, data.album_banner);
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
    
    // Nieuwe post-pagina
    $("#page-newpost").on("pageshow", function () {
        console.log("lol");
    });
    
    // Nieuwsfeed
    $("#page-newsfeed").on("pagebeforeshow", function () {
        var pullDownEl = $(".iscroll-pulldown"),
            pullDownLabel = $(".iscroll-pulldown .iscroll-pull-label"),
            pullDownOffset = pullDownEl.height();        
        
        $(document).on("iscroll_onpulldown", function(event, data) {
            console.log("loading");
            pullDownEl.find(".spinner").removeClass("slow");
            pullDownEl.find(".spinner").addClass("normal");
            updateNewsfeed();
            data.iscrollview.refresh();
            // setTimeout(function() {data.iscrollview.refresh();}, 3000);
        });
        
        $(document).on("iscroll_onpulldownreset", function() {
            console.log("reset");
            pullDownEl.find(".spinner").removeClass("normal");
            pullDownEl.find(".spinner").addClass("slow");
        });
//        myScroll.scrollToElement(".eventHeader");
    });
    
    $("#page-newsfeed").on("pageshow", function () {
        refresh();
        myScroll.scrollToElement(".eventHeader");
        
        $(window).scroll(function() {
            var elem = $("[data-iscroll]").iscrollview();
           if(elem.iscrollview('y') > (elem.iscrollview('maxScrollY') - 300)) {
               loadMoreNewsfeed();
               refresh();
           }
        });
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
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");