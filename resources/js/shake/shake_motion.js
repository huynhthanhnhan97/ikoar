var isMotion = false;
var firstShake = true;
var motioncount;
const initShakeMotion = (onShake, onCoolDownDone) => {
    // document.addEventListener('DOMContentLoaded', initEvent, false);
    // function initEvent() {
    window.addEventListener('devicemotion', motion, true);

    // }
    var count = 0;
    var AppearModel = false;
    let lastX, lastY, lastZ, moveCounter = 0;

    let isStable = false;


    function motion(e) {
        isMotion = true;
        let acc = e.acceleration;
        // if(motioncount<10)
        //     motioncount++;
        if (!acc.hasOwnProperty('x')) {
            //acc = e.accelerationIncludingGravity;
        }

        let deltaX = 0;
        let deltaY = 0;
        let deltaZ = 0;

        if (!acc.x)
            return;

        //only log if x,y,z > 1
        if (Math.abs(acc.x) >= 1 && Math.abs(acc.y) >= 1 && Math.abs(acc.z) >= 1) {
            //console.log('motion', acc);
            if (!lastX) {
                lastX = acc.x;
                lastY = acc.y;
                lastZ = acc.z;
                return;
            }

            deltaX = Math.abs(acc.x - lastX);
            deltaY = Math.abs(acc.y - lastY);
            deltaZ = Math.abs(acc.z - lastZ);

            if (deltaX + deltaY + deltaZ > 8) {
                moveCounter++;
            }
            else {
                moveCounter = Math.max(0, --moveCounter);
            }

            if (moveCounter > 2) {
                //if (AppearModel === true) {
                {
                    // console.log('SHAKE!!!');
                    moveCounter = 0;
                    count = new Date().getSeconds();
                    AppearModel = false;
                    firstShake = false;
                    isStable = false;
                    // window.navigator.vibrate(200);
                }
            }
            else {
                //setTimeout(function () { AppearModel = true; }, 3000);
            }


        }

        // khi điện thoại được giữ yên
        if (deltaX + deltaY + deltaZ < 2) {
            if (isStable === false) {
                // 
                if (firstShake === false && isStable == false){
                    startCooldown(onCoolDownDone);
                    isStable = true;
                }

                // let DeltaTime = new Date().getSeconds() - count;
                // if (DeltaTime > 3) {
                //     AppearModel = true;

                // }
            }
        }
        if(isStable === false) {
            if (firstShake == false)
                onShake();
        }
    }

}