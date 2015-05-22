$(document).ready(function () {
    if (localStorage.getItem('wasVisited') == undefined) {
        $(".screen,.popup-list").click(function(){
            $(".screen,.popup-list").fadeOut(300);
            localStorage.setItem('wasVisited','true');
            console.log("first");
        });
    } else {
        localStorage.setItem('wasVisited', 1);
        $(".screen,.popup-list").remove();
        console.log("second");
        
    }
});