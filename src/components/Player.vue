<template>
    <div class="player">
        <audio class="audio-player"></audio>
        <div class="player-thumbnail" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
        <div class="player-info">
            <div class="player-title">{{song.title}}</div>
            <div class="player-artist">{{song.artist}}</div>
        </div>
        <div class="player-play" v-on:click="togglePlayPause()">
            <md-icon rotate v-if="loading">cached</md-icon>
            <md-icon v-else-if="playing">pause</md-icon>
            <md-icon v-else>play_arrow</md-icon>
        </div>
    </div>
</template>

<script>
    function getAudioSource(api, ytId) {
        //todo local files hier doen cache
        return api.getStreamUrl(ytId);
    }

    export default {
        name: 'Player',
        props: {
            song: {type: Object, required: false},
            api: {type: Object, required: true}
        },
        data() {
            return {
                loading: false,
                playing: false,
            }
        },
        methods: {
            loadSong: async function (song) {
                return new Promise((resolve => {
                    this.loading = true;
                    let player = document.querySelector('.audio-player');
                    player.src = getAudioSource(this.api, song.ytid);
                    player.oncanplay = () => {
                        this.loading = false;
                        resolve()
                    };
                }))
            },
            togglePlayPause: function () {
                let player = document.querySelector('.audio-player');
                if (player.paused) {
                    player.play();
                    this.playing = true;
                } else {
                    player.pause();
                    this.playing = false;
                }
            },
        },
        watch: {
            playing: function () {
                this.$emit('playPause', this.playing)
            }
        }
    }
</script>

<style scoped>
    .player {
        display: flex;
        flex-direction: row;
        min-height: 60px;
        background-color: #3e5fbf;
    }

    .player-thumbnail {
        height: 50px;
        min-width: 50px;
        margin: 4px;
        background-size: cover;
        background-position: center;
    }

    .player-info {
        display: flex;
        flex-direction: column;
        padding: 10px;
        flex-grow: 1;
        min-width: 0px;
    }

    .player-title {
        font-size: 17px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .player-artist {
        font-size: 15px;
        font-weight: 100;
    }

    .player-play {
        min-width: 80px;
        height: 60px;
        text-align: center;
    }

    .player-play i {
        line-height: 60px;
        height: 60px;
        font-size: 30px !important;
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
