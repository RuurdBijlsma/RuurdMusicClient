import fs from './FileStorage';

class MediaHelper {
    async getAudioSource(api, ytId) {
        let fileName = ytId + '.mp3';
        let url = api.getStreamUrl(ytId);
        await fs.awaitReady();
        if (await fs.exists(fileName))
            url = (await fs.getFileByName(fileName)).toURL();

        return url;
    }

    async cacheSongLocallyIfNeeded(api, ytId) {
        if (!await fs.exists(ytId + '.mp3'))
            await this.cacheSongLocally(api, ytId);
    }

    async cacheSongLocally(api, ytId) {
        console.log("Caching song");
        let url = api.getDownloadUrl(ytId);
        let response = await fetch(url);
        let audioBlob = await response.blob();
        console.log("Download complete", audioBlob);

        let result = await fs.createFileFromBlob(ytId + '.mp3', audioBlob);
        console.log("Cache complete", result);
    }
}

export default new MediaHelper();