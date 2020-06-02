const initStream = () =>{

    var video = document.getElementById('video');
    var canvas = document.getElementById("canvas");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        var hint = {
            audio: false,
            video: true
        };
        if (window.innerWidth < 800) {
            var width = (window.innerWidth < window.innerHeight) ? 480 : 640;
            var height = (window.innerWidth < window.innerHeight) ? 480 : 640;
    
            var aspectRatio = window.innerWidth / window.innerHeight;
    
            hint = {
                audio: false,
                video: {
                    facingMode: 'environment',
                    width: {
                        min: width,
                        max: width
                    },
                    height: {
                        min: height,
                        max: height
                    }
                },
            };
        }
    
    
        navigator.mediaDevices.getUserMedia(hint).then(function (stream) {
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
    
        }).catch(function (err) {
    
            console.log(err.name + ": " + err.message);
    
        });
    }
}