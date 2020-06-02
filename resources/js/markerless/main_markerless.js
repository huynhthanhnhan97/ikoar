import { DeviceOrientationControls } from '../../../resources/js/lib/DeviceOrientationController.js';
(async function () {
    // Set our main variables
    let scene,
        renderer,
        camera,
        model, // Our character
        possibleAnims, // Animations found in our file
        mixers, // THREE.js animations mixer
        idle, // Idle, the default state our character returns to
        clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate 
        currentlyAnimating = false, // Used to check whether characters neck is being used in another anim
        raycaster = new THREE.Raycaster(), // Used to detect the click on our character
        plane,
        deviceOrientation,
        event_controller,
        isFistLoadModel = true;
    var camParam = {};
    const MODEL_PATH = './resources/models/s20_03.gltf';
    var intersectPlanePoint = new THREE.Vector3();
    var controlOrientation;
    var mouse = new THREE.Vector2();
    var mesh;
    var isUpdateControl = true;

    initStream();
    // function onDeviceMotionChangeEvent(event) {
    //     deviceMotion = event.acceleration;
    //     if (camera) {
    //         let deltaX = Number(parseFloat(deviceMotion.x).toFixed())
    //         camera.translateX(deltaX);
    //         // console.log(deviceMotion.x)
    //         document.getElementById('text').innerText = "x: " + deltaX;
    //         // camera.position.y -= deviceMotion.y;
    //         // camera.position.z -= deviceMotion.z;
    //     }
    // }

    // window.addEventListener('devicemotion', onDeviceMotionChangeEvent, false);


    var setObjectQuaternion = function () {
        const zee = new THREE.Vector3(0, 0, 1);
        const euler = new THREE.Euler();
        const q0 = new THREE.Quaternion();
        const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

        return function (quaternion, alpha, beta, gamma, orient) {
            // 'ZXY' for the device, but 'YXZ' for us
            euler.set(beta, alpha, -gamma, 'YXZ');

            // Orient the device
            quaternion.setFromEuler(euler);

            // camera looks out the back of the device, not the top
            quaternion.multiply(q1);

            // adjust for screen orientation
            quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
        }
    }();

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


    init();

    await loadModel('./resources/models/GridPlane.gltf').then((result) => {
        mesh = result;
        console.log(mesh)

    })

    scene.add(mesh);
    function handleOrientation(event) {
        deviceOrientation = event;
        var absolute = event.absolute;
        var alpha = event.alpha;
        var beta = event.beta;
        var gamma = event.gamma;
        // console.log(deviceOrientation)

        // Do stuff with the new orientation data
        updateMeshPosition(event.beta);
    }
    window.addEventListener("deviceorientation", handleOrientation, true);

    function onScreenOrientationChangeEvent(event) {
        screenOrientation = window.orientation || 0;
    }

    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);

    // controls.update = function() {
    //     if (deviceOrientation) {
    //         // Z
    //         const alpha = deviceOrientation.alpha ?
    //             THREE.Math.degToRad(deviceOrientation.alpha) :
    //             0;

    //         // X'
    //         const beta = deviceOrientation.beta ?
    //             THREE.Math.degToRad(deviceOrientation.beta) :
    //             0;

    //         // Y''
    //         const gamma = deviceOrientation.gamma ?
    //             THREE.Math.degToRad(deviceOrientation.gamma) :
    //             0;
    //         // O
    //         const orient = screenOrientation ?
    //             THREE.Math.degToRad(screenOrientation) :
    //             0;

    //         const currentQ = new THREE.Quaternion().copy(camera.quaternion);

    //         setObjectQuaternion(currentQ, alpha, beta, gamma, orient);
    //         const currentAngle = Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w);

    //         // currentAngle.z = left - right
    //         controls.rotateLeft((lastGamma - currentAngle.z));
    //         lastGamma = currentAngle.z;

    //         // currentAngle.y = up - down
    //         controls.rotateUp(lastBeta - currentAngle.y);
    //         lastBeta = currentAngle.y;
    //         console.log(controls)
    //     }

    // }


    let geometry = new THREE.SphereGeometry(1, 12, 8);

    let material = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        flatShading: true,
        transparent: true,
        opacity: 0.7,
    });

    // let mesh;
    // //  = new THREE.Mesh(geometry, material);
    // await loadModel('./resources/models/GridPlane.gltf').then((result) => {
    //     mesh = result;
    //     console.log(mesh)

    // })

    // scene.add(mesh);
    async function init() {



        const canvas = document.querySelector('#canvas');
        // const backgroundColor = 0xf1f1f1;

        // Init the scene
        scene = new THREE.Scene();
        // scene.background = new THREE.Color(backgroundColor);
        // scene.fog = new THREE.Fog(backgroundColor, 60, 100);

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

        camera.position.z = 30;
        // camera.position.x = 0;
        camera.position.y = -3;
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
        camParam = {
            position: camera.position,
            rotation: camera.rotation
        }
        // controls = new THREE.OrbitControls(camera, renderer.domElement);
        // controlOrientation = new DeviceOrientationControls(camera);


        // // Add lights
        // let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
        // hemiLight.position.set(0, 50, 0);
        // // Add hemisphere light to scene
        // scene.add(hemiLight);

        // let d = 8.25;
        // let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
        // dirLight.position.set(-8, 12, 8);
        // dirLight.castShadow = true;
        // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        // dirLight.shadow.camera.near = 0.1;
        // dirLight.shadow.camera.far = 1500;
        // dirLight.shadow.camera.left = d * -1;
        // dirLight.shadow.camera.right = d;
        // dirLight.shadow.camera.top = d;
        // dirLight.shadow.camera.bottom = d * -1;
        // // Add directional Light to scene
        // scene.add(dirLight);
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


        // // Floor
        // let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
        // let floorMaterial = new THREE.MeshPhongMaterial({
        //     color: 0xeeeeee,
        //     shininess: 0
        // });


        // let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // floor.rotation.x = -0.5 * Math.PI;
        // floor.receiveShadow = true;
        // floor.position.y = -11;
        // scene.add(floor);

        // let geometry = new THREE.SphereGeometry(8, 32, 32);
        // let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e 
        // let sphere = new THREE.Mesh(geometry, material);

        // sphere.position.z = -15;
        // sphere.position.y = -2.5;
        // sphere.position.x = -0.25;
        // scene.add(sphere);

        // let p = loadModel("./resources/models/GridPlane.gltf");

        plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        plane.translate(new THREE.Vector3(0, -20, 20));
        // plane = p;
        // console.log(plane)
        // scene.add(plane);

        // loadModel(MODEL_PATH);

        //  = new THREE.Mesh(geometry, material);
        controlOrientation = new DeviceOrientationControls(camera);

    }

    // function loadModel(MODEL_PATH, position = { x: 0, y: -11, z: 0 }) {
    //     // let stacy_txt = new THREE.TextureLoader().load('../asset/img/stacy.jpg');
    //     // stacy_txt.flipY = false;

    //     // const stacy_mtl = new THREE.MeshPhongMaterial({
    //     //     map: stacy_txt,
    //     //     color: 0xffffff,
    //     //     skinning: true
    //     // });



    //     var loader = new THREE.GLTFLoader();

    //     loader.load(
    //         MODEL_PATH,
    //         function(gltf) {
    //             model = gltf.scene;
    //             let fileAnimations = gltf.animations;

    //             // model.traverse(o => {

    //             //     if (o.isMesh) {
    //             //         o.castShadow = true;
    //             //         o.receiveShadow = true;
    //             //         o.material = stacy_mtl;
    //             //     }
    //             //     // Reference the neck and waist bones
    //             //     if (o.isBone && o.name === 'mixamorigNeck') {
    //             //         neck = o;
    //             //     }
    //             //     if (o.isBone && o.name === 'mixamorigSpine') {
    //             //         waist = o;
    //             //     }
    //             // });

    //             model.scale.set(0.3, 0.3, 0.3);
    //             // model.position.y = -11;
    //             model.position.set(position.x, position.y, position.z);

    //             scene.add(model);

    //             // controls = new DeviceOrientationControls(model);

    //             // loaderAnim.remove();

    //             mixer = new THREE.AnimationMixer(model);

    //             let clips = fileAnimations.filter(val => val.name !== 'idle');
    //             possibleAnims = clips.map(val => {
    //                 let clip = THREE.AnimationClip.findByName(clips, val.name);

    //                 clip.tracks.splice(3, 3);
    //                 clip.tracks.splice(9, 3);

    //                 clip = mixer.clipAction(clip);
    //                 return clip;
    //             });


    //             let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');

    //             idleAnim.tracks.splice(3, 3);
    //             idleAnim.tracks.splice(9, 3);

    //             idle = mixer.clipAction(idleAnim);
    //             idle.play();

    //         },
    //         undefined, // We don't need this function
    //         function(error) {
    //             console.error(error);
    //         });

    // }

    function loadModel(MODEL_PATH, isControl = false, position = { x: 0, y: -11, z: 0 }) {
        return new Promise((resolve, reject) => {
            var loader = new THREE.GLTFLoader();

            loader.load(MODEL_PATH, (gltf) => {
                let model = gltf.scene;
                var box = new THREE.Box3().setFromObject(model);
                var scale = 5 / box.getSize().x;
                // model.position.z = -0;
                // model.position.x = 25;
                // model.position.y = 32;
                // model.position.z = -50;
                // model.position.y = 0;
                // model.position.x = 0;
                model.position.x = position.x;
                model.position.y = position.y;
                model.position.z = position.z;
                // model.rotation.y = Math.PI / 2;

                model.scale.set(scale, scale, scale);

                let animations = gltf.animations;
                if (animations && animations.length) {
                    mixers = new THREE.AnimationMixer(model);
                    for (let i = 0; i < animations.length; i++) {
                        let animation = animations[i];
                        mixers.clipAction(animation).play();
                    }
                }
                model.name = 'mobile';
                scene.add(model)
                // console.log(object);
                // controls = new THREE.OrbitControls(object, renderer.domElement);
                if (isControl) {
                    event_controller = new eventController(renderer.domElement, checkPortrait(), model);
                    event_controller.attachEvent();
                }

                resolve(model);

            }, (xhr) => { }, (error) => {
                console.error(error);
            });
        }
        )
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
        // if (controls)
        //     controls.update();
        if (controlOrientation) {
            if (isUpdateControl)
                controlOrientation.update();
            else
                controlOrientation.update(true);
        }


        renderer.render(scene, camera);
        requestAnimationFrame(update);
    }

    update();

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

    window.addEventListener('click', e => raycast(e));
    window.addEventListener('touchend', e => raycast(e, true));

    function raycast(e, touch = false) {
        var mouse = {};
        if (touch) {
            mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
            mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
        } else {
            mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
            mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
        }
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects[0]) {
            var object = intersects[0].object;

            if (object.name === 'stacy') {

                if (!currentlyAnimating) {
                    currentlyAnimating = true;
                    playOnClick();
                }
            }
        }

        raycaster.ray.intersectPlane(plane, intersectPlanePoint);
        // model.position.set(intersectPlanePoint.x, intersectPlanePoint.y, intersectPlanePoint.z);
        // //   mesh.position.set(intersects.x, intersects.y, intersects.z);
        // if (!model)
        //     loadModel(MODEL_PATH, { x: intersectPlanePoint.x, y: intersectPlanePoint.y, z: intersectPlanePoint.z })
        // else
        //     model.position.set(intersectPlanePoint.x, intersectPlanePoint.y, intersectPlanePoint.z)
        if (!model && isFistLoadModel === true) {
            isFistLoadModel = false;
            console.log('load model', mesh.position)
            // camera.position.set(camParam.position.x, camParam.position.y, camParam.position.z);
            // camera.rotation.set(camParam.rotation.x, camParam.rotation.y, camParam.rotation.z);
            // controlOrientation = new DeviceOrientationControls(camera);
            isUpdateControl = false;
            // camera.rotation.set(0, 0, 0);
            loadModel(MODEL_PATH, true, { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z }).then((result) => {
                // camera.rotation.set(camera.rotation.x, -camera.rotation.y, camera.rotation.z);
                isUpdateControl = true;
                window['cam'] = camera.rotation;
                model = result;
                // model.rotation.y = Math.PI / 2;
                // model.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z)
                mesh.visible = false;
                console.log('cam rot ', camera.rotation);

                console.log('mesh rot ', mesh.rotation);
                console.log('model rot ', model.rotation);

            })
        }
        // else
        //     model.position.set(mesh.position.x, mesh.position.y, mesh.position.z)
    }



    // Get a random animation, and play it 
    function playOnClick() {
        let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
        playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
    }


    function playModifierAnimation(from, fSpeed, to, tSpeed) {
        to.setLoop(THREE.LoopOnce);
        to.reset();
        to.play();
        from.crossFadeTo(to, fSpeed, true);
        setTimeout(function () {
            from.enabled = true;
            to.crossFadeTo(from, tSpeed, true);
            currentlyAnimating = false;
        }, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
    }

    // var raycaster = new THREE.Raycaster();
    var intersects = new THREE.Vector3();
    // document.addEventListener('mousemove', function(e) {
    //     // var mousecoords = getMousePos(e);
    //     // if (neck && waist) {

    //     //     moveJoint(mousecoords, neck, 60);
    //     //     moveJoint(mousecoords, waist, 40);
    //     // }
    //     // var mouse = {}; {
    //     //     mouse.x = (2 * (mousecoords.x / window.innerWidth) - 1) * window.innerWidth / 10;
    //     //     mouse.y = (1 - 2 * (mousecoords.y / window.innerHeight)) * window.innerHeight / 10;
    //     // }
    //     // console.log(mouse)
    //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //     raycaster.setFromCamera(mouse, camera);
    //     raycaster.ray.intersectPlane(plane, intersects);
    //     mesh.position.set(intersects.x, intersects.y, intersects.z);
    // });

    function updateMeshPosition(degree) {
        degree = THREE.Math.degToRad(degree);
        // camera.rotation.x = degree;
        // let maxDegree = Math.PI / 2;
        // let d = 0,
        //     diff,
        //     percentage;
        // if (degree <= maxDegree / 2) {
        //     diff = maxDegree / 2 - degree;
        //     percentage = diff / (maxDegree / 2) * 100;
        //     d = 15 * percentage / 100 * -1;
        // } else {
        //     diff = degree - maxDegree / 2;
        //     percentage = diff / (maxDegree / 2) * 100;
        //     d = 15 * percentage / 100 * 1;
        // }
        // // d -= 10;
        // mesh.position.z = -d;
        // mesh.position.y = d;
        // // console.log('update pos ', d);
        mouse.x = 0;
        mouse.y = 0;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, intersects);
        if (mesh) {
            mesh.position.set(intersects.x, intersects.y, intersects.z);
            // console.log(mesh.position);
        }

    }

    function getMousePos(e) {
        return { x: e.clientX, y: e.clientY };
    }

    function moveJoint(mouse, joint, degreeLimit) {
        let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
        joint.rotation.y = THREE.Math.degToRad(degrees.x);
        joint.rotation.x = THREE.Math.degToRad(degrees.y);
        // console.log(joint.rotation.x);
    }

    function getMouseDegrees(x, y, degreeLimit) {
        let dx = 0,
            dy = 0,
            xdiff,
            xPercentage,
            ydiff,
            yPercentage;

        let w = { x: window.innerWidth, y: window.innerHeight };

        // Left (Rotates neck left between 0 and -degreeLimit)
        // 1. If cursor is in the left half of screen
        if (x <= w.x / 2) {
            // 2. Get the difference between middle of screen and cursor position
            xdiff = w.x / 2 - x;
            // 3. Find the percentage of that difference (percentage toward edge of screen)
            xPercentage = xdiff / (w.x / 2) * 100;
            // 4. Convert that to a percentage of the maximum rotation we allow for the neck
            dx = degreeLimit * xPercentage / 100 * -1;
        }

        // Right (Rotates neck right between 0 and degreeLimit)
        if (x >= w.x / 2) {
            xdiff = x - w.x / 2;
            xPercentage = xdiff / (w.x / 2) * 100;
            dx = degreeLimit * xPercentage / 100;
        }
        // Up (Rotates neck up between 0 and -degreeLimit)
        if (y <= w.y / 2) {
            ydiff = w.y / 2 - y;
            yPercentage = ydiff / (w.y / 2) * 100;
            // Note that I cut degreeLimit in half when she looks up
            dy = degreeLimit * 0.5 * yPercentage / 100 * -1;
        }
        // Down (Rotates neck down between 0 and degreeLimit)
        if (y >= w.y / 2) {
            ydiff = y - w.y / 2;
            yPercentage = ydiff / (w.y / 2) * 100;
            dy = degreeLimit * yPercentage / 100;
        }
        return { x: dx, y: dy };
    }

})();