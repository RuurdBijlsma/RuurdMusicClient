import CustomApi from './CustomApi';
import Song from './Song';

export default class StreamApi extends CustomApi {
    constructor(server) {
        super(server);
    }

    async await(ytId) {
        return await this.get('await', ytId);
    }

    async search(query) {
        let songs = await this.get('search', query);
        return songs.map(s => Song.fromObject(s));
    }

    async songs(user) {
        let songs = await this.get('songs', user);
        return songs.map(s => Song.fromObject(s));
    }

    async save(ytId) {
        return await this.post('save', ytId);
    }

    async remove(ytId) {
        return await this.post('remove', ytId);
    }

    getStreamUrl(ytId) {
        return this.baseUrl + '/stream/' + ytId;
    }

    getDownloadUrl(ytId) {
        return this.baseUrl + '/download/' + ytId;
    }
}