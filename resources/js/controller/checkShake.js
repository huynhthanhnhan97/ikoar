function motion(e) {
    let acc = e.acceleration;
    if (!acc.hasOwnProperty('x')) {
        acc = e.accelerationIncludingGravity;
    }

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

        let deltaX = Math.abs(acc.x - lastX);
        let deltaY = Math.abs(acc.y - lastY);
        let deltaZ = Math.abs(acc.z - lastZ);

        if (deltaX + deltaY + deltaZ > 3) {
            moveCounter++;
        } else {
            moveCounter = Math.max(0, --moveCounter);
        }

        if (moveCounter > 2) {
            // console.log('SHAKE!!!');
            document.getElementById('notice').innerText = "Please keep device stand still!"
            moveCounter = 0;
        } else
            document.getElementById('notice').innerText = ""

    }
}

window.addEventListener('devicemotion', motion, false);