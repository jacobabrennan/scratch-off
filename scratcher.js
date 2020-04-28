

//==============================================================================

/*
<scratcher
    foreground="url or hex color"
    background="url or hex color"
    width="Integer"
    height="Integer"
    onscratch="function"
    scratch-percent="Number, [0,1]"
    shape="background or foreground (background)"
    reveal="Boolean (false)"
/>
*/

//-- Dependencies --------------------------------
import Vue from './vue.esm.browser.js';

//------------------------------------------------
Vue.component('image-scratcher', {
    template: (`
        <keep-alive>
            <canvas style="border: double 3px black" />
        </keep-alive>
    `),
    data: function () {
        return {
            imageForeground: new Image(),
            imageBackground: new Image(),
            foregroundReady: false,
            backgroundReady: false,
        };
    },
    props: {
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        foreground: {
            type: String,
            required: true,
        },
        background: {
            type: String,
            required: true,
        },
    },
    created() {
        this.imageForeground.addEventListener('load', () => {
            this.foregroundReady = true;
        });
        this.imageBackground.addEventListener('load', () => {
            this.backgroundReady = true;
        });
    },
    mounted() {
        this.handleSizeSet();
        this.context = this.$el.getContext('2d');
    },
    watch: {
        width: 'handleSizeSet',
        height: 'handleSizeSet',
        foreground: {
            immediate: true,
            handler: function (valueNew) {
                this.foregroundReady = false;
                this.imageForeground.src = valueNew;
            },
        },
        background: {
            immediate: true,
            handler: function (valueNew) {
                this.backgroundReady = false;
                this.imageBackground.src = valueNew;
            },
        },
        foregroundReady: 'draw',
        backgroundReady: 'draw',
    },
    methods: {
        handleSizeSet() {
            this.$el.width = this.width;
            this.$el.height = this.height;
            this.draw();
        },
        draw() {
            if(!this.foregroundReady || !this.backgroundReady) { return;}
            this.context.drawImage(this.background, 0, 0);
            this.context.drawImage(this.foreground, 0, 0);
        },
    },
});
