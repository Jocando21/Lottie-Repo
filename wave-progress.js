class WaveProgress {
    constructor(canvasId, config = {}) {
        this.config = Object.assign({
            width: 300,
            height: 100,
            goalAmount: 100,
            waterColor: ["#0096FF", "#0033AA"],
            opacity: 0.8,
            waveHeight: 6,
            waveSpeed: 0.015,
            counterFormat: "percentage", // "percentage", "fraction", "textBar"
        }, config);

        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID '${canvasId}' not found.`);
            return;
        }

        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;

        this.currentPercentage = 0;
        this.xOffset = this.canvas.width * 0.5;
        this.offsetTarget = this.xOffset;
        this.offsetPrev = this.xOffset;
        this.move = false;
        this.moveCur = 0;
        this.moveDur = 50;

        this.waveCurrent = this.canvas.width * 0.5;
        this.waveSpdCur = this.config.waveSpeed;
        this.waveCur = 0;
        this.waveDown = false;
        this.waveDiff = 0;

        this.gradient = this.createGradient();
        this.updateProgress(0);
        requestAnimationFrame(() => this.draw());
    }

    createGradient() {
        let gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.config.waterColor[0]);
        gradient.addColorStop(1, this.config.waterColor[1]);
        return gradient;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.globalAlpha = this.config.opacity;
        this.ctx.beginPath();

        if (this.move) {
            let step = this.moveCur / this.moveDur;
            step = 1 - Math.pow(1 - step, 3);
            this.xOffset = this.lerp(this.offsetPrev, this.offsetTarget, step);
            this.moveCur++;
            if (this.xOffset === this.offsetTarget) this.move = false;
        }

        let x = this.config.waveHeight * Math.sin(this.canvas.height * 0.02 + this.waveCurrent);
        this.ctx.moveTo(this.xOffset + x, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, 0);
        x = this.config.waveHeight * Math.sin(this.waveCurrent);
        this.ctx.lineTo(this.xOffset + x, 0);
        for (let i = 0; i <= this.canvas.height; i++) {
            x = this.config.waveHeight * Math.sin(i * 0.02 + this.waveCurrent);
            this.ctx.lineTo(this.xOffset + x, i);
        }
        this.ctx.clip();

        this.ctx.fillStyle = this.gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        this.waveCurrent += this.config.waveSpeed;
        requestAnimationFrame(() => this.draw());
    }

    updateProgress(percentage) {
        percentage = Math.max(0, Math.min(100, percentage));
        this.currentPercentage = percentage;
        let percentValue = (percentage / this.config.goalAmount) * 100;
        this.offsetTarget = (percentValue / 100) * (this.canvas.width - this.config.waveHeight) + 8;

        this.offsetPrev = this.xOffset;
        this.move = true;
        this.moveCur = 0;

        let counterText;
        if (this.config.counterFormat === "percentage") {
            counterText = percentage + "%";
        } else if (this.config.counterFormat === "fraction") {
            counterText = percentage + " / " + this.config.goalAmount;
        } else {
            counterText = "[" + "█".repeat(percentage / 10) + "░".repeat(10 - percentage / 10) + "]";
        }
        let counterElement = document.getElementById("counter");
        if (counterElement) counterElement.textContent = counterText;
    }

    changeProgress(amount) {
        this.updateProgress(this.currentPercentage + amount);
    }

    resetProgress() {
        this.updateProgress(0);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }
}

export default WaveProgress;