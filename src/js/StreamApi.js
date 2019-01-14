import CustomApi from './CustomApi';
import Song from './Song';

export default class StreamApi extends CustomApi {
    constructor(server) {
        super(server);
    }

    changeUser(user){
        this.user = user;
    }

    async await(ytId) {
        return await this.post(this.user, 'await', ytId);
    }

    async search(query) {
        let songs = await this.post(this.user, 'search', query);
        return songs.map(s => Song.fromObject(s));
    }

    async songs() {
        let songs = await this.post(this.user, 'songs');
        return songs.map(s => Song.fromObject(s));
    }

    async save(ytId) {
        return await this.post(this.user, 'save', ytId);
    }

    async remove(ytId) {
        return await this.post(this.user, 'remove', ytId);
    }

    getStreamUrl(ytId) {
        return this.baseUrl + '/stream/' + ytId;
    }

    getDownloadUrl(ytId) {
        return this.baseUrl + '/download/' + ytId;
    }
}