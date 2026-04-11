import * as THREE from 'three';

export class AssetManager {
    public texFront!: THREE.Texture;
    public texBack!: THREE.Texture;
    
    private ctxFront!: CanvasRenderingContext2D;
    private posFlatData: number[][] = [];

    constructor() {
        this.posFlatData = [
            [-1.5, 1.5], [-0.5, 1.5], [0.5, 1.5], [1.5, 1.5],     
            [-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5],     
            [-1.5, -0.5], [-0.5, -0.5], [0.5, -0.5], [1.5, -0.5], 
            [-1.5, -1.5], [-0.5, -1.5], [0.5, -1.5], [1.5, -1.5], 
            [0, 0], [0, 0], [0, 0], [0, 0], // 16-19 placeholder
            [0, 0], [0, 0], [0, 0], [0, 0], // 20-23 placeholder
            [0, 1.0], [0, -1.0], [-1.0, 0], [1.0, 0], [0, 0],
            [-1.0, 1.0], [1.0, 1.0], [1.0, -1.0], [-1.0, -1.0]
        ];
        this.posFlatData[16] = [...this.posFlatData[1]]; this.posFlatData[17] = [...this.posFlatData[4]];
        this.posFlatData[18] = [...this.posFlatData[2]]; this.posFlatData[19] = [...this.posFlatData[7]];
        this.posFlatData[20] = [...this.posFlatData[11]]; this.posFlatData[21] = [...this.posFlatData[14]];
        this.posFlatData[22] = [...this.posFlatData[8]]; this.posFlatData[23] = [...this.posFlatData[13]];
    }

    public async loadAssets() {
        this.texFront = this.createTextureAtlas('F', this.getIndicesFront(), true);
        this.texBack = this.createTextureAtlas('B', this.getIndicesBack(), false);
    }

    private createTextureAtlas(prefix: string, indexArray: number[], isFront: boolean) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;

        if (isFront) {
            this.ctxFront = ctx;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 1024);
        
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const triCount = indexArray.length / 3;

        for (let i = 0; i < triCount; i++) {
            const pA = this.posFlatData[indexArray[i * 3]];
            const pB = this.posFlatData[indexArray[i * 3 + 1]];
            const pC = this.posFlatData[indexArray[i * 3 + 2]];

            const mapX = (x: number) => ((x + 1.5) / 3.0) * 1024;
            const mapY = (y: number) => (1.0 - ((y + 1.5) / 3.0)) * 1024;

            const cX = (mapX(pA[0]) + mapX(pB[0]) + mapX(pC[0])) / 3;
            const cY = (mapY(pA[1]) + mapY(pB[1]) + mapY(pC[1])) / 3;

            ctx.save();
            ctx.translate(cX, cY);
            if (prefix === 'F') ctx.scale(-1, 1);
            ctx.fillText(`${prefix}${i + 1}`, 0, 0);
            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false; 
        return texture;
    }

    public drawSeedOnFace(faceIndex: number, imageSrc: string) {
        const indexArray = this.getIndicesFront();
        if (faceIndex >= indexArray.length / 3) return;

        const pA = this.posFlatData[indexArray[faceIndex * 3]];
        const pB = this.posFlatData[indexArray[faceIndex * 3 + 1]];
        const pC = this.posFlatData[indexArray[faceIndex * 3 + 2]];

        const mapX = (x: number) => ((x + 1.5) / 3.0) * 1024;
        const mapY = (y: number) => (1.0 - ((y + 1.5) / 3.0)) * 1024;

        const vA = { x: mapX(pA[0]), y: mapY(pA[1]) };
        const vB = { x: mapX(pB[0]), y: mapY(pB[1]) };
        const vC = { x: mapX(pC[0]), y: mapY(pC[1]) };

        // 1. Identify hypotenuse (longest edge)
        const dAB = Math.hypot(vB.x - vA.x, vB.y - vA.y);
        const dBC = Math.hypot(vC.x - vB.x, vC.y - vB.y);
        const dCA = Math.hypot(vA.x - vC.x, vA.y - vC.y);

        let v1, v2, vOp, hypoLen;
        if (dAB >= dBC && dAB >= dCA) {
            v1 = vA; v2 = vB; vOp = vC; hypoLen = dAB;
        } else if (dBC >= dAB && dBC >= dCA) {
            v1 = vB; v2 = vC; vOp = vA; hypoLen = dBC;
        } else {
            v1 = vC; v2 = vA; vOp = vB; hypoLen = dCA;
        }

        const angle = Math.atan2(v2.y - v1.y, v2.x - v1.x);

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const isPortrait = img.naturalHeight > img.naturalWidth;
            const imgLongEdge = isPortrait ? img.naturalHeight : img.naturalWidth;
            const imgShortEdge = isPortrait ? img.naturalWidth : img.naturalHeight;

            // Calculate altitude (distance from hypotenuse to opposite vertex)
            const dxOp = vOp.x - v1.x;
            const dyOp = vOp.y - v1.y;
            const localYOfVOp = -dxOp * Math.sin(angle) + dyOp * Math.cos(angle);
            const altitude = Math.abs(localYOfVOp);
            const dir = Math.sign(localYOfVOp);

            // Scale factor to ensure all pixels fit inside the triangle
            // It must be bounded by the hypotenuse length and the altitude height
            const scaleW = hypoLen / imgLongEdge;
            const scaleH = altitude / imgShortEdge;
            const scale = Math.min(scaleW, scaleH);

            const W = imgShortEdge * scale;
            const H = imgLongEdge * scale;
            const offsetX = (hypoLen - H) / 2;

            this.ctxFront.save();
            
            // --- NEW: CLIPPING MASK ---
            // Restrict drawing strictly to the exact boundaries of this triangle face.
            this.ctxFront.beginPath();
            this.ctxFront.moveTo(vA.x, vA.y);
            this.ctxFront.lineTo(vB.x, vB.y);
            this.ctxFront.lineTo(vC.x, vC.y);
            this.ctxFront.closePath();
            this.ctxFront.clip();
            // --------------------------

            // 2. Align coordinate system to v1 -> v2 (X-axis is hypotenuse)
            this.ctxFront.translate(v1.x, v1.y);
            this.ctxFront.rotate(angle);
            this.ctxFront.translate(offsetX, 0);

            // 4. Position and Draw based on Portrait/Landscape
            if (isPortrait) {
                if (dir > 0) {
                    this.ctxFront.translate(0, W);
                    this.ctxFront.rotate(-Math.PI / 2);
                    
                    // Local UV Flip
                    this.ctxFront.translate(W/2, H/2);
                    this.ctxFront.scale(-1, 1);
                    // 180 Rotation to align bottom with hypotenuse
                    this.ctxFront.rotate(Math.PI);
                    this.ctxFront.translate(-W/2, -H/2);
                    
                    this.ctxFront.drawImage(img, 0, 0, W, H);
                } else {
                    this.ctxFront.rotate(-Math.PI / 2);
                    
                    // Local UV Flip
                    this.ctxFront.translate(W/2, H/2);
                    this.ctxFront.scale(-1, 1);
                    // 180 Rotation to align bottom with hypotenuse
                    this.ctxFront.rotate(Math.PI);
                    this.ctxFront.translate(-W/2, -H/2);

                    this.ctxFront.drawImage(img, 0, 0, W, H);
                }
            } else {
                if (dir > 0) {
                    // Local UV Flip
                    this.ctxFront.translate(H/2, W/2);
                    this.ctxFront.scale(-1, 1);
                    // 180 Rotation to align bottom with hypotenuse
                    this.ctxFront.rotate(Math.PI);
                    this.ctxFront.translate(-H/2, -W/2);

                    this.ctxFront.drawImage(img, 0, 0, H, W);
                } else {
                    this.ctxFront.translate(0, -W);
                    
                    // Local UV Flip
                    this.ctxFront.translate(H/2, W/2);
                    this.ctxFront.scale(-1, 1);
                    // 180 Rotation to align bottom with hypotenuse
                    this.ctxFront.rotate(Math.PI);
                    this.ctxFront.translate(-H/2, -W/2);

                    this.ctxFront.drawImage(img, 0, 0, H, W);
                }
            }
            
            this.ctxFront.restore();
            this.texFront.needsUpdate = true;
        };
    }

    private getIndicesFront() {
        return [
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

    private getIndicesBack() {
        return [
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
    }
}
