class FileStorage {
    constructor() {
        this.isReady = false;
        this.requestSize = 1024 ** 3; // 1GB
        this.events = {};

        console.log("Instanced");
        this.getFileSystem().then(async fs => {
            this.fileSystem = fs;
            await this.requestMoreQuota(this.requestSize);
            this.isReady = true;
            this.fire('ready');
        });
    }

    async awaitReady() {
        return new Promise(resolve => {
            if (this.isReady)
                resolve();
            this.on('ready', () => {
                console.log("resolving ready here");
                resolve();
            });
        });
    }

    get root() {
        return this.fileSystem.root;
    }

    async exists(fileName, directory = this.root) {
        return (await this.getFileByName(fileName, directory)) !== undefined;
    }

    async getFileByName(fileName, directory = this.root) {
        let files = await this.getDirectoryFiles(directory)
        return files.find(f => f.name === fileName);
    }

    async getDirectoryFiles(directory = this.root) {
        return new Promise((resolve, error) => {
            let reader = directory.createReader();
            reader.readEntries(r => resolve(r), e => error(e));
        });
    }

    async getFileSystem() {
        return new Promise((resolve, error) => {
            window.webkitRequestFileSystem(window.PERSISTENT, 0, r => resolve(r), e => error(e));
        });
    }

    async requestMoreQuota(size) {
        return new Promise((resolve, error) => {
            navigator.webkitPersistentStorage.requestQuota(size, r => resolve(r), e => error(e));
        });
    }

    async getCurrentQuota() {
        return new Promise((resolve, error) => {
            navigator.webkitTemporaryStorage.queryUsageAndQuota(
                (usedBytes, grantedBytes) => resolve({usedBytes, grantedBytes}), e => error(e)
            );
        });
    }

    async createFileFromBlob(name, blob, directory = this.root) {
        let fileEntry = await this.createFile(name, directory);
        await this.writeToFile(blob, fileEntry);
        return fileEntry;
    }

    async createFile(name, directory = this.root) {
        return new Promise((resolve, error) => {
            directory.getFile(name, {create: true}, r => resolve(r), e => error(e));
        });
    }

    async writeToFile(blob, file) {
        return new Promise((resolve, error) => {
            file.createWriter(writer => {
                writer.onwriteend = e => resolve(e);
                writer.onerror = e => error(e);

                writer.write(blob);
            });
        });
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event])
            this.events[event].splice(this.events.indexOf(callback), 1);
    }

    fire(event) {
        if (this.events[event])
            for (let cb of this.events[event]) {
                cb();
            }
    }
}

export default new FileStorage();
