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
    if(/android/i.test(navigator.userAgent)){
    var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var imageObj = document.getElementById("myImage");
	var width;
	
	imageObj.src = "data:image/jpeg;base64," + imageData;
	
	width = imageObj.width; //breedte van afbeelding nemen
	canvas.setAttribute('width', width); //canvas breedte instellen
	canvas.setAttribute('height', width); //canvas hoogte instellen
	context.drawImage(imageObj, 0, 0, width, width, 0, 0, width, width); //afbeelding tekenen
	var dataURL = canvas.toDataURL(); //dataURL vullen 
	document.getElementById("defImg").setAttribute('crossOrigin', 'anonymous');
	document.getElementById("defImg").src = dataURL; //afbeelding toekennen
    }
    else if(/(iphone)|(ipad)/i.test(navigator.userAgent)){
        var image = document.getElementById('defImg');
    	image.src = "data:image/jpeg;base64," + imageData;
    }
}

function onFail(message) {
    setTimeout(function() {
        //alert('Failed because: ' + message);
    }, 0);

}