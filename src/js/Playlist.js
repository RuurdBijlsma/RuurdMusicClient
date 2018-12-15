export default class Playlist {
    constructor(songs) {
        this.songs = songs;
    }

    copy() {
        let newPlaylist = new Playlist([...this.songs]);
        console.log(newPlaylist);
        return newPlaylist;
    }

    shuffle() {
        let array =this.songs;
        let m = array.length, t, i;

        // While there remain elements to shuffle…
        while (m) {

            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return this;
    }
}