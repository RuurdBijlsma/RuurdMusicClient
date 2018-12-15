<template>
    <div class="player">
        <div class="seek-bar" v-on:mousedown="startSeeking($event)" v-on:touchstart="startSeeking($event.touches[0])">
            <div class="seek-background" v-bind:style="{ backgroundColor: song.color }"></div>
            <div class="seek-progress" v-bind:style="{ backgroundColor: song.color ,width: progress + '%'}"></div>
            <div class="seek-thumb"
                 v-bind:style="{ backgroundColor: song.color, left: 'calc('+progress+'% - 4.5px)'}"></div>
        </div>

        <div class="player-container" v-on:touchstart="startSwipe($event.touches[0])"
             v-on:mousedown="startSwipe($event)">
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
                this.$emit('progress', this.progress);
            }, 10);

            document.addEventListener('mouseup', e => this.endSeeking(e));
            document.addEventListener('touchend', e => this.endSeeking(e.changedTouches[0]));
            document.addEventListener('mousemove', e => this.seek(e));
            document.addEventListener('touchmove', e => this.seek(e.touches[0]));
        },
        methods: {
            startSwipe: function (e) {
                this.startSwipePosition = e.pageX;
            },
            startSeeking: function (e) {
                this.seeking = true;
                this.seekByEvent(e);
            },
            endSeeking: function (e) {
                this.seeking = false;
                if (this.startSwipePosition !== false) {
                    let distance = e.pageX - this.startSwipePosition;
                    this.startSwipePosition = false;
                    if (Math.abs(distance) > 100)
                        if (distance < 0) {
                            console.log("end seeking skip song", 1);
                            this.$emit('skip', 1);
                        }
                        else {
                            console.log("end seeking skip song", -1);
                            this.$emit('skip', -1);
                        }
                }
            },
            seek: function (e) {
                if (this.seeking)
                    this.seekByEvent(e);
            },
            seekByEvent: function (e) {
                let seekValue = e.pageX / window.innerWidth;
                this.seekByValue(seekValue);
            },
            seekByValue: function (percentage) {
                let player = document.querySelector('.audio-player');
                let time = 0;
                if (player.duration)
                    time = player.duration * percentage;
                player.currentTime = time;
            },
            setSongMetaData: function (song) {
                document.title = song.artist + ' - ' + song.title;
                document.querySelector('meta[name="theme-color"').content = song.color;

                if (!('mediaSession' in navigator))
                    return;

                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title,
                    artist: song.artist,
                    artwork: [
                        {src: song.thumbnail, type: 'image/png'},
                    ]
                });
                navigator.mediaSession.setActionHandler('play', () => {
                    console.log('play');
                    alert('play');
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    console.log('pause');
                    alert('pause');
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    console.log('previous');
                    alert('previous');
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    console.log('previous');
                    alert('previous');
                });
            },
            loadSong: async function (song) {
                return new Promise(async resolve => {
                    this.setSongMetaData(song);
                    this.loading = true;
                    let player = document.querySelector('.audio-player');
                    let source = await mediaHelper.getAudioSource(this.api, song.id);
                    player.src = source;
                    player.load();
                    player.onended = () => {
                        this.$emit('skip', 1);
                    };
                    player.oncanplaythrough = async () => {
                        console.log("oncanplaythrough is triggered");
                        if (player.duration === Infinity) {
                            // Streaming
                            console.warn("Current song not cached on server");
                            this.api.await(song.id).then(async () => {
                                let paused = player.paused;
                                if (player.src.includes(song.id)) {
                                    //song is still being played
                                    await mediaHelper.cacheSongLocallyIfNeeded(this.api, song.id);
                                    let time = player.currentTime;
                                    await this.loadSong(song);
                                    if (!paused)
                                        await player.play();
                                    player.currentTime = time;
                                }
                            });
                            resolve();
                            player.oncanplaythrough = () => {
                            };
                            return;
                        } else {
                            await mediaHelper.cacheSongLocallyIfNeeded(this.api, song.id);
                        }
                        player.oncanplaythrough = () => {
                        };
                        this.loading = false;
                        resolve();
                    };
                });
            },
            togglePlayPause: async function () {
                let player = document.querySelector('.audio-player');
                if (player.paused) {
                    await player.play();
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
        background-color: rgb(25, 25, 25);
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
        filter: brightness(30%);
    }

    .seek-progress {
        position: absolute;
        width: 30%;
        top: 7px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.6);
        filter: brightness(60%);
    }

    .seek-thumb {
        position: absolute;
        left: calc(30% - 4.5px);
        height: 12px;
        top: 7px;
        background-color: white;
        width: 5px;
        filter: brightness(120%);
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
        margin-right: 4px;
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
