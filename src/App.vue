<template>
    <div id="app">
        <div class="search-app-bar">
            <input type="search" class="search-input" placeholder="Search music" v-model="searchQuery"
                   v-on:keydown.enter="performSearch()">
        </div>
        <div v-if="searchQuery!==''" class="search-results">
            <div class="song-item" v-for="song in searchResults" v-bind:active="song.ytid === currentSong.ytid"
                 v-on:click="playSong(song)">
                <div class="thumbnail-square">
                    <div class="song-thumbnail" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
                    <div class="thumbnail-overlay" v-if="audioIsPlaying"></div>
                </div>
                <div class="song-info">
                    <div class="song-title">{{song.title}}</div>
                    <div class="song-bottom-info">
                        <span class="song-artist">{{song.artist}}</span>
                    </div>
                </div>
                <div class="song-options">
                    <div class="song-save" v-on:click="saveSong($event, song)">
                        <md-icon rotate v-if="savingSongs.includes(song)">cached</md-icon>
                        <md-icon v-else-if="songs.find(s=>s.ytid===song.ytid)">remove</md-icon>
                        <md-icon v-else>add</md-icon>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="song-list">
            <div class="song-item" v-for="song in songs" v-bind:active="song.ytid === currentSong.ytid"
                 v-on:click="playSong(song)">
                <div class="thumbnail-square">
                    <div class="song-thumbnail" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
                    <div class="thumbnail-overlay" v-if="audioIsPlaying"></div>
                </div>
                <div class="song-info">
                    <div class="song-title">{{song.title}}</div>
                    <div class="song-bottom-info">
                        <span class="song-artist">{{song.artist}}</span>
                        •
                        <span class="song-duration">{{song.duration}}</span>
                    </div>
                </div>
                <div class="song-options">
                    <div class="song-move-options">
                        <md-icon>more_vert</md-icon>
                    </div>
                </div>
            </div>
        </div>
        <player ref="player" v-bind:song="currentSong" v-bind:api="api" v-on:playPause="updateAudioPlaying()"></player>
    </div>
</template>

<script>
    import Player from "./components/Player.vue";
    import StreamApi from './js/StreamApi';
    import Vue from 'vue';
    import {MdIcon} from 'vue-material/dist/components';
    import 'vue-material/dist/vue-material.min.css'

    Vue.use(MdIcon);


    const isLocal = location.href.includes('localhost') || location.href.includes('127.0.0.1');
    const server = isLocal ? 'http://localhost:3000' : 'https://rtc.ruurdbijlsma.com:3000';
    const api = new StreamApi(server);
    const titleFixOptions = {
        brackets: ['[]', '()', '{}'],
        removeWordsInBrackets: ['audio', 'official', 'official music video', 'music video', 'lyrics', 'official video', 'ultra music', 'official audio', 'hq', 'hd', 'hq.']
    };

    export default {
        name: "app",
        components: {
            Player
        },
        data() {
            return {
                searchQuery: '',
                searchResults: [],
                savingSongs: [],
                songs: [],
                currentSong: {},
                api: api,
                audioIsPlaying: false
            }
        },
        methods: {
            saveSong: async function (e, song) {
                e.stopPropagation();

                if (this.savingSongs.includes(song))
                    return;
                if (this.songs.find(s => s.ytid === song.ytid))
                    return await this.removeSong(song);

                this.savingSongs.push(song);
                await api.save(song.ytid);

                await this.updateSongList();
                this.savingSongs.splice(this.savingSongs.indexOf(song), 1);
            },
            removeSong: async function (song) {
                this.savingSongs.push(song);

                await api.remove(song.ytid);

                await this.updateSongList();
                this.savingSongs.splice(this.savingSongs.indexOf(song), 1);
            },
            cleanSongTitles: function (songs) {
                songs.forEach(s => {
                    s.duration = `${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')}`;

                    for (let brackets of titleFixOptions.brackets) {
                        if (s.title.includes(brackets[0]))
                            for (let word of titleFixOptions.removeWordsInBrackets) {
                                let wordToRemove = '\\' + brackets[0] + word + '\\' + brackets[1];
                                let re = new RegExp(wordToRemove, 'gi');
                                s.title = s.title.replace(re, ' ').replace(/ {2}/g, ' ').trim();
                            }
                    }
                });
            },
            updateSongList: async function () {
                let songs = await api.songs(1);

                this.cleanSongTitles(songs);

                this.songs = songs;
            },
            performSearch: async function () {
                let results = await api.search(this.searchQuery);
                this.cleanSongTitles(results);
                this.searchResults = results;
            },
            updateAudioPlaying: function () {
                this.audioIsPlaying = this.$refs.player.playing
            },
            playSong: async function (song) {
                let player = this.$refs.player;
                await this.loadSong(song);
                player.togglePlayPause();
            },
            loadSong: async function (song) {
                let player = this.$refs.player;
                this.currentSong = song;
                await player.loadSong(song);
            },
            loadFirstSong: async function (song) {
                // Get song that was playing previously
                await this.loadSong(song);
            },
        },
        async mounted() {
            await this.updateSongList();

            await this.loadFirstSong(this.songs[Math.floor(this.songs.length * Math.random())]);
        }
    };

</script>

<style>
    .root {
        --primary-color: rgba(0, 100, 255, 1);
    }

    body, html {
        height: 100%;
        margin: 0px;
    }

    #app {
        font-family: "Montserrat", Helvetica, Arial, sans-serif;
        font-weight: 300;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: rgba(0, 0, 20, 0.97);
        height: 100%;
        width: 100%;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
    }

    .search-app-bar {
        width: 100%;
        height: 60px;
        background-color: #3e5fbf;
    }

    .search-input {
        width: calc(100% - 20px);
        margin: 10px;
        height: calc(100% - 20px);
        border: none;
        padding: 15px;
        font-size: 17px;
        text-align: center;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.2);
    }

    input:focus {
        outline: none;
    }

    .search-results {
        flex-grow: 1;
        overflow-y: auto;
    }

    .song-list {
        flex-grow: 1;
        overflow-y: auto;
    }

    .song-item {
        width: 100%;
        display: flex;
        flex-direction: row;
        height: 60px;
        padding: 0px 5px;
        transition: 0.1s;
        cursor: pointer;
    }

    .song-item[active] {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .song-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .song-thumbnail {
        pointer-events: none;
        height: 50px;
        width: 50px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        margin: 5px;
        position: relative;
        top: 0px;
    }

    .song-item[active] .thumbnail-overlay {
        display: block;
    }

    .thumbnail-overlay {
        display: none;
        position: relative;
        top: -60px;
        width: calc(100% - 10px);
        height: calc(100% - 10px);
        margin: 5px;
        background: rgba(255, 255, 255, 0.4) url(assets/playing.gif) no-repeat center;
        background-size: 50%;
        filter: invert(100%);
    }

    .song-info {
        pointer-events: none;
        display: flex;
        flex-direction: column;
        margin: 11px;
        flex-grow: 1;
        min-width: 0;
    }

    .song-title {
        font-size: 17px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
    }

    .song-bottom-info {
        font-size: 15px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 100;
    }

    .song-options {
        min-width: 60px;
        text-align: center;
        border-radius: 50%;
        transform: scale(0.7);
    }

    .song-options:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .song-options i {
        line-height: 60px;
        vertical-align: middle;
        height: 60px;
        pointer-events: none;
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }

    i[rotate] {
        animation: spin 0.7s linear infinite;
        animation-direction: reverse;
    }
</style>
