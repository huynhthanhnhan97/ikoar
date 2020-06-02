const loadModel = (modelUri, ARObject) => {
    let self = ARObject;
    var arScene = self.arScene;
    var modelScale = 0.5 // default scale of model
    // var mixers = self.parentObject.mixers;
    var mixers;
    var parentObject = self.parentObject;
    var orientation = self.arController.orientation;
    var hint_Content = self.hint_Content;
    var rendererDomElement = self.rendererDomElement;
    /**
     * The interval for reload model if lib is not ready
     */
    var intervalLoad = setInterval(() => {
        if (window.THREE.GLTFLoader) {
            var loader = new THREE.GLTFLoader();
            var modelLink = modelUri ? modelUri : './resources/models/fairy-archer/scene.gltf';
            /**
             * OnSuccess load, edit, get animation of model and add to marker root
             * 
             * @param {String} modelLink - link to model. if modelUri is not define, the default will be fairy-archer model
             */
            loader.load(modelLink, (gltf) => {
                /**
                 * Create rotation and position default for mobile object. It is same with the box
                 */
                var object = gltf.scene;
                var box = new THREE.Box3().setFromObject(object);
                var scale = 18 / box.getSize().x;
                modelScale = scale;
                object.position.z = -0;
                object.position.x = 25;
                object.position.y = 32;
                object.rotation.x = Math.PI / 2;

                object.scale.set(scale, scale, scale);

                let animations = gltf.animations;
                if (animations && animations.length) {
                    mixers = new THREE.AnimationMixer(object);
                    for (let i = 0; i < animations.length; i++) {
                        let animation = animations[i];
                        mixers.clipAction(animation).play();
                    }
                    self.parentObject.mixers = mixers;
                }

                // add model to marker root

                object.name = 'mobile';
                revertObjectVectors(object);
                parentObject.add(object);

                window['revert'] = function () {
                    // revertScale(object, 3000);
                    // revertRotation(object, 3000);
                    // revertPosition(object, 3000);
                }

                self.eventControl = new eventController(rendererDomElement, arScene, orientation === 'portrait', object, hint_Content);
                self.eventControl.attachEvent();

                divLoading.style.display = "none";

            }, (xhr) => { }, (error) => {
                console.error(error);
            });
            clearInterval(intervalLoad);
        }
    }, 2000)
}

const replaceModel = (url, ARObject) => {
    let self = ARObject;
    if (self.parentObject) {
        if (self.parentObject.children[0]) {
            self.parentObject.remove(self.parentObject.children[0]);
            self.parentObject.mixers = [];
        }
    }
    loadModel(url, self);
}