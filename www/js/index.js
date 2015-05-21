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
        }
        
        if(t_code === "") {
            $(".icon-locked59").addClass("invalid-input");

        } else {
            $(".icon-user185:before").removeClass("invalid-input");
            $(".icon-locked59:before").removeClass("invalid-input");

            localStorage.setItem("username", $("#login-name").value);
            events[0] = new Event(t_code);
        }
    });
    
    if(!localStorage.getItem("username")) {
        $("body").pagecontainer("change", "#page-login", {});
        
    } else {
        $("body").pagecontainer("change", "#page-login", {});
    }
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");