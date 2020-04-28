

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

//-- Constants -----------------------------------
const SCRATCH_LINE_WIDTH = 32;

//------------------------------------------------
Vue.component('image-scratcher', {
    template: (`
        <keep-alive>
            <canvas @mousemove="handleMouseMove" style="border: double 3px black" />
        </keep-alive>
    `),
    data: function () {
        return {
            imageForeground: new Image(),
            imageBackground: new Image(),
            foregroundReady: false,
            backgroundReady: false,
            lastMoveX: null,
            lastMoveY: null,
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
        //
        let scratchCanvas = document.createElement('canvas');
        this.scratchContext = scratchCanvas.getContext('2d');
        //
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
            //
            const scratchCanvas = this.scratchContext.canvas;
            scratchCanvas.width = this.width;
            scratchCanvas.height = this.height;
            //
            this.$el.width = this.width;
            this.$el.height = this.height;
            this.draw();
        },
        draw() {
            if(!this.foregroundReady || !this.backgroundReady) { return;}
            // Draw top layer with scratched portion removed
            this.context.save();
            this.context.fillStyle = 'black';
            this.context.fillRect(0, 0, this.width, this.height);
            this.context.globalCompositeOperation = 'destination-out';
            this.context.drawImage(this.scratchContext.canvas, 0, 0);
            // Draw foreground onto scratch layer content
            this.context.globalCompositeOperation = 'source-atop';
            this.centerImage(this.imageForeground);
            // Fill background in empty area, and crop to background shape
            this.context.globalCompositeOperation = 'destination-atop';
            this.centerImage(this.imageBackground);
            //
            this.context.restore();
        },
        centerImage(image) {
            let offsetX = 0;
            let offsetY = 0;
            let drawWidth = this.width;
            let drawHeight = this.height;
            const aspectRatioCanvas = this.width/this.height;
            const aspectRatioImage = image.naturalWidth / image.naturalHeight;
            if(aspectRatioCanvas >= aspectRatioImage) {
                drawWidth = aspectRatioImage * drawHeight;
                offsetX = (this.width - drawWidth) / 2;
            } else {
                drawHeight = aspectRatioImage * drawWidth;
                offsetY = (this.height - drawHeight) / 2;
            }
            this.context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
        },
        handleMouseMove(mouseEvent) {
            // Calculate coordinates of event relative to the canvas
            const bounds = this.$el.getBoundingClientRect();
            const moveEndX = mouseEvent.clientX - bounds.left;
            const moveEndY = mouseEvent.clientY - bounds.top;
            // Compare to previous events (or initialize if first)
            let moveStartX = this.lastMoveX;
            let moveStartY = this.lastMoveY;
            if(moveStartX === null) { moveStartX = moveEndX;}
            if(moveStartY === null) { moveStartY = moveEndY;}
            // Store last movement on state, for future comparisons
            this.lastMoveX = moveEndX;
            this.lastMoveY = moveEndY;
            // Scratch line from previous coordinates to current coordinates
            this.eraseScratchLine(moveStartX, moveStartY, moveEndX, moveEndY);
            // Check if canvas is completely scratched
            // Redraw
            this.draw();
        },
        eraseScratchLine(startX, startY, endX, endY) {
            // Draw a line on compositing canvas from start(x,y) to end(x,y)
            this.scratchContext.strokeStyle = 'black';
            this.scratchContext.lineWidth = SCRATCH_LINE_WIDTH;
            this.scratchContext.beginPath();
            this.scratchContext.moveTo(startX, startY);
            this.scratchContext.lineTo(endX, endY);
            this.scratchContext.closePath();
            this.scratchContext.stroke();
        }
    },
});
