 //////////////// Pick detail part of model ////////////////
 class PickHelper {
     constructor(arScene, onPickModel) {
         this.raycaster = new THREE.Raycaster();
         this.pickedObject = null;
         this.arScene = arScene;
         this.onPickModel = onPickModel;
     }

     /**
      * @param {object} normalizedPosition - position of mouse on canvas
      */
     pick(normalizedPosition) {
         if (this.pickedObject) {
             this.pickedObject = undefined;
         }
         // cast a ray through the frustum
         this.raycaster.setFromCamera(normalizedPosition, this.arScene.camera);
         this.raycaster.near = 0.1;
         this.raycaster.far = 1000;

         // get the list of objects the ray intersected
         // the 'true' pram is used for check detail of model
         const intersectedObjects = this.raycaster.intersectObjects(this.arScene.scene.children, true);
         if (intersectedObjects.length > 0) {
             // pick the first object. It's the closest one
             this.pickedObject = intersectedObjects[0].object;
             let name = this.pickedObject.name;
             let nameArray = name.split("_");
             console.log(name)
             console.log('pos ', this.pickedObject.position)
            //  if(boxTest){
            //      console.log('box test')
            //      boxTest.position.set(this.pickedObject.position.x, this.pickedObject.position.y, this.pickedObject.position.z);
            //  }
             if (nameArray[0] === "Interact") {
                 if (this.onPickModel)
                     this.onPickModel(nameArray[1]);
             }
         }
     }
 }

 // var box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({
    //     color: "aqua"
    // }));
    // box.position.z = -50;
    // box.position.x = -10
    // scene.add(box);