import { SceneManager } from './SceneManager';
import { AssetManager } from '../managers/AssetManager';
import { Origami } from '../entities/Origami';
import { InputManager } from './InputManager';
import { UIManager } from '../ui/UIManager';

export class GameManager {
    private sceneManager!: SceneManager;
    private assetManager!: AssetManager;
    private origami!: Origami;
    private inputManager!: InputManager;
    private currentStage: number = 1.0;

    constructor() {
        this.init();
    }

    private async init() {
        this.sceneManager = new SceneManager();
        this.assetManager = new AssetManager();
        
        await this.assetManager.loadAssets();

        this.origami = new Origami(this.assetManager.texFront, this.assetManager.texBack);
        this.sceneManager.scene.add(this.origami.meshFront);
        this.sceneManager.scene.add(this.origami.meshBack);

        this.inputManager = new InputManager(this.sceneManager.camera, this.sceneManager.renderer.domElement);
        
        new UIManager((val) => {
            this.currentStage = val;
            this.origami.updateFold(val);
        });

        this.initDragAndDrop();

        this.origami.updateFold(1.0);
        this.animate();
    }

    private initDragAndDrop() {
        const el = this.sceneManager.renderer.domElement;

        el.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        el.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Only allow planting in Stage 1
            if (Math.abs(this.currentStage - 1.0) > 0.01) return;

            const faceIndex = this.inputManager.getIntersectedFaceIndex(e.clientX, e.clientY, this.origami.meshFront);
            if (faceIndex !== null) {
                // Target Labels:
                // F1  -> idx 0
                // F9  -> idx 8
                // F17 -> idx 16
                // F22 -> idx 21
                const targetIndices = [0, 8, 16, 21];
                if (targetIndices.includes(faceIndex)) {
                    // Get seed info from drag data (passed via dataTransfer)
                    // Note: In a real app we might pass the seed ID.
                    // For now we know it's s1.png
                    this.assetManager.drawSeedOnFace(faceIndex, 'crops/s1.png');
                }
            }
        });

        // Ensure the inventory items set up dataTransfer
        document.querySelectorAll('.inventory-item').forEach(item => {
            item.addEventListener('dragstart', (e: any) => {
                e.dataTransfer.setData('seed', item.getAttribute('data-seed'));
            });
        });
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.inputManager.update();
        this.sceneManager.render();
    }
}
