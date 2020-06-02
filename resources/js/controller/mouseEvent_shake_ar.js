/**
 * 
 * @param {canvas} this.rendererDomElement -  renderer canvas
 * @param {boolean} isPortrait - check the screen is portraint?
 * @param {*} this.objectRoot - represent for model object
 * 
 * Init the event both mouse on desktop and touch on mobile
 */
class eventController {
    preMousePos; // save the old position of mouse, use to compare with new position of mouse
    isRotate = false; // set allow rotate model or not. This dependent on the 'isShow' variable in artoolkit.three.js
    finger_dist; // check distance of fingers on mobile
    modelCenterZ;
    mouseHoldTimer; // interval for check mouse hold
    timeHold = 500; // When enough this time, mouse hold will be true
    isMouseHold = false; // if this.isMouseHold true, run the PickHelper for raycast check
    modelScale = 0.5;
    pickPosition = { x: 0, y: 0 }; // store the pick position for raycast
    countTimeScale = 0;
    maxTimeScale = 5;
    maxScaleX = 0;
    countTimeNotInteract = 0;
    maxTimeNotInteract = 10; //seconds

    constructor(rendererDomElement, isPortrait, objectRoot) {
        this.rendererDomElement = rendererDomElement;
        this.isPortrait = isPortrait;
        this.objectRoot = objectRoot;
        this.maxScaleX = this.objectRoot.scale.x * 2;
        this.countTimeNotInteract = new Date().getSeconds();
    }
    clearPickPosition = () => {
        this.pickPosition.x = -100000;
        this.pickPosition.y = -100000;
    }

    // this.clearPickPosition();

    ///////////// Caculate Mouse postion on Canvas ////////////
    /**
     * This funtion caculate postion of mouse on canvas and set to pickPosition object
     * If this is mobile device with portraint mode, we will interchangeable position x and y
     * 
     * @param {event} event - any event of mouse or touch
     */
    setPickPosition = (event) => {
        this.pickPosition.x = ((event.clientX - this.rendererDomElement.getBoundingClientRect().left) / this.rendererDomElement.getBoundingClientRect().width) * 2 - 1;
        this.pickPosition.y = ((event.clientY - this.rendererDomElement.getBoundingClientRect().top) / this.rendererDomElement.getBoundingClientRect().height) * -2 + 1; // note we flip Y
        if (this.isPortrait) {
            // var temp = this.pickPosition.x;
            // this.pickPosition.x = this.pickPosition.y;
            // this.pickPosition.y = temp;
        }
    }



    /**
     * This return the position of mouse on the render canvas
     * @param {canvas} canvasDom - the canvas for get position of mouse. In this case, this is this.rendererDomElement
     * @param {event} mouseEvent - event of mouse
     */
    getMousePos = (canvasDom, mouseEvent) => {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: mouseEvent.clientX - rect.left,
            y: mouseEvent.clientY - rect.top
        };
    }

    getTouchPos = (canvasDom, touchEvent) => {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    /**
     * This get position of two fingures touches[0] & touches[1] and caculate the distance
     * 
     * This function return distance of fingures
     * @param {event} e - event of mobile
     */
    get_distance = (e) => {
        var diffX = e.touches[0].clientX - e.touches[1].clientX;
        var diffY = e.touches[0].clientY - e.touches[1].clientY;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    //////////// Mouse Event /////////////
    attachEvent = () => {
        /**
         * This function set the old mouse position if model is shown and set the pick position for Raycast
         * 
         * @param {event} ev - event mouse down
         */
        this.rendererDomElement.addEventListener('mousedown', (ev) => {
            this.countTimeNotInteract = new Date().getSeconds();
            this.preMousePos = this.getMousePos(this.rendererDomElement, ev);
            this.isRotate = true;
            this.mouseHoldTimer = setTimeout(() => {
                this.isMouseHold = true;
            }, this.timeHold);
            this.setPickPosition(ev);
        }, false);
        /**
         * If model is shown, delta of old postion and new postion of mouse will be caculate and set for rotation of model with ratio /100
         * 
         * @param {event} ev - event mouse move
         */
        this.rendererDomElement.addEventListener('mousemove', (ev) => {
            // this.countTimeNotInteract = new Date().getSeconds();
            var deltaX;
            var deltaY;
            if (this.isRotate) {
                var newMousePos = this.getMousePos(this.rendererDomElement, ev);
                if (this.preMousePos.x && this.preMousePos.y) {
                    deltaX = newMousePos.x - this.preMousePos.x;
                    deltaY = newMousePos.y - this.preMousePos.y;
                    var scale = this.objectRoot.scale.x;
                    this.modelCenterZ = scale / 10;
                    this.objectRoot.translateZ(this.modelCenterZ);
                    this.objectRoot.rotation.y += deltaX / 100;
                    this.objectRoot.rotation.x += deltaY / 100;
                    this.objectRoot.translateZ(-this.modelCenterZ);


                    this.preMousePos = newMousePos;
                }
                var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (this.mouseHoldTimer && distance >= 2) {
                    this.isMouseHold = false;
                    clearTimeout(this.mouseHoldTimer);
                }
            }
        }, false);
        this.rendererDomElement.addEventListener('mouseup', (ev) => {
            this.countTimeNotInteract = new Date().getSeconds();
            /**
             * reset position of mouse for raycast and block the rotate
             */
            this.isRotate = false;
            if (this.mouseHoldTimer) {
                this.isMouseHold = false;
                clearTimeout(this.mouseHoldTimer);
            }
            this.clearPickPosition();
        }, false);

        /**
         * If the mouse roll up, scale model will increase and opposite.
         * 
         * @param {event} ev - event roll mouse
         */
        this.rendererDomElement.addEventListener('wheel', (ev) => {
            // this.countTimeNotInteract = new Date().getSeconds();
            if (ev.deltaY < 0)
                var scale = this.objectRoot.scale.x + this.modelScale / 10;
            else
                var scale = this.objectRoot.scale.x - this.modelScale / 10;
            this.objectRoot.scale.x = scale;
            this.objectRoot.scale.y = scale;
            this.objectRoot.scale.z = scale;
        }, false);

        /////////// Touch Event //////////////
        /**
         * Check the length of touches for get number of fingures.
         * If number of fingures is one, we will process for rotate model else get distance of fingures for zoom
         * 
         * @param {event} ev - event touch on mobile
         */
        this.rendererDomElement.addEventListener('touchstart', (ev) => {
            this.countTimeNotInteract = new Date().getSeconds();
            if (ev.touches.length > 1) {
                this.finger_dist = this.get_distance(ev);
            } else {
                this.preMousePos = this.getTouchPos(this.rendererDomElement, ev);
                this.isRotate = true;
                this.mouseHoldTimer = setTimeout(() => {
                    this.isMouseHold = true;
                }, this.timeHold);
            }
        }, false);
        /**
         * Check the length of touches for get number of fingures.
         * If number of fingures is one, we will process for rotate model else get distance of fingures for zoom
         * 
         * @param {event} ev - event touch move on mobile
         */
        this.rendererDomElement.addEventListener('touchmove', (ev) => {
            // this.countTimeNotInteract = new Date().getSeconds();
            ev.preventDefault();
            if (ev.touches.length > 1) {
                var new_finger_dist = this.get_distance(ev);
                var deltaScale = (new_finger_dist - this.finger_dist) / (1000 * 0.3 / this.modelScale);
                this.finger_dist = new_finger_dist;
                if (this.objectRoot.scale.x + deltaScale > this.maxScaleX || this.objectRoot.scale.x + deltaScale < this.maxScaleX / 5)
                    return;
                // if(deltaScale == 0)
                //     return;
                // if (deltaScale > 0) {
                //     this.countTimeScale++;
                //     this.countTimeScale = this.countTimeScale > this.maxTimeScale ? this.maxTimeScale : this.countTimeScale;
                // }
                // else {
                //     this.countTimeScale--;
                //     this.countTimeScale = this.countTimeScale < -this.maxTimeScale ? -this.maxTimeScale : this.countTimeScale;
                // }
                // console.log(this.countTimeScale)
                // console.log(deltaScale)
                // if(this.countTimeScale == this.maxTimeScale || this.countTimeScale == -this.maxTimeScale){
                //     return;
                // }
                var scale = this.objectRoot.scale.x + deltaScale;
                this.objectRoot.scale.x = scale;
                this.objectRoot.scale.y = scale;
                this.objectRoot.scale.z = scale;

            } else {
                var deltaX;
                var deltaY;
                if (this.isRotate) {
                    var newMousePos = this.getTouchPos(this.rendererDomElement, ev);
                    if (this.preMousePos.x && this.preMousePos.y) {
                        deltaX = newMousePos.x - this.preMousePos.x;
                        deltaY = newMousePos.y - this.preMousePos.y;
                        var scale = this.objectRoot.scale.x;
                        this.modelCenterZ = scale / 10;
                        // this.objectRoot.translateZ(this.modelCenterZ);
                        this.objectRoot.rotation.y += deltaX / 300;
                        if (this.objectRoot.rotation.y > Math.PI * 2 || this.objectRoot.rotation.y < -Math.PI * 2)
                            this.objectRoot.rotation.y = 0;
                        this.objectRoot.rotation.x += deltaY / 300;
                        if (this.objectRoot.rotation.x > Math.PI * 2 || this.objectRoot.rotation.x < -Math.PI * 2)
                            this.objectRoot.rotation.x = 0;
                        // this.objectRoot.rotation.z += deltaY / 100;
                        window['root'] = this.objectRoot;
                        // this.objectRoot.translateZ(-this.modelCenterZ);
                    }

                    this.preMousePos = newMousePos;
                }
                var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (this.mouseHoldTimer && distance >= 2) {
                    this.isMouseHold = false;
                    clearTimeout(this.mouseHoldTimer);
                }
            }
        }, false);
        this.rendererDomElement.addEventListener('touchend', (ev) => {
            this.countTimeNotInteract = new Date().getSeconds();
            this.isRotate = false;
            if (this.mouseHoldTimer) {
                this.isMouseHold = false;
                clearTimeout(this.mouseHoldTimer);
            }
        }, false);

        window.addEventListener('mouseout', this.clearPickPosition);
        window.addEventListener('mouseleave', this.clearPickPosition);

        window.addEventListener('touchstart', (event) => {
            // prevent the window from scrolling
            event.preventDefault();
            this.setPickPosition(event.touches[0]);
        }, { passive: false });

        window.addEventListener('touchmove', (event) => {
            this.setPickPosition(event.touches[0]);
        });

        window.addEventListener('touchend', this.clearPickPosition);
    }

}