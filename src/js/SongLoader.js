class SongLoader {
    constructor() {

    }

    async loadFile(url) {
        return new Promise(resolve => {
            const req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.responseType = "arraybuffer";
            req.onreadystatechange = () => {
                if (req.readyState === 4) {
                    if (req.status === 200)
                        resolve(req.response);
                    else
                        console.warn('error during the load.Wrong url or cross origin issue');
                }
            };
            req.send();
        });
    }
}

export default new SongLoader();