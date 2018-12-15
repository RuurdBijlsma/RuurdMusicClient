import songLoader from './SongLoader';

class FrequencyVisualizer {
    constructor() {
        this.draw('lines');
    }

    setProgress(p) {
        this.progress = p;
    }

    attachCanvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.barData = [];
        this.bars = this.canvas.width*2;
        this.color = 'white';
    }

    draw(type='lines'){
        requestAnimationFrame(() => this.draw(type));
        if (!this.context || !this.barData.length > 0) return;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch(type){
            case 'lines':
                this.drawLines();
                break;
            case 'rects':
                this.drawRects();
                break;
        }
    }

    drawLines() {
        let maxValue = this.barData.reduce((a, b) => a > b ? a : b);
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(0, this.canvas.height / 2);
        this.context.strokeStyle = this.color;
        let barWidth = this.canvas.width / this.bars;
        let greyColor = 'grey';
        let flag = false;
        let x = 0, y = this.canvas.height / 2;

        for (let i = 0; i < this.barData.length; i++) {

            if (i / this.bars > this.progress && !flag) {
                flag = true;
                this.context.stroke();
                this.context.beginPath();
                this.context.strokeStyle = greyColor;
                this.context.moveTo(x, y);
            }

            x = Math.floor(i * barWidth);
            y = this.barData[i] / maxValue * this.canvas.height;
            y = Math.round(y / 2 + this.canvas.height / 2);

            this.context.lineTo(x, y);
        }

        this.context.lineTo(this.canvas.width * (this.barData.length / this.bars), this.canvas.height / 2);
        this.context.stroke();
    }

    drawRects() {
        let maxValue = this.barData.reduce((a, b) => a > b ? a : b);
        this.context.fillStyle = this.color;
        let barWidth = this.canvas.width / this.bars;

        for (let i = 0; i < this.bars; i++) {
            if (i / this.bars > this.progress)
                this.context.fillStyle = 'grey';

            let barHeight = Math.round(this.barData[i] / maxValue * this.canvas.height);
            let x = i * barWidth;
            let y = this.canvas.height / 2 - barHeight / 2;
            this.context.fillRect(x, y, barWidth, barHeight);
        }
    }

    async drawFrequencies(color, songUrl, cancellationToken = {}) {
        this.color = color;
        let channelData = await this.getChannelData(songUrl);
        let sliceSize = Math.floor(channelData.length / this.bars);

        let i = 0;
        let interval = setInterval(() => {
            let slice = channelData.slice(i, i + sliceSize);
            let avgValue = slice.reduce((a, b) => a + b) / slice.length;

            this.barData.push(avgValue);

            i += sliceSize;
            if (i > channelData.length || cancellationToken.cancelled)
                clearInterval(interval);
        });
    }

    async getChannelData(songUrl) {
        return new Promise(async resolve => {
            let file = await songLoader.loadFile(songUrl);
            let audioContext = FrequencyVisualizer.getAudioContext();
            audioContext.decodeAudioData(file, buffer => {
                let channelData = buffer.getChannelData(0);
                resolve(channelData);
            });
        });
    }

    static getAudioContext() {
        if (!this._audioContext)
            this._audioContext = new AudioContext();

        return this._audioContext;
    }
}

export default new FrequencyVisualizer();