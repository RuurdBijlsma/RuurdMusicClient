export default class CustomApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(type, params, body) {
        console.log("BODY", JSON.stringify(body));
        let response = await fetch(this.baseUrl + '/' + params.join('/'), {
            method: type,
            headers: {
                "Content-Type": "application/json",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify(body)
        });
        return await response.json();
    }

    async get(...params) {
        return await this.request('get', params, {});
    }

    async post(body, ...params) {
        console.log('post', params, body);
        return await this.request('post', params, body);
    }
}