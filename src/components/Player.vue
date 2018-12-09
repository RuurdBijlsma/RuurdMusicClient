<template>
    <div class="player">
        <div class="seek-bar" v-on:mousedown="startSeeking($event)" v-on:touchstart="startSeeking($event.touches[0])">
            <div class="seek-background"></div>
            <div class="seek-progress" v-bind:style="{ width: progress + '%'}"></div>
            <div class="seek-thumb" v-bind:style="{ left: 'calc('+progress+'% - 4.5px)'}"></div>
        </div>

        <div class="player-container">
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
        <audio class="audio-player"></audio>
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
                progress: 0,
                updatingInterval: false
            }
        },
        mounted() {
            this.updatingInterval = setInterval(() => {
                let player = document.querySelector('.audio-player');
                if (!player.duration || !player.currentTime)
                    return 0;
                let progress = player.currentTime / player.duration;
                this.progress = Math.round(progress * 10000) / 100;
            }, 10);

            document.addEventListener('mouseup', () => this.endSeeking());
            document.addEventListener('touchend', () => this.endSeeking());
            document.addEventListener('mousemove', e => this.seek(e));
            document.addEventListener('touchmove', e => this.seek(e.touches[0]));
        },
        methods: {
            startSeeking: function (e) {
                console.log('start');
                this.seeking = true;
                this.seekByEvent(e);
            },
            endSeeking: function () {
                console.log('end');
                this.seeking = false;
            },
            seek: function (e) {
                console.log('seeking');
                if (this.seeking)
                    this.seekByEvent(e);
            },
            seekByEvent: function (e) {
                let seekValue = e.pageX / window.innerWidth;
                let player = document.querySelector('.audio-player');
                let time = 0;
                if (player.duration)
                    time = player.duration * seekValue;
                player.currentTime = time;
            },
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
        min-height: 60px;
        background-color: #3e5fbf;
    }

    .seek-bar {
        position: relative;
        top: 5px;
        left: 0;
        width: 100%;
        height: 20px;
        margin-top: -20px;
    }

    .seek-bar > div {
        pointer-events: none;
    }

    .seek-background {
        position: absolute;
        width: 100%;
        top: 5px;
        height: 10px;
        background-color: darkcyan;
        opacity: 0.3;
    }

    .seek-progress {
        position: absolute;
        width: 30%;
        top: 5px;
        height: 10px;
        background-color: darkcyan;
    }

    .seek-thumb {
        position: absolute;
        left: calc(30% - 4.5px);
        height: 10px;
        top: 5px;
        background-color: cyan;
        width: 5px;
    }

    .player-container {
        display: flex;
        flex-direction: row;
        position: relative;
        left: 0;
        width: 100%;
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
