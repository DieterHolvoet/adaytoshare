/* jshint
browser: true,
devel: true
*/
var pictureSource; // picture source
var destinationType; // sets the format of returned value 

// Wait for Cordova to connect with the device
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready to be used!
//
function onDeviceReady() {
   console.log(device);
   console.log(window.device);
   console.log(window.plugins);
    alert('device ready');
    StatusBar.hide();
    document.getElementById("takePicture").onclick = takePicture;
}

function takePicture(e) {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: navigator.camera.DestinationType.DATA_URL
    });
}

function onSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    setTimeout(function () {
        //alert('Failed because: ' + message);
    }, 0);

}