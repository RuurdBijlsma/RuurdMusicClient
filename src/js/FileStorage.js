class FileStorage {
    constructor() {
        this.isReady = false;
        this.requestSize = 1024 ** 3; // 1GB
        this.onready = () => {
        };
        console.log("Instanced");
        this.getFileSystem().then(fs => {
            this.fileSystem = fs;
            this.requestMoreQuota(this.requestSize);
            this.isReady = true;
            this.onready(fs);
        });
    }

    async awaitReady() {
        if (this.isReady)
            return;
        return new Promise(resolve => {
            this.onready = () => resolve();
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
}

export default new FileStorage();
