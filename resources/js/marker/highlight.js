// class HighLight {
//     composer;
//     outlinePass;
//     selectedObjects = [];
//     EffectComposer = window['EffectComposer'];
//     RenderPass = window['RenderPass'];
//     ShaderPass = window['ShaderPass'];
//     OutlinePass = window['OutlinePass'];
//     THREEModule = window['THREEModule'];
//     constructor(renderer, scene, camera) {
//         this.renderer = renderer;
//         this.scene = scene;
//         this.camera = camera;
//     }
//     init() {
//         return new Promise((resolve, reject) => {
//             this.composer = new EffectComposer(this.renderer);
//             var renderPass = new RenderPass(this.scene, this.camera);
//             this.composer.addPass(renderPass);
//             console.log(THREEModule)
//             this.outlinePass = new OutlinePass(new THREEModule.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
//             this.composer.addPass(this.outlinePass);
//             this.outlinePass.edgeStrength = 10;
//             this.outlinePass.edgeGlow = 1.0;
//             this.outlinePass.edgeThickness = 2.0;

//             resolve();
//         })
//     }

//     update() {
//         // console.log(this.outlinePass.selectedObjects)
//         this.composer.render();
//     }

//     addSelectedObject(object) {
//         this.selectedObjects.push(object);
//         // this.outlinePass.selectedObjects = [];
//         this.outlinePass.selectedObjects = this.selectedObjects;
//         console.log(this.selectedObjects)
//     }

// }