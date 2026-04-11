import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class InputManager {
    public controls: OrbitControls;
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;
    private camera: THREE.Camera;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enableDamping = true;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    public getIntersectedFaceIndex(clientX: number, clientY: number, mesh: THREE.Mesh): number | null {
        // Convert screen coordinates to normalized device coordinates (-1 to +1)
        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(mesh);

        if (intersects.length > 0) {
            return intersects[0].faceIndex ?? null;
        }

        return null;
    }

    public update() {
        this.controls.update();
    }
}
