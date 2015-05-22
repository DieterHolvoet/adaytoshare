$('#gallery').onclick(function(){
    $(this).imagePicker.getPictures(
    function(results) {
        for (var i = 0; i < results.length; i++) {
            console.log('Image URI: ' + results[i]);
        }
    }, function (error) {
        console.log('Error: ' + error);
    }
);
                                });