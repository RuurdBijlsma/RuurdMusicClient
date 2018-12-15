export default class Song {
    constructor(id, title, artist, thumbnail, duration, viewCount, color) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.viewCount = viewCount;
        this.color = color;
    }

    static fromObject(data) {
        return new Song(data.id, data.title, data.artist, data.thumbnail, data.duration, data.viewCount, data.color);
    }
}