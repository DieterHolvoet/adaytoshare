/* jshint
devel: true,
browser: true,
jquery: true
*/

var events = [], activeNewsfeed, activeMessage, myScroll, refresh, lang;

function setLanguage(language) {
    switch(language) {
        case "dutch":
            lang = {
                name: "Naam",
                code: "Evenementencode",
                login: "Inloggen",
                logout: "Uitloggen",
                add: "Toevoegen",
                send: "Verzenden",
                post: "Posten",
                location: "Locatie",
                website: "Bekijk onze website",
                popup_newsfeed: "Wil je zelf een boodschap met eventueel een foto sturen? Duw dan op het plus-icoon.",
                popup_eventlist: "Duw op het icoontje om een nieuwe evenementencode in te voeren.",
                eventlist: "Evenementenlijst",
                feed: "Berichtenfeed",
                report: "Rapporteer deze boodschap",
                report_desc: "Gelieve mee te geven waarom deze boodschap volgens u ongepast is.",
                new_message: "Nieuw bericht",
                message_desc: "Schrijf hier je boodschap",
                private: "Privé",
                iscroll_pulled: "Laat los om te vernieuwen...",
                iscroll_loading: "Laden...",
                iscroll_reset: "Trek naar beneden om te vernieuwen..."
            }
            break;
            
        case "english":
            lang = {
                name: "Name",
                code: "Event code",
                login: "Login",
                logout: "Logout",
                add: "Add",
                send: "Send",
                post: "Post",
                location: "Location",
                website: "Visit our website",
                popup_newsfeed: "Press the plus icon to send a message yourself - optionally with a picture.",
                popup_eventlist: "Press the icon to enter a new event code.",
                eventlist: "Event list",
                feed: "Newsfeed",
                report: "Report this message",
                report_desc: "Please provide a reason why you think this message is inappropriate.",
                new_message: "New message",
                message_desc: "Write your message here",
                private: "Private",
                iscroll_pulled: "Let go to refresh...",
                iscroll_loading: "Loading...",
                iscroll_reset: "Pull down to refresh..."
            }
            break;
            
        case "french":
            lang = {
                name: "Nom",
                code: "Code d'événement",
                login: "Se connecter",
                logout: "Se déconnecter",
                add: "Ajouter",
                send: "Envoyer",
                post: "Poster",
                location: "Location",
                website: "Visitez notre site web",
                popup_newsfeed: "Appuyez sur l'icône 'plus' pour envoyer un message vous-même - éventuellement avec une photo.",
                popup_eventlist: "Appuyez sur l'icône pour entrer un nouveau code de l'événement.",
                eventlist: "Liste des événements",
                feed: "Fil d'actualité",
                report: "Signaler ce message",
                report_desc: "S'il vous plaît fournir une raison pourquoi vous pensez que ce message est inapproprié.",
                new_message: "Nouveau message",
                message_desc: "Votre message ici",
                private: "Privé",
                iscroll_pulled: "Lâchez pour rafraîchir ...",
                iscroll_loading: "Chargement ...",
                iscroll_reset: "Tirez pour rafraîchir ..."
            }
            break;
            
        default:
            console.error("Wrong language string");
            break;
    }
}

// Storage leegmaken
var emptyStorage = function() {
    localStorage.removeItem("username");
    localStorage.removeItem("events");
    localStorage.removeItem("wasVisited");
    localStorage.removeItem("wasVisited2");

    events = [];
    activeNewsfeed = "";
    activeMessage = "";
}

function Event(code, name, cover) {
    this.code = "";
    this.code = code;
    this.name = "";
    this.name = name;
    this.cover = "";
    this.cover = cover;
    this.myLikes = [];
}

if (localStorage.getItem("events")) {
    events = JSON.parse(localStorage.getItem("events"));
}

if (localStorage.getItem("language")) {
    setLanguage(localStorage.getItem("language"));
    
} else {
    localStorage.setItem("language", "dutch");
    setLanguage("dutch");
}
               
function checkInvalidInput(element, style) {
    var temp = "";
    
    if ($(element).val() === "" || ($(element).attr("name") === "code" && !validateCode($(element).val()))) {
        if (style) {
            $(element).parent().addClass("invalid-input");
            $(element).addClass("invalid-input");
            temp = $(element).attr("placeholder");
            $(element).attr("placeholder", "Ongeldige invoer");
        }
        return false;

    } else {
        if (style) {
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
                if (data.success === 1) {
                    console.log("Valid platform.");
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
    if (code.length >= 6) {
        $.ajax({
            url: "http://api.adaytoshare.be/1/guestbook/get_posts",
            data: {code: code, limit: limit, offset: offset},
            type: 'GET',
            async: false,
            success: function (data) {
                if(data.success === 1) {
                    for (var i = 0; i < data.messages.length; i++) {
                        data.messages[i].likes = parseInt(data.messages[i].likes);
                    }
                    events[getEventIndex(code)].messages = data.messages;
                    updateStorage();
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
    $("#page-eventlist .ui-content > a").remove();
    for(var i = 0; i < events.length; i++) {
        $("#page-eventlist .ui-content .logout").before("<a href=\'#page-newsfeed\' data-transition=\'slide\' data-ripple id=\'"
                                                + events[i].code + "\'>"
                                                + "<article class=\'event\'><div class=\'background\' style=\'background-image: url(" 
                                                + events[i].cover + ")\'></div>"
                                                + "<h2>" + events[i].name + "</h2>"
                                                + "<footer><time>" + "20 mei 2015" + "</time>"
                                                + "<span class=\'evt-photos\'>" + "103" + "</span>"
                                                + "<span class=\'evt-people\'>" + "80" + "</span>"
                                                + "</footer></article></a>");
    }
    $(".background").foggy()
}

function loadNewsfeed(code) {
    console.log("Loading newsfeed: " + code);
    var content;
    if($("#page-newsfeed .iscroll-scroller").length) {
        content = "#page-newsfeed .ui-content .iscroll-content";
        $(content).empty();
        
    } else {
        content = "#page-newsfeed .ui-content";
        $(content).children(".eventHeader, #newsfeed-list").remove();
        
    }
    
    if(code === undefined) {
        console.error("No code specified");
        return false;
    }
    
    var index = getEventIndex(code);    
    $(content).append("<section class=\'eventHeader\'><div class=\'eventBackground\' style=\'background-image: url(" 
                                                + events[index].cover + ")\'></div><h1>" + events[index].name + "</h1>"
                                            + "<h2><span class=\'icon-pin56\'></span>" + lang.location
                                            + "<span class=\'icon-multiple25 spanHeaderRight\'>" + "108" + "</span>"
                                            + "<span class=\'icon-mail87 spanHeaderRight\'>" + "20" + "</span></h2></section>"
                                            + "<div id=\'newsfeed-list\'></div>");
    
    $('.eventHeader .eventBackground').foggy();
    var messages = events[index].messages;
    for(var i = 0; i <  messages.length; i++) {
        var date = new Date(messages[i].timestamp * 1000);
        $(content).children("#newsfeed-list").append("<article class=\'boodschapFeed clearfix\' data-enhance=\'false\' id=\'" + messages[i].messageID + "\'>"
                                                           + "<div>" + messages[i].from.charAt(0).toUpperCase() + "</div>"
                                                           + "<h1>" + messages[i].from + "</h1>"
                                                           + "<time>" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2) + "</time>"
                                                           + "<p>" + messages[i].message + "</p>"
                                                           + (messages[i].photoURL !== "" ? ("<img src=\'" + messages[i].photoURL + "\' alt=\'foto post\'>") : "")
                                                           + "<footer class=\'clearfix\'><span class=\'icon-wine65 partypoints\'>"
                                                           + messages[i].likes + " Party points" + "</span>"
                                                           + "<span class=\'icon-warning34 spanHeaderRight reportT\'></span>"
                                                           + "<span class=\'icon-chat110 spanHeaderRight comment\'>" + messages[i].comments.length + "</span>"
                                                           + "<form class=\'commentField\'><textarea></textarea><button>" + lang.post + "</button></form></footer></article>");
        for(var j = 0; j < messages[i].comments.length; j++) {
            var comments = messages[i].comments[j];
            $(".commentField:last").prepend("<div class=\'comment-entry\'>"
                                       + "<span class=\'comment-name\'>" + (comments.from.length ? (comments.from) : "<i>Geen naam</i>") + "</span>"
                                       + "<span class=\'comment-message\'>" + comments.message + "</span>"
                                       + "</div>");
        }
    }
    $("#newsfeed-list").css({"min-height": $(document).height() - 60 - $(".eventHeader").height()});
    activeNewsfeed = code;
    loadLikes();
    elasticize($("textarea"));
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

    $.ajax({
        url: "http://api.adaytoshare.be/1/guestbook/like",
        data: {code: activeNewsfeed, messageID: messageID},
        type: 'POST',
        async: false,
        success: function (data) {
            if(data.success === 1) {
                console.log("Post succesvol geliked!")
            } else {
                console.error(data.error_message);
                result = false;
            }
        }
    });
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
                    $(elem).text(messages[getMessageIndex(activeNewsfeed, messages[i].messageID)].likes + " Party points");
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
    if(code === "123123") {
        name = "Integration Show";
        cover = "show.png";
    }
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) return false;
    }
    events.push(new Event(code, name, cover));
    fetchEventData(code, 5, 0);
    console.log("New event added");
}

function checkDuplicateEvent(code) {
    for(var i = 0; i < events.length; i++) {
        if(events[i].code === code) return false;
    }
    return true;
}

function updateStorage() {
    localStorage.setItem("events", JSON.stringify(events));
}

function resetCamera() {
    $('.nieuwBerichtBackground').foggy({blurRadius: 5});
    $(".choiseCameraOrImport").show();
    $("#defImg").attr("src", "img/nieuwBerichtBackground.jpg");
    $(".boodschap").val("");
}

function reportMessage(code, messageID, message) {
    $.ajax({
        url: "http://api.adaytoshare.be/1/guestbook/report",
        data: {code: code, messageID: messageID, message: message},
        type: 'POST',
        async: false,
        success: function (data) {
            if(data.success === 1) {
                console.log("Bericht succesvol gerapporteerd.")
                result = true;
                
            } else {
                console.error(data.error_message);
                result = false;
            }
        }
    });
    return result;
}

function sendComment(code, messageID, from, message) {
    $.ajax({
        url: "http://api.adaytoshare.be/1/guestbook/comment",
        data: {code: code, messageID: messageID, from: from, message: message},
        type: 'POST',
        async: false,
        success: function (data) {
            if(data.success === 1) {
                console.log("Reactie succesvol geplaatst.")
                result = true;
                
            } else {
                console.error(data.error_message);
                result = false;
            }
        }
    });
    return result;
}


$(document).ready(function() {
    refresh = function() {
        setTimeout(function(){
            $('#newsfeed-wrapper').iscrollview("refresh");
        },100);
    }
    window.refresh = refresh;
    
    // Event handlers
    $('body').on('tap', '.closeLink', function() {
        resetCamera();
    });
    
    $('body').on('tap', '.comment', function() {
        $(this).next().slideToggle();
        refresh();
    });

    $('body').on('tap', '.partypoints', function() {
        var messageID = $(this).parent().parent().attr("id");
        var n = $(this).text().replace(" Party points", "");
        if($(this).attr("pp") !== "true") {
            $(this).addClass('magictime boingInUp');
            updateLikes($(this).parent().parent());
            fetchEventData(activeNewsfeed, events[getEventIndex()].messages.length, 0);
            $(this).text(events[getEventIndex()].messages[getMessageIndex(activeNewsfeed, messageID)].likes + " Party points");
            $(this).css( "color", "#489CAF");
            $(this).attr("pp", true);
        }
    });
    
    $("body").on("tap", ".logout", function() {
        emptyStorage();
        document.location = "index.html";
    });

    $("body").on("tap", ".event", function() {
        loadNewsfeed($(this).parent().attr("id"));
    });
    
    $('body').on("tap", ".reportT", function() {
        activeMessage = $(this).parent().parent().attr("id");
        $('.report').fadeIn( "fast" );
        $('.fab').css('display', 'none');
        elasticize($(".report input"));
    });

    $('body').on("tap", ".reportBackground", function() {
        $('.report').fadeOut( "fast" );
        $('.fab').css('display', 'block');
    });

    $('body').on("tap", ".report button", function() {
        if($(".report input").val()) {
            reportMessage(activeNewsfeed, activeMessage, $(".report input").val());
            $(".report input").val("");
            
            $('.report').fadeOut( "fast" );
            $('.fab').css('display', 'block');
        }
    });

    $('body').on("tap", ".commentField button", function(e) {
        e.preventDefault();
        var comment = $(this).prev().val();
        var messageID = $(this).parent().parent().parent().attr("id");
        if(comment !== "") {
            if(sendComment(activeNewsfeed, messageID, localStorage.getItem("username"), comment)) {
                $(this).parent().prepend("<div class=\'comment-entry\'>"
                                           + "<span class=\'comment-name\'>" + localStorage.getItem("username") + "</span>"
                                           + "<span class=\'comment-message\'>" + $(this).prev().val() + "</span>"
                                           + "</div>");
                $(this).parent().prev().text(parseInt($(this).parent().prev().text()) + 1);
                $(this).prev().val("");
                refresh();
            }
        }
    });
    
    $('body').on('blur', '.commentField', function() {
        refresh();
    });
    
    $('body').on('focusout', '.commentField', function() {
        refresh();
    });
    
    document.addEventListener('focusout', function(e) {refresh()});
    
    $('body').on('tap', '.active', function() {
        $(".language_inactive").slideToggle();
    });
    
    $('body').on('tap', '.inactive', function() {
        var inactiveClass = $(this).attr('class').replace("language inactive ", ""),
            activeClass = $(".active").attr("class").replace("language active ", ""),
            that = $(".active");
        
        localStorage.setItem("language", inactiveClass);
        switch(inactiveClass) {
            case "dutch":
                setLanguage("dutch");
                break;
            case "french":
                setLanguage("french");
                break;
            case "english":
                setLanguage("english");
                break;
        }
        
        $("#login-naam").attr("placeholder", lang.name);
        $("#login-code").attr("placeholder", lang.code);
        $("#page-login input[type='submit']").val(lang.login);
        $(".website a").text(lang.website);
        
        $(".report h1").text(lang.report);
        $(".report p").text(lang.report_desc);
        $(".report button").text(lang.send);
        $("#page-newsfeed > header h1").text(lang.feed);
        $("#page-eventlist > header h1").text(lang.eventlist);
        $("#page-newpost > header h1").text(lang.new_message);
        $(".formulierTekstbericht textarea").attr("placeholder", lang.message_desc);
        $(".sliderPrive").contents().filter(function() { return this.nodeType === 3; })[0].textContent = lang.private + " ";
        $(".verzendButton").val(lang.send);
        $(".logout").text(lang.logout);
        $(".closeEventCode").text(lang.add);
        
        $(".iscroll-pull-label").attr("data-iscroll-loading-text", lang.iscroll_loading);
        $(".iscroll-pull-label").attr("data-iscroll-pulled-text", lang.iscroll_pulled);
        $(".iscroll-pull-label").text(lang.iscroll_reset);
        
        $(that).attr("class", "language active " + inactiveClass);
        $(this).attr("class", "language inactive " + activeClass);
        
        $(".language_inactive").slideUp();
        console.log("Language is " + localStorage.getItem("language"));
    });
    
    // Initialisatie van de pagina
    if(localStorage.getItem("username") && localStorage.getItem("events")) {
        if(events.length > 1) {
            window.location.hash = "page-eventlist";
        } else {
            loadNewsfeed(events[0].code);
            window.location.hash = "page-newsfeed";
        }
        
    } else {
        emptyStorage();
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
                setTimeout(function () {
                    myScroll = new iScroll("newsfeed-wrapper", {});
                    loadNewsfeed(code);
                    $("body").pagecontainer("change", "#page-newsfeed", {});
                }, 100);
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
        
        $(document).on("iscroll_onscrollend", function(event, data) {
            var elem = $("[data-iscroll]").iscrollview();
            console.log(elem.iscrollview('y') === (elem.iscrollview('maxScrollY')));
            if(elem.iscrollview('y') === (elem.iscrollview('maxScrollY'))) {
                loadMoreNewsfeed();
                data.iscrollview.refresh();
            }
        });
    });
    
    // Nieuwsfeed
    $("#page-login").on("pagebeforeshow", function () {
        // vw & vh fallback
        $(".logo").height($(document).height() / 4);
        $(".logo").css({"padding-top": ($(document).height() / 100) * 15, "padding-bottom": $(document).height() / 10});
    });
    
    $("#page-newsfeed").on("pageshow", function () {
        refresh();
        if (!localStorage.getItem('wasVisited2')) {
            $("body").append("<div id=\'popup-newsfeed\' style=\'display: none\'> <div class=\'screen\'></div><p class=\'popup-list2\'>" + lang.popup_newsfeed + "</p></div>");
            
            $("#popup-newsfeed").fadeIn(300);
            $("#popup-newsfeed").on("click", function() {
                $(this).fadeOut(300, function() {
                    $(this).remove();
                });
                localStorage.setItem('wasVisited2','true');
            });
        }
    });
    
    // Evenementenlijst
    var open = false;
    $("#page-eventlist").on("pagebeforeshow", function () {
        loadEvents();
        $('.nieuwBerichtBackground').foggy({blurRadius: 5});
        $("#page-eventlist .ui-content").css("min-height", $(document).height() - 100);
    });
    
    $("#addEvent").on("tap", function() {
        if(open) {
            $(".eventCodeToevoegen").slideDown("fast");
            $("#addEvent").css("transform", "rotate(45deg)");
            open = false;

        } else {
            $(".eventCodeToevoegen").slideUp("fast");
            $("#addEvent").css("transform", "rotate(0deg)");
            open = true;
        }
    });

    $("#closeEventCode").on("tap", function() {
        var $input = $("input[name='eventCode']");
        var code = $input.val();
        
        if(validateCode(code) && checkDuplicateEvent(code)) {
            $input.css({"color": "inherit"});
            $.ajax({
                url: "http://api.adaytoshare.be/1/platform/check_code",
                data: {code: code},
                type: 'GET',
                async: false,
                success: function (data) {
                    if(data.success === 1) {
                        $(".eventCodeToevoegen").slideUp("fast");
                        open = false;
                        $("#addEvent").css("transform", "rotate(0deg)");
                        addEvent(code, data.album_name, data.album_banner);
                    
                    } else {
                        console.error(data.error_message);
                        result = false;
                    }
                }
            });
        } else {
            $input.css({"color": "#e84746"});
        }
    });

    $("#page-eventlist").on("pageshow", function () {
        if (!localStorage.getItem('wasVisited')) {
            $("body").append("<div id=\'popup-eventlist\' style=\'display: none\'> <div class=\'screen\'><div class=\'cutOutPopUp\'> <div class =\'navbarbtn icon-plus'> </div> </div></div><p class=\'popup-list\'>" + lang.popup_eventlist + "</p></div>");
            $("#popup-eventlist").fadeIn(300);
            $("#popup-eventlist").on("click", function() {
                $(this).fadeOut(300, function() {
                    $(this).remove();
                });
                localStorage.setItem('wasVisited','true');
            });
        }
    });
    
    /*Calc height voor nieuwsberichtpagina*/
    var totalheight = screen.availHeight;
    if(/android/i.test(navigator.userAgent)) totalheight /= devicePixelRatio;
    else if(/(iphone)|(ipad)/i.test(navigator.userAgent)) totalheight = screen.height;
    
    //We nemen de hoogte van het sreen dit is dubbel d eigenlijke hoogte dus we delen dit door de pixelratio die 2 is
    $('#page-newpost').on("pageshow", function() {
        
        var imgDiv = $('.nieuwBerichtBackground').height(),
            header = $('#headerNewPost').height(),
            button = $('.verzendButton').height();

        if(/android/i.test(navigator.userAgent)){
            $('.boodschap').height(totalheight - button - header - imgDiv - 35.666666666);
        } else if(/(iphone)|(ipad)/i.test(navigator.userAgent)) {
            $('.boodschap').height(totalheight - button - header - imgDiv - 10);
        }
        
        var pictureSource,      // picture source
            destinationType;    // sets the format of returned value 

        // Wait for Cordova to connect with the device
        document.addEventListener("deviceready", onDeviceReady, false);

        // Cordova is ready to be used!
        function onDeviceReady() {
            document.getElementById("takePicture").onclick = takePicture;
            document.getElementById("gallery").onclick = getPicture;
        }

        function takePicture(e) {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 49,
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation: true,
                targetWidth: 640,
                targetHeight: 640
            });
        }

        function getPicture(e) {
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 49,
                destinationType: navigator.camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation: true,
                targetWidth: 640,
                targetHeight: 640
            });
        }

        function onSuccess(imageData) {
            window.imageData = imageData;
            
            /*Functie android crop rights reserved Ben De Greef*/
            if(/android/i.test(navigator.userAgent)) {
            var canvas = document.getElementById("canvas"),
                context = canvas.getContext("2d"),
                imageObj = document.getElementById("myImage"),
                width;

            imageObj.src = "data:image/jpeg;base64," + imageData;
            width = imageObj.width; //breedte van afbeelding nemen
            canvas.setAttribute('width', width); //canvas breedte instellen
            canvas.setAttribute('height', width); //canvas hoogte instellen
            context.drawImage(imageObj, 0, 0, width, width, 0, 0, width, width); //afbeelding tekenen
            var dataURL = canvas.toDataURL(); //dataURL vullen 
            document.getElementById("defImg").setAttribute('crossOrigin', 'anonymous');
            document.getElementById("defImg").src = dataURL; //afbeelding toekennen
            }
            else if(/(iphone)|(ipad)/i.test(navigator.userAgent)) {
                var image = document.getElementById('defImg');
                image.src = "data:image/jpeg;base64," + imageData;
            }
            
            // rights reserved Dieter Holvoet jwz
            $('.nieuwBerichtBackground').foggy(false);
            $(".choiseCameraOrImport").hide();
        }

        function onFail(message) {
            setTimeout(function() {
                //alert('Failed because: ' + message);
            }, 0);
        }
        
        var busy;
        
        function sendPost() {
            if(!busy) {
                busy = true;
                var hasImage = $("#defImg").attr("src") !== "img/nieuwBerichtBackground.jpg",
                    hasMessage = $(".boodschap").val() !== "",
                    isPrivate = $(".sliderPrive input")[0].checked,
                    result = false;
                
                if(hasImage) {
                    var data = {
                        code: activeNewsfeed,
                        from: localStorage.getItem("username"),
                        photo: window.imageData
                    }
                    if(hasMessage) data.message = $(".boodschap").val();
                    if(isPrivate) data.public = 0;
                    
                    $.ajax({
                        url: "http://api.adaytoshare.be/1/guestbook/post_with_media_base64",
                        data: data,
                        dataType: 'json',
                        type: 'POST',
                        async: false,
                        success: function (data) {
                            if (data.success === 1) {
                                console.log("Post sent successfully.");
                                result = true;
                            } else {
                                console.error("Error " + data.errorcode + ": " + data.error_message);
                                result = false;
                            }
                        }
                    });

                } else if(hasMessage) {
                    var sendData = {
                        code: activeNewsfeed,
                        from: localStorage.getItem("username"),
                        message: $(".boodschap").val()
                    };
                    if(isPrivate) sendData.public = 0;
                    
                    $.ajax({
                        url: "http://api.adaytoshare.be/1/guestbook/post",
                        data: sendData,
                        type: 'POST',
                        async: false,
                        success: function (data) {
                            if (data.success === 1) {
                                console.log("Message sent successfully.");
                                result = true;
                            } else {
                                console.error("Error " + data.errorcode + ": " + data.error_message);
                                result = false;
                            }
                        }
                    });

                } else {
                    console.error("No message or image provided.");
                    result = false;
                }
                
                busy = false;
                
                if(result) {
                    resetCamera();
                    loadNewsfeed(activeNewsfeed);
                    $("body").pagecontainer("change", "#page-newsfeed", {});
                } else {
                    return false;
                }
            }
        }
        
        $("body").on("tap", ".verzendButton", sendPost);
    });
});