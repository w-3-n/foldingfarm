import * as THREE from 'three';

export class Origami {
    public meshFront!: THREE.Mesh;
    public meshBack!: THREE.Mesh;
    private geometryFront!: THREE.BufferGeometry;
    private geometryBack!: THREE.BufferGeometry;
    private positionAttribute!: THREE.BufferAttribute;
    private uvAttribute!: THREE.BufferAttribute;
    
    private posFlat: number[][] = [];
    private posFolded: number[][] = [];
    private indicesFront: number[] = [];
    private indicesBack: number[] = [];

    private texFront: THREE.Texture;
    private texBack: THREE.Texture;

    private matFrontInner!: THREE.MeshStandardMaterial;
    private matBackInner!: THREE.MeshStandardMaterial;
    private matFrontCorner!: THREE.MeshStandardMaterial;
    private matBackCorner!: THREE.MeshStandardMaterial;

    constructor(texFront: THREE.Texture, texBack: THREE.Texture) {
        this.texFront = texFront;
        this.texBack = texBack;
        
        this.initData();
        this.initGeometry();
        this.initMaterials();
        
        this.meshFront = new THREE.Mesh(this.geometryFront, [this.matFrontInner, this.matFrontCorner]);
        this.meshBack = new THREE.Mesh(this.geometryBack, [this.matBackInner, this.matBackCorner]);
        
        this.meshFront.castShadow = true;
        this.meshFront.receiveShadow = true;
        this.meshBack.castShadow = true;
        this.meshBack.receiveShadow = true;
    }

    private initData() {
        this.posFlat = [
            [-1.5, 1.5, 0], [-0.5, 1.5, 0], [0.5, 1.5, 0], [1.5, 1.5, 0],     
            [-1.5, 0.5, 0], [-0.5, 0.5, 0], [0.5, 0.5, 0], [1.5, 0.5, 0],     
            [-1.5, -0.5, 0], [-0.5, -0.5, 0], [0.5, -0.5, 0], [1.5, -0.5, 0], 
            [-1.5, -1.5, 0], [-0.5, -1.5, 0], [0.5, -1.5, 0], [1.5, -1.5, 0], 
            [-1.5, -1.5, 0], [-0.5, -1.5, 0], [0.5, -1.5, 0], [1.5, -1.5, 0], 
            [-1.5, -1.5, 0], [-0.5, -1.5, 0], [0.5, -1.5, 0], [1.5, -1.5, 0]
        ];

        this.posFlat.push([0, 1.0, 0]);   // 24 
        this.posFlat.push([0, -1.0, 0]);  // 25 
        this.posFlat.push([-1.0, 0, 0]);  // 26 
        this.posFlat.push([1.0, 0, 0]);   // 27 
        this.posFlat.push([0, 0, 0]);     // 28 

        this.posFlat.push([-1.0, 1.0, 0]);  // 29 
        this.posFlat.push([1.0, 1.0, 0]);   // 30 
        this.posFlat.push([1.0, -1.0, 0]);  // 31 
        this.posFlat.push([-1.0, -1.0, 0]); // 32 

        for(let i=0; i<33; i++) this.posFolded.push([0,0,0]);

        this.posFolded[5] = [-0.5, 0.5, 0];   
        this.posFolded[6] = [0.5, 0.5, 0];    
        this.posFolded[10] = [0.5, -0.5, 0];  
        this.posFolded[9] = [-0.5, -0.5, 0];  

        this.posFolded[8] = [-0.5, 0.5, 0.01];  
        this.posFolded[1] = [0.5, 0.5, 0.01];   
        this.posFolded[7] = [0.5, -0.5, 0.01];  
        this.posFolded[14] = [-0.5, -0.5, 0.01];

        this.posFolded[13] = [-0.5, 0.5, 0.02]; 
        this.posFolded[4] = [0.5, 0.5, 0.02];   
        this.posFolded[2] = [0.5, -0.5, 0.02];  
        this.posFolded[11] = [-0.5, -0.5, 0.02];

        this.posFolded[0] = [0.5, 1.5, 0.03];   
        this.posFolded[3] = [1.5, -0.5, 0.03];  
        this.posFolded[15] = [-0.5, -1.5, 0.03];
        this.posFolded[12] = [-1.5, 0.5, 0.03]; 

        this.posFlat[16] = [...this.posFlat[1]]; this.posFlat[17] = [...this.posFlat[4]];
        this.posFlat[18] = [...this.posFlat[2]]; this.posFlat[19] = [...this.posFlat[7]];
        this.posFlat[20] = [...this.posFlat[11]]; this.posFlat[21] = [...this.posFlat[14]];
        this.posFlat[22] = [...this.posFlat[8]]; this.posFlat[23] = [...this.posFlat[13]];

        this.posFolded[16] = [...this.posFolded[1]]; this.posFolded[17] = [...this.posFolded[4]];
        this.posFolded[18] = [...this.posFolded[2]]; this.posFolded[19] = [...this.posFolded[7]];
        this.posFolded[20] = [...this.posFolded[11]]; this.posFolded[21] = [...this.posFolded[14]];
        this.posFolded[22] = [...this.posFolded[8]]; this.posFolded[23] = [...this.posFolded[13]];

        this.indicesBack = [
            0, 16, 5, 0, 5, 17,     
            1, 2, 24, 2, 6, 24, 6, 5, 24, 5, 1, 24, 
            18, 3, 6, 3, 19, 6,     
            6, 7, 27, 7, 11, 27, 11, 10, 27, 10, 6, 27, 
            10, 20, 15, 10, 15, 21, 
            9, 10, 25, 10, 14, 25, 14, 13, 25, 13, 9, 25, 
            12, 22, 9, 12, 9, 23,   
            4, 5, 26, 5, 9, 26, 9, 8, 26, 8, 4, 26,
            5, 6, 28, 6, 10, 28, 10, 9, 28, 9, 5, 28 
        ];

        this.indicesFront = [
            0, 16, 29, 16, 5, 29, 0, 5, 17,     
            1, 2, 24, 2, 6, 24, 6, 5, 24, 5, 1, 24, 
            18, 3, 6, 3, 19, 30, 19, 6, 30,     
            6, 7, 27, 7, 11, 27, 11, 10, 27, 10, 6, 27, 
            10, 20, 15, 10, 31, 21, 31, 15, 21, 
            9, 10, 25, 10, 14, 25, 14, 13, 25, 13, 9, 25, 
            12, 22, 32, 22, 9, 32, 12, 9, 23,   
            4, 5, 26, 5, 9, 26, 9, 8, 26, 8, 4, 26, 
            5, 6, 28, 6, 10, 28, 10, 9, 28, 9, 5, 28 
        ];
    }

    private initGeometry() {
        const vertices = new Float32Array(33 * 3);
        const uvs = new Float32Array(33 * 2);
        for(let i=0; i<33; i++) {
            uvs[i * 2] = (this.posFlat[i][0] + 1.5) / 3.0;         
            uvs[i * 2 + 1] = 1.0 - ((this.posFlat[i][1] + 1.5) / 3.0); 
        }

        this.positionAttribute = new THREE.BufferAttribute(vertices, 3);
        this.uvAttribute = new THREE.BufferAttribute(uvs, 2);

        this.geometryFront = new THREE.BufferGeometry();
        this.geometryFront.setAttribute('position', this.positionAttribute);
        this.geometryFront.setAttribute('uv', this.uvAttribute);
        this.geometryFront.setIndex(this.indicesFront);

        this.geometryBack = new THREE.BufferGeometry();
        this.geometryBack.setAttribute('position', this.positionAttribute);
        this.geometryBack.setAttribute('uv', this.uvAttribute);
        this.geometryBack.setIndex(this.indicesBack);

        this.geometryFront.addGroup(0, 9, 1);   
        this.geometryFront.addGroup(9, 12, 0);  
        this.geometryFront.addGroup(21, 9, 1);  
        this.geometryFront.addGroup(30, 12, 0); 
        this.geometryFront.addGroup(42, 9, 1);  
        this.geometryFront.addGroup(51, 12, 0); 
        this.geometryFront.addGroup(63, 9, 1);  
        this.geometryFront.addGroup(72, 12, 0); 
        this.geometryFront.addGroup(84, 12, 0); 

        this.geometryBack.addGroup(0, 6, 1);   
        this.geometryBack.addGroup(6, 12, 0);  
        this.geometryBack.addGroup(18, 6, 1);  
        this.geometryBack.addGroup(24, 12, 0); 
        this.geometryBack.addGroup(36, 6, 1);  
        this.geometryBack.addGroup(42, 12, 0); 
        this.geometryBack.addGroup(54, 6, 1);  
        this.geometryBack.addGroup(60, 12, 0); 
        this.geometryBack.addGroup(72, 12, 0); 
    }

    private initMaterials() {
        this.matFrontInner = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, side: THREE.FrontSide, map: this.texFront, roughness: 1.0, metalness: 0.0, 
            flatShading: true 
        });
        this.matBackInner = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00, side: THREE.BackSide, map: this.texBack, roughness: 1.0, metalness: 0.0, 
            flatShading: true 
        });
        
        this.matFrontCorner = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, side: THREE.FrontSide, map: this.texFront, roughness: 1.0, metalness: 0.0, 
            flatShading: true 
        });
        this.matBackCorner = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, side: THREE.BackSide, map: this.texBack, roughness: 1.0, metalness: 0.0, 
            flatShading: true 
        });
    }

    public updateFold(stageValue: number) {
        const p = this.positionAttribute.array as Float32Array;
        
        if (stageValue >= 2.0) {
            this.matBackCorner.color.setHex(0xffcc00); 
            if (this.matBackCorner.map !== this.texBack) {
                this.matBackCorner.map = this.texBack;
                this.matBackCorner.needsUpdate = true;
            }
        } else {
            this.matBackCorner.color.setHex(0xffffff); 
            if (this.matBackCorner.map !== this.texFront) {
                this.matBackCorner.map = this.texFront;
                this.matBackCorner.needsUpdate = true;
            }
        }

        for (let i = 0; i < 24; i++) {
            let x, y, z;
            if (stageValue >= 2.0) {
                const t = stageValue - 2.0; 
                const folded = this.posFolded[i];
                const flat = this.posFlat[i];
                
                x = folded[0] + (flat[0] - folded[0]) * t;
                y = folded[1] + (flat[1] - folded[1]) * t;
                
                let zLift = 0;
                if (![5, 6, 9, 10].includes(i)) {
                    let hinge = 5; 
                    if ([2, 3, 7, 18, 19].includes(i)) hinge = 6;       
                    else if ([11, 14, 15, 20, 21].includes(i)) hinge = 10; 
                    else if ([8, 12, 13, 22, 23].includes(i)) hinge = 9;   
                    
                    const hx = this.posFlat[hinge][0];
                    const hy = this.posFlat[hinge][1];
                    const R2 = Math.pow(flat[0] - hx, 2) + Math.pow(flat[1] - hy, 2);
                    const currentDist2 = Math.pow(x - hx, 2) + Math.pow(y - hy, 2);
                    
                    const inside = R2 - currentDist2;
                    if (inside > 0) zLift = Math.sqrt(inside);
                }
                const baseZ = folded[2] + (flat[2] - folded[2]) * t;
                z = baseZ + zLift;

            } else {
                const t = stageValue - 1.0;
                const angle = (1 - t) * Math.PI; 
                x = this.posFolded[i][0];
                y = this.posFolded[i][1];
                z = this.posFolded[i][2]; 
                
                const baseZ = 0.01; 
                const d = 0.002; 

                if (i === 16) { x = 0.5; y = 0.5 + d * Math.sin(angle); z = baseZ - d * Math.cos(angle); } 
                else if (i === 17) { x = 0.5; y = 0.5 - d * Math.sin(angle); z = baseZ + d * Math.cos(angle); } 
                else if (i === 18) { x = 0.5 - d * Math.sin(angle); y = -0.5; z = baseZ + d * Math.cos(angle); } 
                else if (i === 19) { x = 0.5 + d * Math.sin(angle); y = -0.5; z = baseZ - d * Math.cos(angle); } 
                else if (i === 20) { x = -0.5; y = -0.5 + d * Math.sin(angle); z = baseZ + d * Math.cos(angle); } 
                else if (i === 21) { x = -0.5; y = -0.5 - d * Math.sin(angle); z = baseZ - d * Math.cos(angle); } 
                else if (i === 22) { x = -0.5 - d * Math.sin(angle); y = 0.5; z = baseZ - d * Math.cos(angle); } 
                else if (i === 23) { x = -0.5 + d * Math.sin(angle); y = 0.5; z = baseZ + d * Math.cos(angle); } 
                
                else if (i === 0) { x = 0.5; y = 0.5 + 1.0 * Math.cos(angle); z = (0.020 + (this.posFolded[0][2] - 0.020) * t) + 1.0 * Math.sin(angle); } 
                else if (i === 3) { x = 0.5 + 1.0 * Math.cos(angle); y = -0.5; z = (0.023 + (this.posFolded[3][2] - 0.023) * t) + 1.0 * Math.sin(angle); } 
                else if (i === 15) { x = -0.5; y = -0.5 - 1.0 * Math.cos(angle); z = (0.026 + (this.posFolded[15][2] - 0.026) * t) + 1.0 * Math.sin(angle); } 
                else if (i === 12) { x = -0.5 - 1.0 * Math.cos(angle); y = 0.5; z = (0.029 + (this.posFolded[12][2] - 0.029) * t) + 1.0 * Math.sin(angle); }
            }
            p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
        }

        p[24*3] = (p[2*3] + p[5*3]) / 2; p[24*3+1] = (p[2*3+1] + p[5*3+1]) / 2; p[24*3+2] = (p[2*3+2] + p[5*3+2]) / 2;
        p[25*3] = (p[10*3] + p[13*3]) / 2; p[25*3+1] = (p[10*3+1] + p[13*3+1]) / 2; p[25*3+2] = (p[10*3+2] + p[13*3+2]) / 2;
        p[26*3] = (p[4*3] + p[9*3]) / 2; p[26*3+1] = (p[4*3+1] + p[9*3+1]) / 2; p[26*3+2] = (p[4*3+2] + p[9*3+2]) / 2;
        p[27*3] = (p[6*3] + p[11*3]) / 2; p[27*3+1] = (p[6*3+1] + p[11*3+1]) / 2; p[27*3+2] = (p[6*3+2] + p[11*3+2]) / 2;
        
        let centerDepression = 0;
        if (stageValue <= 2.0) {
            centerDepression = 0.015; 
        } else {
            centerDepression = 0.015 * (3.0 - stageValue); 
        }
        p[28*3] = (p[5*3] + p[10*3]) / 2; 
        p[28*3+1] = (p[5*3+1] + p[10*3+1]) / 2; 
        p[28*3+2] = ((p[5*3+2] + p[10*3+2]) / 2) - centerDepression;

        p[29*3] = (p[0*3] + p[5*3]) / 2; p[29*3+1] = (p[0*3+1] + p[5*3+1]) / 2; p[29*3+2] = (p[0*3+2] + p[5*3+2]) / 2;
        p[30*3] = (p[3*3] + p[6*3]) / 2; p[30*3+1] = (p[3*3+1] + p[6*3+1]) / 2; p[30*3+2] = (p[3*3+2] + p[6*3+2]) / 2;
        p[31*3] = (p[10*3] + p[15*3]) / 2; p[31*3+1] = (p[10*3+1] + p[15*3+1]) / 2; p[31*3+2] = (p[10*3+2] + p[15*3+2]) / 2;
        p[32*3] = (p[12*3] + p[9*3]) / 2; p[32*3+1] = (p[12*3+1] + p[9*3+1]) / 2; p[32*3+2] = (p[12*3+2] + p[9*3+2]) / 2;
        
        this.positionAttribute.needsUpdate = true;
        this.geometryFront.computeVertexNormals();
        this.geometryBack.computeVertexNormals();
    }
}
