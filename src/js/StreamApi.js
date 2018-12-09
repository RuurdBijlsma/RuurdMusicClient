import CustomApi from './CustomApi';

export default class StreamApi extends CustomApi {
    constructor(server) {
        super(server);
    }

    async search(query) {
        return await this.get('search', query);
    }

    async songs(user) {
        return await this.get('songs', user);
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