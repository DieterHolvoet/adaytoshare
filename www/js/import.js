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
    // alert('device ready');
    // StatusBar.hide();
    document.getElementById("gallery").onclick = getPicture;
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
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    setTimeout(function() {
        //alert('Failed because: ' + message);
    }, 0);

}