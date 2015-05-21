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
    if(!localStorage.getItem("username")) {
        $("body").pagecontainer("change", "#page-login", {});
        
        $("#loginform").on("submit", function(e) {
            e.preventDefault();
            
            var t_name = $("#login-name").value;    // Waarde v.h. naam-veld
            var t_code = $("#login-code").value;    // Waarde v.h. code-veld
            
            if(t_name === "") {
                $(".icon-user185:before").css("color", "#e84746");
                
            } else {
                if(t_code === "") {
                    $(".icon-locked59:before").css("color", "#e84746");
                    
                } else {
                    localStorage.setItem("username", $("#login-name").value);
                    events[0] = new Event(t_code);
                }
            }
        });
    } else {
        $("body").pagecontainer("change", "#page-login", {});
    }
    $('.background').foggy();
});

//StatusBar.styleLightContent();
//StatusBar.backgroundColorByHexString("#51b0c5");