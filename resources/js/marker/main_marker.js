class AR {
    constructor() {
        this.arScene;
        this.arController;
        this.rendererDomElement = HTMLElement;
        this.parentObject; // root object for add model to it
        this.setAnimation = Function; // set flag to play animation
        this.replaceModel = Function;
        this.eventControl;
        this.highLight;
    }

    /**
     * This funtion return a loop for render and process. The loop is used when a <script> in html file init this file
         
        Here some html Element are created:
        {
        divLoading: use for show loading screen. It will be disable when model loaded
        boxCanvas: use for show the rectangle with content "Scan marker here". It will be show when the marker can not detect and disable when marker found
        rendererDomElement: use for render all object of THREE. This is created when init THREE.WebGLRenderer

        all of elements above are append as child of 'renderCanvas' element. This element is added in the html file of ar page
        }

        This function use arController (import from artoolkit.three.js) to check userMedia, load NFT data marker and model
        * @param {String} modelUri - link to .gltf file model (this can be link raw github or link to folder local)
        @param {String} dataNFTUri - link to dataNFT folder
        **/

    initAR(config) {
        var self = this;
        return new Promise(resolve => {
            const canvasMaster = initHTMLObjects();
            /**
             * This function will be call when arController is loaded from artoolkit.min.js
             */
            window.ARThreeOnLoad = () => {
                const dataNFTUri = config.dataNFTLink;
                const modelUri = config.modelLink;
                const cameraParam = config.cameraParam;
                ARController.getUserMediaThreeScene({
                    maxARVideoSize: 320, // depend on device (mobile is good with 320, desktop is good with 640)
                    cameraParam: cameraParam,
                    /**
                     * This function is called when get userMedia of device success
                     * 
                     * This funtion return a loop for render and process
                     * @param {object} arScene - object is returned from artoolkit.three.js
                     * @param {object} arController - object is returned from artoolkit.min.js
                     */
                    onSuccess: (arScene, arController, arCamera) => {
                        self.arScene = arScene;
                        self.arController = arController;
                        document.body.className = arController.orientation;

                        var renderer = new THREE.WebGLRenderer({ // create WebGLRenderer. rendererDomElement is a canvas
                            antialias: true
                        });
                        // renderer.gammaOutput = true;
                        renderer.gammaFactor = 2.2;
                        renderer.setClearColor(0x00ffff, 1);

                        const rendererDomElement = renderer.domElement;
                        rendererDomElement.className = 'renderCanvas';
                        rendererDomElement.id = 'renderCanvasContext';
                        canvasMaster.appendChild(rendererDomElement);

                        self.rendererDomElement = rendererDomElement;
                        self.hint_Content = ""; // save type of hint
                        let divLoading = document.getElementById('divLoading');

                        ////////// setup for mobile version //////////
                        if (arController.orientation === 'portrait') {
                            var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                            var h = window.innerWidth;
                            renderer.setSize(w, h);

                            stylePortrait(); // get style from html.Style.js for portrait
                            arScene.setContext('hint_mobile_portraint');
                            self.hint_Content = 'hint_mobile_portraint';

                        } else {
                            ///////////// setup for mobile has not portrait mode //////////
                            if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
                                var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                                var h = window.innerWidth;
                                renderer.setSize(w, h);

                                arScene.setContext('hint_mobile');
                                self.hint_Content = 'hint_mobile';
                            }

                            /////////////// Setup For Desktop ////////////////
                            else {
                                renderer.setSize(arController.videoWidth, arController.videoHeight);
                                document.body.className += ' desktop';
                                arScene.setContext('hint_desktop');
                                self.hint_Content = 'hint_desktop';
                            }

                            styleLandscape(); // get style from html.Style.js for landscape

                        }

                        /**
                         * This block will contain method init for AR object as self
                         */
                        {
                            var isPlayAnimation = true;

                            self.setAnimation = (flag) => {
                                if (flag)
                                    isPlayAnimation = true;
                                else
                                    isPlayAnimation = false;
                            }
                            /**
                            * They are some function for add new, remove and replace the current model
                            */
                            self.replaceModel = (url) => {
                                replaceModel(url, self); // get replaceModel method from modelManager.js
                            }
                        }

                        // loadDivContent(arController.orientation === 'portrait' ? 'portraint' : 'landscape');

                        var clock = new THREE.Clock(); // use in loop to update mixers
                        ///////// Load NFT data /////////////
                        /**
                         * When load NFT of marker success, we will create a root object for add model to THREE
                         * 
                         * @param {any} markerId - set Id for object root marker
                         */
                        var dataNFTLink = dataNFTUri ? dataNFTUri : './resources/dataNFT/Kyanon';
                        arController.loadNFTMarker(dataNFTLink, (markerId) => {
                            self.parentObject = arController.createThreeNFTMarker(markerId);
                            self.parentObject.name = 'parentObject';
                            // self.parentObject.mixers = [];
                            // console.log(self.highLight)
                            loadModel(modelUri, self); // get loadModel method from modelManager.js
                            arScene.scene.add(self.parentObject);
                        });


                        const pickHelper = new PickHelper(self.arScene, config.onPickModel); // use for init raycast

                        ///////////////// Loop /////////////////
                        /**
                         * Check if have any loop (maybe because change webpage or reload file main.js)
                         * cancel it before run new loop
                         */
                        if (window.id)
                            window.cancelAnimationFrame(window.id);
                        /**
                         * The main loop for process, render, get position for raycast and run animation, ...
                         */
                        var update = () => {
                            var loopID = requestAnimationFrame(update);
                            window['id'] = loopID;
                            // update animation of model
                            if (self.parentObject && self.parentObject.mixers) {
                                let mixers = self.parentObject.mixers;
                                mixers.update(clock.getDelta());
                            }
                            arScene.process();
                            arScene.renderOn(renderer);
                            // update event control
                            if (self.eventControl && self.eventControl.isMouseHold && pickHelper)
                                pickHelper.pick(self.eventControl.pickPosition);
                            if (self.eventControl)
                                if (new Date().getSeconds() - self.eventControl.countTimeNotInteract > self.eventControl.maxTimeNotInteract) {
                                    self.eventControl.countTimeNotInteract = new Date().getSeconds();
                                    revertScale(self.parentObject.children[0], 1500);
                                    revertRotation(self.parentObject.children[0], 1500);
                                    revertPosition(self.parentObject.children[0], 1500);
                                }
                            TWEEN.update();

                        };
                        resolve();
                        update();
                        //////////////////////////////////

                    }
                });

                delete window.ARThreeOnLoad;
            };

            if (window.ARController && ARController.getUserMediaThreeScene) {
                ARThreeOnLoad();
            }
        })
    }
}


////////////////////////////////////////