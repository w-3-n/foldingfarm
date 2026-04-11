import * as THREE from 'three';

export class SceneManager {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, -4, 6);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap; 
        document.body.appendChild(this.renderer.domElement);

        this.initLights();
        this.initResizeHandler();
    }

    private initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.scene.add(this.createShadowLight(-3, 3));  
        this.scene.add(this.createShadowLight(3, 3));   
        this.scene.add(this.createShadowLight(-3, -3)); 
        this.scene.add(this.createShadowLight(3, -3));  
    }

    private createShadowLight(x: number, y: number) {
        const light = new THREE.DirectionalLight(0xffffff, 0.15); 
        light.position.set(x, y, 10);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024; 
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 20;
        const d = 3;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.bias = -0.0001;
        return light;
    }

    private initResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    public render() {
        this.renderer.render(this.scene, this.camera);
    }
}
