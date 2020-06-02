/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

import {
    Euler,
    MathUtils,
    Quaternion,
    Vector3
} from "./three.module.js";

var DeviceOrientationControls = function(object) {

    var scope = this;

    this.object = object;
    this.object.rotation.reorder('YXZ');

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alphaOffset = 0; // radians

    let lastBeta = 0;
    let lastGamma = 0;

    const quaternion = object.quaternion;
    var onDeviceOrientationChangeEvent = function(event) {

        scope.deviceOrientation = event;

    };

    var onScreenOrientationChangeEvent = function() {

        scope.screenOrientation = window.orientation || 0;

    };

    this.resetQuaternion = function(){
        scope.object.quaternion = quaternion;
    }

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function() {

        var zee = new Vector3(0, 0, 1);

        var euler = new Euler();

        var q0 = new Quaternion();

        var q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        return function(quaternion, alpha, beta, gamma, orient) {

            euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

            quaternion.setFromEuler(euler); // orient the device

            quaternion.multiply(q1); // camera looks out the back of the device, not the top

            quaternion.multiply(q0.setFromAxisAngle(zee, orient)); // adjust for screen orientation

        };

    }();

    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        // iOS 13+

        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') {

            window.DeviceOrientationEvent.requestPermission().then(function(response) {

                if (response == 'granted') {

                    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
                    window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

                }

            }).catch(function(error) {

                console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);

            });

        } else {

            window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        }

        scope.enabled = true;

    };

    this.disconnect = function() {

        window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        scope.enabled = false;

    };

    function Quat2Angle(x, y, z, w) {
        let pitch, roll, yaw;

        const test = x * y + z * w;
        // singularity at north pole
        if (test > 0.499) {
            yaw = Math.atan2(x, w) * 2;
            pitch = Math.PI / 2;
            roll = 0;

            return new THREE.Vector3(pitch, roll, yaw);
        }

        // singularity at south pole
        if (test < -0.499) {
            yaw = -2 * Math.atan2(x, w);
            pitch = -Math.PI / 2;
            roll = 0;
            return new THREE.Vector3(pitch, roll, yaw);
        }

        const sqx = x * x;
        const sqy = y * y;
        const sqz = z * z;

        yaw = Math.atan2((2 * y * w) - (2 * x * z), 1 - (2 * sqy) - (2 * sqz));
        pitch = Math.asin(2 * test);
        roll = Math.atan2((2 * x * w) - (2 * y * z), 1 - (2 * sqx) - (2 * sqz));

        return new THREE.Vector3(pitch, roll, yaw);
    }

    this.update = function(isZero = false) {

        if (scope.enabled === false) return;

        var device = scope.deviceOrientation;
        if(!isZero){
            if (device) {
    
                var alpha = device.alpha ? MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0; // Z
    
                var beta = device.beta ? MathUtils.degToRad(device.beta) : 0; // X'
    
                var gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0; // Y''
    
                var orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0; // O
    
                setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
    
                // const currentAngle = Quat2Angle(scope.object.quaternion.x, scope.object.quaternion.y, scope.object.quaternion.z, scope.object.quaternion.w);
    
                // // currentAngle.z = left - right
                // this.rotateLeft((lastGamma - currentAngle.z));
                // lastGamma = currentAngle.z;
    
                // // currentAngle.y = up - down
                // this.rotateUp(lastBeta - currentAngle.y);
                // lastBeta = currentAngle.y;
    
            }
        }
        else{
            var orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0; // O
    
                setObjectQuaternion(scope.object.quaternion, 0, 0, Math.PI/2, orient);
        }


    };

    this.dispose = function() {

        scope.disconnect();

    };

    this.connect();

};

export { DeviceOrientationControls };