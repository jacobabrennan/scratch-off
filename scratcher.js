

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
    props: {
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
    },
    mounted() {
        this.handleSizeSet();
    },
    watch: {
        width: 'handleSizeSet',
        height: 'handleSizeSet',
    },
    methods: {
        handleSizeSet() {
            this.$el.width = this.width;
            this.$el.height = this.height;
        },
    },
});
