export class UIManager {
    private slider: HTMLInputElement;
    private foldValueText: HTMLElement;
    private onFoldUpdate: (value: number) => void;

    constructor(onFoldUpdate: (value: number) => void) {
        this.onFoldUpdate = onFoldUpdate;
        
        this.slider = document.getElementById('foldSlider') as HTMLInputElement;
        this.foldValueText = document.getElementById('foldValue') as HTMLElement;

        this.initListeners();
    }

    private initListeners() {
        this.slider.addEventListener('input', (event) => {
            const val = parseFloat((event.target as HTMLInputElement).value);
            this.updateText(val);
            this.onFoldUpdate(val);
        });
    }

    public updateText(val: number) {
        if (val === 1) this.foldValueText.innerText = "Stage 1 (Sealed)";
        else if (val === 2) this.foldValueText.innerText = "Stage 2 (Windmill)";
        else if (val === 3) this.foldValueText.innerText = "Stage 3 (Flat)";
        else this.foldValueText.innerText = `Folding... (${val.toFixed(2)})`;
    }
}
