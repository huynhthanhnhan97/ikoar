 //////////////// Pick detail part of model ////////////////
 class PickHelper {
     constructor(scene, camera, onPickModel) {
         this.raycaster = new THREE.Raycaster();
         this.pickedObject = null;
         this.scene = scene;
         this.camera = camera;
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
         this.raycaster.setFromCamera(normalizedPosition, this.camera);
         this.raycaster.near = 0.1;
         this.raycaster.far = 1000;

         // get the list of objects the ray intersected
         // the 'true' pram is used for check detail of model
         const intersectedObjects = this.raycaster.intersectObjects(this.scene.children, true);

         if (intersectedObjects.length > 0) {
             // pick the first object. It's the closest one
             this.pickedObject = intersectedObjects[0].object;
             let name = this.pickedObject.name;
             let nameArray = name.split("_");
             if (nameArray[0] === "Interact") {
                 if (this.onPickModel)
                     this.onPickModel(nameArray[1]);
             }
         }
     }
 }