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

$(document).ready(function() {
    
    $("#loginform").on("submit", function(e) {
        e.preventDefault();

        var t_name = $("#login-naam").val();    // Waarde v.h. naam-veld
        var t_code = $("#login-code").val();    // Waarde v.h. code-veld
        
        if(t_name === "") {
            $(".icon-user185").addClass("invalid-input");
            console.log("a");
            return false;
        }
        
        if(t_code === "") {
            $(".icon-locked59").addClass("invalid-input");
            console.log("b");
            return false;
        }
        
        $(".icon-user185:before").removeClass("invalid-input");
        $(".icon-locked59:before").removeClass("invalid-input");

        localStorage.setItem("username", $("#login-name").value);
        events[0] = new Event(t_code);
    });
    
    $("#login-naam, #login-code").on("keydown", function(e) {
        if($(this).val() === "") {
            $(this).parent().addClass("invalid-input");
            $(this).addClass("invalid-input");
            $(this).attr("placeholder", "Gelieve iets in te vullen")
            console.log("a");
        } else {
            $(this).parent().removeClass("invalid-input");
        }
    });
    
//    if(!localStorage.getItem("username")) {
//        $("body").pagecontainer("change", "#page-login", {});
//        
//    } else {
//        $("body").pagecontainer("change", "#page-login", {});
//    }
//    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");