

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
const SCRATCH_LAYER_THICKNESS = 2;
const SCRATCH_SHADOW_COLOR = '#888';
const SCRATCH_COMPLETE_PERCENT = 1/2;

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
        width: Number,
        height: Number,
        foreground: {
            type: String,
            required: true,
        },
        background: {
            type: String,
            required: true,
        },
    },
    mounted() {
        //
        let scratchCanvas = document.createElement('canvas');
        this.scratchContext = scratchCanvas.getContext('2d');
        //
        this.context = this.$el.getContext('2d');
        //
        this.imageForeground.addEventListener('load', () => {
            this.foregroundReady = true;
        });
        this.imageBackground.addEventListener('load', () => {
            this.backgroundReady = true;
            this.handleSizeSet();
        });
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
        displayWidth: function () {
            if(isFinite(this.width)) {
                return this.width;
            }
            return this.imageBackground.naturalWidth;
        },
        displayHeight: function () {
            if(isFinite(this.height)) {
                return this.height;
            }
            return this.imageBackground.naturalHeight;
        },
        handleSizeSet() {
            //
            const width = this.displayWidth();
            const height = this.displayHeight();
            //
            const scratchCanvas = this.scratchContext.canvas;
            scratchCanvas.width = width;
            scratchCanvas.height = height;
            //
            this.$el.width = width;
            this.$el.height = height;
            this.draw();
        },
        draw() {
            if(!this.foregroundReady || !this.backgroundReady) { return;}
            // Draw top layer with scratched portion removed
            const width = this.displayWidth();
            const height = this.displayHeight();
            this.context.save();
            this.context.fillStyle = 'black';
            this.context.fillRect(0, 0, width, height);
            this.context.globalCompositeOperation = 'destination-out';
            this.context.drawImage(
                this.scratchContext.canvas,
                SCRATCH_LAYER_THICKNESS,
                SCRATCH_LAYER_THICKNESS,
            );
            // Draw foreground onto scratch layer content
            this.context.globalCompositeOperation = 'source-atop';
            this.centerImage(this.imageForeground);
            // Add shadow / thickness to scratch layer
            // this.context.globalCompositeOperation = 'destination-over';
            this.context.drawImage(this.scratchContext.canvas, 0, 0);
            // Fill background in empty area, and crop to background shape
            this.context.globalCompositeOperation = 'destination-atop';
            this.centerImage(this.imageBackground);
            //
            this.context.restore();
        },
        centerImage(image, context) {
            const width = this.displayWidth();
            const height = this.displayHeight();
            let offsetX = 0;
            let offsetY = 0;
            let drawWidth = width;
            let drawHeight = height;
            const aspectRatioCanvas = width/height;
            const aspectRatioImage = image.naturalWidth / image.naturalHeight;
            if(aspectRatioCanvas >= aspectRatioImage) {
                drawWidth = aspectRatioImage * drawHeight;
                offsetX = (width - drawWidth) / 2;
            } else {
                drawHeight = aspectRatioImage * drawWidth;
                offsetY = (height - drawHeight) / 2;
            }
            if(!context) { context = this.context;}
            context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
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
            this.scratchContext.strokeStyle = SCRATCH_SHADOW_COLOR;
            this.scratchContext.lineWidth = SCRATCH_LINE_WIDTH;
            this.scratchContext.beginPath();
            this.scratchContext.moveTo(startX, startY);
            this.scratchContext.lineTo(endX, endY);
            this.scratchContext.closePath();
            this.scratchContext.stroke();
        },
    },
});
