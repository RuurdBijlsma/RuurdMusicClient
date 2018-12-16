export default class Playlist {
    constructor(songs) {
        this.setSongs(songs);
    }

    setSongs(songs) {
        this.songs = songs;
        this.reshuffle();
    }

    reshuffle() {
        if (this.songs)
            this.shuffledSongs = this.shuffleArray([...this.songs]);
    }

    copy() {
        let newPlaylist = new Playlist([...this.songs]);
        return newPlaylist;
    }

    shuffleArray(array) {
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

        return array;
    }
}