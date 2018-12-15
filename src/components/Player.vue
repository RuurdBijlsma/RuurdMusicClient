<template>
    <div class="player">
        <div class="seek-bar" v-on:mousedown="startSeeking($event)" v-on:touchstart="startSeeking($event.touches[0])">
            <div class="seek-background" v-bind:style="{ backgroundColor: song.color }"></div>
            <div class="seek-progress" v-bind:style="{ backgroundColor: song.color ,width: progress + '%'}"></div>
            <div class="seek-thumb"
                 v-bind:style="{ backgroundColor: song.color, left: 'calc('+progress+'% - 4.5px)'}"></div>
        </div>

        <div class="player-container">
            <div class="player-thumbnail" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
            <div class="player-info" v-on:click="toggleNowPlaying">
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
    import Song from "@/js/Song";
    import StreamApi from "@/js/StreamApi";
    import mediaHelper from '@/js/MediaHelper';

    export default {
        name: 'Player',
        props: {
            song: {type: Song, required: false},
            api: {type: StreamApi, required: true}
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
                this.seeking = true;
                this.seekByEvent(e);
            },
            endSeeking: function () {
                this.seeking = false;
            },
            seek: function (e) {
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
                return new Promise(async resolve => {
                    this.loading = true;
                    let player = document.querySelector('.audio-player');
                    player.src = await mediaHelper.getAudioSource(this.api, song.id);
                    player.oncanplay = async () => {
                        if (player.duration === Infinity) {
                            // Streaming
                            console.log("Current song not cached on server");
                            this.api.await(song.id).then(async () => {
                                if (player.src.includes(song.id)) {
                                    //song is still being played
                                    await mediaHelper.cacheSongLocallyIfNeeded(this.api, song.id);
                                    let time = player.currentTime;
                                    await this.loadSong(song);
                                    await player.play();
                                    player.currentTime = time;
                                }
                                console.log("Server is done caching");
                            });
                            resolve();
                            return;
                        } else {
                            await mediaHelper.cacheSongLocallyIfNeeded(this.api, song.id);
                        }
                        // console.log('done loading', player.duration);
                        this.loading = false;
                        resolve();
                    };
                });
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
            toggleNowPlaying: function () {
                this.$emit('toggleNowPlaying', true);
            }
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
        min-height: 70px;
        background-color: rgb(25,25,25);
    }

    .seek-bar {
        position: relative;
        top: 7px;
        left: 0;
        width: 100%;
        height: 25px;
        margin-top: -25px;
    }

    .seek-bar > div {
        pointer-events: none;
    }

    .seek-background {
        position: absolute;
        width: 100%;
        top: 7px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.6);
        opacity: 0.3;
    }

    .seek-progress {
        position: absolute;
        width: 30%;
        top: 7px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.6);
        opacity: 0.6;
    }

    .seek-thumb {
        position: absolute;
        left: calc(30% - 4.5px);
        height: 12px;
        top: 7px;
        background-color: white;
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
        height: 45px;
        min-width: 45px;
        margin: 12px;
        margin-right:4px;
        background-size: cover;
        background-position: center;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.6);
    }

    .player-info {
        display: flex;
        flex-direction: column;
        padding: 15px 10px;
        flex-grow: 1;
        min-width: 0px;
        text-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
    }

    .player-title {
        font-size: 17px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .player-artist {
        font-size: 15px;
        font-weight: 300;
    }

    .player-play {
        min-width: 80px;
        height: 70px;
        text-align: center;
    }

    .player-play i {
        line-height: 70px;
        height: 70px;
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
