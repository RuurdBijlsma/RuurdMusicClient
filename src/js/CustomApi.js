export default class CustomApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(type, params) {
        let response = await fetch(this.baseUrl + '/' + params.join('/'), {method: type});
        return await response.json();
    }

    async get(...params) {
        return await this.request('get', params);
    }

    async post(...params) {
        return await this.request('post', params);
    }
}