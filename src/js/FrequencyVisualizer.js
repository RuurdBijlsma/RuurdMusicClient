import songLoader from './SongLoader';

class FrequencyVisualizer {
    async drawFrequencies(canvas, color, songUrl) {
        let channelData = await this.getChannelData(songUrl);
        let bars = canvas.width / 2;
        let barData = [];
        let sliceSize = Math.floor(channelData.length / bars);
        let maxValue = -Infinity;
        for (let i = 0; i < channelData.length; i += sliceSize) {
            let slice = channelData.slice(i, i + sliceSize);
            let avgValue = slice.reduce((a, b) => a + b) / slice.length;
            barData.push(avgValue);
            if (avgValue > maxValue)
                maxValue = avgValue;
        }

        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = color;
        let barWidth = canvas.width / bars;
        for (let i = 0; i < barData.length; i++) {
            let barHeight = barData[i] / maxValue * canvas.height;
            context.fillRect(i * barWidth, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        }
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