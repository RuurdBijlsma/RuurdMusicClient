<template>
    <div class="now-playing" v-bind:active="active">
        <div class="album-background" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>
        <div class="now-playing-content">
            <p class="now-playing-text" v-on:click="toggleNowPlaying()">Now playing</p>
            <div class="album-art" v-bind:style="{ backgroundImage: 'url(' + song.thumbnail + ')' }"></div>

            <p class="song-title">{{song.title}}</p>
            <p class="song-artist">{{song.artist}}</p>

            <div class="seek-bar">
                <canvas class="seek-canvas"></canvas>
            </div>
            <div class="media-controls">
                <div class="media-previous">
                    <md-icon>skip_previous</md-icon>
                </div>
                <div class="media-playpause" v-bind:style="{ backgroundColor: song.color }">
                    <md-icon v-if="playing">pause</md-icon>
                    <md-icon v-else>play_arrow</md-icon>
                </div>
                <div class="media-next">
                    <md-icon>skip_next</md-icon>
                </div>
            </div>
        </div>
        <div class="album-background-overlay"></div>
    </div>
</template>

<script>
    import visualizer from '@/js/FrequencyVisualizer';
    import Song from '@/js/Song';
    import StreamApi from '@/js/StreamApi';
    import mediaHelper from '@/js/MediaHelper';

    export default {
        name: 'NowPlaying',
        props: {
            song: {type: Song, required: false},
            playing: {type: Boolean, require: false},
            active: {type: Boolean, require: false},
            api: {type: StreamApi, required: true}
        },
        data() {
            return {}
        },
        mounted() {
            console.log("NOW PLAYING", this.song);
        },
        methods: {
            toggleNowPlaying: function(){
                this.$emit('toggleNowPlaying', false);
            }
        },
        watch: {
            song: async function () {
                let canvas = document.querySelector('.seek-canvas');

                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;

                let source = await mediaHelper.getAudioSource(this.api, this.song.id);
                visualizer.drawFrequencies(canvas, this.song.color, source);
            }
        }
    }
</script>

<style scoped>
    .now-playing {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 2;
        text-align: center;
        transform: translateY(120%);
        transition: transform 0.3s;
    }

    .now-playing[active] {
        transform: translateY(0);
    }

    .now-playing > div {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .now-playing-content {
        z-index: 1;
    }

    .now-playing-text {
        width: 100%;
        font-size: 25px;
        text-transform: uppercase;
        height: 100px;
        line-height: 100px;
        vertical-align: middle;
        font-weight: 600;
    }

    .album-art {
        border-radius: 10px;
        width: 250px;
        margin-left: calc(50% - 125px);
        height: 250px;
        box-shadow: 0px 0px 100px 0px rgba(0, 0, 0, 0.5);
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }

    .song-title {
        margin-top: 40px;
        font-size: 25px;
        font-weight: 300;
        line-height: 120%;
    }

    .song-artist {
        font-size: 20px;
        font-weight: 100;
        line-height: 120%;
        margin-top: -5px;
    }

    .seek-bar {
        width: 100%;
        height: 70px;
        margin: 40px 0;
    }

    .seek-canvas {
        width: 100%;
        height: 100%;
    }

    .media-controls {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }

    .media-controls i {
        font-size: 30px !important;
        color: rgba(255, 255, 255, 0.5);
        height: 60px;
        line-height: 60px;
        vertical-align: middle;
    }

    .media-playpause {
        background-color: darkred;
        border-radius: 50%;
        width: 60px;
        box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.2);
    }

    .media-playpause i {
        color: white;
    }

    .album-background {
        height: 40%;
        transform: scale(1.5);
        width: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: absolute;
        filter: blur(20px);
    }

    .album-background-overlay {
        height: 100%;
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, #1c1c1f 40%);
    }
</style>
