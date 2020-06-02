// document.addEventListener('DOMContentLoaded', initEvent, false);
// function initEvent() {
//     console.log('Engage');
//     window.addEventListener('devicemotion', motion, false);

// }
var scene,
    renderer,
    camera,
    clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate 
    raycaster = new THREE.Raycaster(), // Used to detect the click on our character
    plane,
    event_controller,
    pickHelper,
    mixers,
    controls,
    model_main,
    shake_image;
var boxTest;
const MODEL_PATH = './resources/models/s20_03.gltf';
// let lastX, lastY, lastZ;
// let moveCounter = 0;

// console.log('model Global ', localStorage.getItem('model'));

function loadModel(MODEL_PATH, position = { x: 0, y: -11, z: 0 }) {
    var loader = new THREE.GLTFLoader();

    loader.load(MODEL_PATH, (gltf) => {
        var object = gltf.scene;
        var box = new THREE.Box3().setFromObject(object);
        var scale = 10 / box.getSize().x;
        // object.position.z = -0;
        // object.position.x = 25;
        // object.position.y = 32;
        object.position.z = -50;
        object.position.y = 0;
        object.position.x = 0;
        object.rotation.y = - Math.PI / 6;
        object.rotation.x = Math.PI / 12;

        object.scale.set(scale, scale, scale);

        let animations = gltf.animations;
        if (animations && animations.length) {
            mixers = new THREE.AnimationMixer(object);
            for (let i = 0; i < animations.length; i++) {
                let animation = animations[i];
                mixers.clipAction(animation).play();
            }
        }
        object.name = 'mobile';
        object.visible = false;
        revertObjectVectors(object);

        object.position.set(0, 0, -100);
        object.rotation.set(Math.PI / 2, Math.PI, 0);

        object.children.forEach((mesh) => {
            let name = mesh.name;
            let nameArray = name.split("_");
            if (nameArray[0] === "Interact" && nameArray[2] === '02') {
                const spriteText = makeTextSprite(" World! ",
                    { fontsize: 32, fontface: "Georgia", borderColor: { r: 0, g: 0, b: 255, a: 1.0 } });
                spriteText.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                spriteText.name = name;
                console.log(spriteText);
                scene.add(spriteText);
            }
        })
        scene.add(object)
        console.log(object);
        // controls = new THREE.OrbitControls(object, renderer.domElement);

        event_controller = new eventController(renderer.domElement, checkPortrait(), object);
        event_controller.attachEvent();
        initShakeMotion(function () {  // on Shake
            shake_image.visible = false;
            document.getElementById('noticeText').style.display = "block";
            document.getElementById('noticeText').textContent = "Keep your device stable!"
            if (model_main)
                model_main.visible = false;
        }, function () { // On cooldown done
            document.getElementById('noticeText').style.display = "none";
            if (model_main) {
                model_main.visible = true;
                revertScale(model_main, 3000);
                revertRotation(model_main, 3000);
                revertPosition(model_main, 3000);
            }
        });

        document.getElementById('divLoading').style.display = 'none';
        shake_image.visible = true;
        model_main = object;
        console.log(object)
        localStorage.setItem('gltf', object.toString());
        console.log(localStorage.getItem('gltf'));

    }, (xhr) => { }, (error) => {
        console.error(error);
    });

}

function initThree() {

    const canvas = document.querySelector('#canvas');

    // Init the scene
    scene = new THREE.Scene();

    // Init the renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000);

    // controls = new THREE.OrbitControls(camera, renderer.domElement);


    // Add lights
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0, -100).normalize();
    scene.add(directionalLight);

    var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemisphereLight);

    var pointLight = new THREE.PointLight(0xffffff, 2);
    scene.add(pointLight);
    pickHelper = new PickHelper(scene, camera, function (name) {
        var listContent;
        switch (name) {
            case "Screen":
                listContent = list_Front_Content;
                break;
            case "BackCamera":
                listContent = list_Camera_Content;
                break;
            case "FrontCamera":
                listContent = list_Back_Content;
                break;
        }
        createInformationDiv(listContent, "shake");
    });

    var texture = new THREE.TextureLoader().load("./resources/image/shake_image.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needUpdate = true;
    var scale = 1 // scale of plane for scan marker here or info mobile
    //TODO: set scale for plane with type of context
    shake_image = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(scale, scale),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
    );
    shake_image.position.set(0, 0, -2);
    scene.add(shake_image);
    shake_image.visible = false;

    // boxTest = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({
    //     color: "aqua"
    // }));
    // boxTest.position.z = -50;
    // boxTest.position.x = -10
    // scene.add(boxTest);

    // btnMove = document.getElementById('btnMove');
    // btnMove.addEventListener("click", onClick, false);

    // var forth = true;

    // function onClick() {

    //     new TWEEN.Tween(box.position)
    //         .to(box.position.clone().set(forth ? 10 : -10, forth ? 10 : -10, -50), 1000)
    //         .onStart(function () {
    //             btnMove.disabled = true;
    //         })
    //         .onComplete(function () {
    //             btnMove.disabled = false;
    //             forth = !forth;
    //         })
    //         .start();

    // }
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function update() {
    if (mixers) {
        mixers.update(clock.getDelta());
    }

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    // if (motioncount > 0) {
    //     motioncount--;
    // }
    // else {
    //     if (model_main)
    //         model_main.visible = true;
    // }
    if (pickHelper && event_controller && event_controller.isMouseHold)
        pickHelper.pick(event_controller.pickPosition);
    // controls.update();
    if (event_controller && model_main && shake_image && shake_image.visible === false) {
        var cooldownBar = document.getElementById('cooldownBar');
        let deltaTime = new Date().getSeconds() - event_controller.countTimeNotInteract;
        console.log(new Date().getSeconds(),event_controller.countTimeNotInteract,deltaTime)
        if (deltaTime >= event_controller.maxTimeNotInteract) {
            // event_controller.countTimeNotInteract = new Date().getSeconds();
            revertScale(model_main, 1500);
            revertRotation(model_main, 1500);
            revertPosition(model_main, 1500);
            cooldownBar.style.display = 'none';
        }
        else {
            cooldownBar.style.display = 'block';
            cooldownBar.style.width = (event_controller.maxTimeNotInteract - deltaTime) / (event_controller.maxTimeNotInteract) * 100 + '%';

        }

    }

    TWEEN.update();

    renderer.render(scene, camera);

    // if (isMotion == false) {
    //     if (model_main)
    //         model_main.visible = true;
    // }
    // console.log(motioncount)
    // if (motioncount) {
    //     if (new Date().getSeconds() - motioncount > 3){
    //         console.log(new Date().getSeconds() - motioncount)
    //         isMotion = false;
    //     }
    // }
    requestAnimationFrame(update);
}

initStream();

initThree();
loadModel(MODEL_PATH);

// document.getElementById('note').onclick = function () {
//     let infoDiv = document.getElementById('note');
//     console.log(infoDiv)
//     if (infoDiv)
//         infoDiv.style.display = 'none';

//     return false
// };

// initShakeMotion(model_main)



update();
