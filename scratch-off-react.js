

//==============================================================================


/*
<scratcher
    foreground="url or hex color"
    background="url or hex color"
    width="Integer"
    height="Integer"
    onfinished="function"
/>
*/

//-- Constants -----------------------------------
const EVENT_FINISHED = 'finished';
const SCRATCH_FOREGROUND_DEFAULT = '#333';
const SCRATCH_BACKGROUND_DEFAULT = '#888';
const SCRATCH_LINE_WIDTH = 32;
const SCRATCH_LAYER_THICKNESS = 2;
const SCRATCH_SHADOW_COLOR = '#666';
const SCRATCH_COMPLETE_PERCENT = 98/100;

//-- Default Data --------------------------------
const defaultForeground = {
    image: null,
    color: SCRATCH_FOREGROUND_DEFAULT,
    ready: false,
};
const defaultBackground = {
    image: null,
    color: SCRATCH_BACKGROUND_DEFAULT,
    ready: false,
};

//------------------------------------------------
function ScratchOff({width, height, background, foreground, onfinished}) {
    const canvasReference = React.useRef(null);
    const [context, setContext] = React.useState(null);
    const [scratchContext, setScratchContext] = React.useState(null);
    const [foregroundData, setForeground] = React.useState(defaultForeground);
    const [backgroundData, setBackground] = React.useState(defaultBackground);
    const [data, setData] = React.useState({
        lastMoveX: null,
        lastMoveY: null,
        completed: false,
    });
    // Load images from props
    React.useEffect(() => {
        loadImage(background, setBackground);
    }, [background]);
    React.useEffect(() => {
        loadImage(foreground, setForeground);
    }, [foreground]);
    // Setup display canvas and scratch canvas
    React.useEffect(() => {
        setup(canvasReference.current, setContext, setScratchContext);
    }, [canvasReference, setContext, setScratchContext]);
    // Perform initial draw to display canvas
    React.useEffect(() => {
        draw(context, scratchContext, backgroundData, foregroundData);
    }, [context, scratchContext, backgroundData, foregroundData])
    // Render DOM
    return (
        <canvas
            ref={canvasReference}
            onMouseMove={() => {}}
        />
    );
}

function setup(canvas, setContext, setScratchContext) {
    // Setup main display context
    const context = canvas.getContext('2d');
    // Setup scratch canvas
    const scratchCanvas = document.createElement('canvas');
    const scratchContext = scratchCanvas.getContext('2d');
    //
    setContext(context);
    setScratchContext(scratchContext);
    // // Handle foreground / background colors (instead of images)
    // if(this.foreground[0] === '#') {
    //     this.foregroundReady = true;
    // }
    // if(this.background[0] === '#') {
    //     this.backgroundReady = true;
    // }
    // this.handleSizeSet();
}
function loadImage(propString, setData) {
    // Handle hex color props
    if(propString[0] === '#') {
        setData({
            image: null,
            color: propString,
            ready: true,
        });
        return;
    }
    // Handle Urls
    const layerImage = new Image();
    layerImage.onload = () => {
        setData({
            image: layerImage,
            color: null,
            ready: true,
        });
    };
    layerImage.src = propString;
}
function draw(context, scratchContext, background, foreground) {
    if(!context || !scratchContext) { return;}
    if(background.image) {
        context.drawImage(background.image, 0, 0)
    }
}



// Vue.component('image-scratcher', {
//     template: (`
//         <keep-alive>
//             <canvas @mousemove="handleMouseMove" />
//         </keep-alive>
//     `),
//     props: {
//         width: Number,
//         height: Number,
//         foreground: {
//             type: String,
//             default: SCRATCH_FOREGROUND_DEFAULT,
//         },
//         background: {
//             type: String,
//             default: SCRATCH_BACKGROUND_DEFAULT,
//         },
//     },
//     watch: {
//         width: 'handleSizeSet',
//         height: 'handleSizeSet',
//         foregroundReady: 'draw',
//         backgroundReady: 'draw',
//         foreground: {
//             immediate: true,
//             handler: 'handleForegroundSet',
//         },
//         background: {
//             immediate: true,
//             handler: 'handleBackgroundSet',
//         },
//     },
//     methods: {
//         handleSizeSet() {
//             //
//             const width = this.displayWidth();
//             const height = this.displayHeight();
//             //
//             if(!isFinite(width) || !isFinite(height)) { return;}
//             //
//             const scratchCanvas = this.scratchContext.canvas;
//             scratchCanvas.width = width;
//             scratchCanvas.height = height;
//             //
//             this.$el.width = width;
//             this.$el.height = height;
//             this.draw();
//         },
//         handleForegroundSet(valueNew) {
//             this.foregroundReady = false;
//             if(this.foreground[0] === '#') {
//                 this.foregroundReady = true;
//                 return;
//             }
//             this.foregroundImage = new Image();
//             this.foregroundImage.onload = () => {
//                 this.foregroundReady = true;
//                 this.handleSizeSet();
//             };
//             this.foregroundImage.src = valueNew;
//         },
//         handleBackgroundSet(valueNew) {
//             this.backgroundReady = false;
//             if(this.background[0] === '#') {
//                 this.backgroundReady = true;
//                 return;
//             }
//             this.backgroundImage = new Image();
//             this.backgroundImage.onload = () => {
//                 this.backgroundReady = true;
//                 this.handleSizeSet();
//             };
//             this.backgroundImage.src = valueNew;
//         },
//         displayWidth: function () {
//             if(isFinite(this.width)) { return this.width;}
//             if(this.backgroundImage && this.backgroundReady) {
//                 return this.backgroundImage.naturalWidth;
//             }
//             if(this.foregroundImage && this.foregroundReady) {
//                 return this.foregroundImage.naturalWidth;
//             }
//         },
//         displayHeight: function () {
//             if(isFinite(this.height)) { return this.height;}
//             if(this.backgroundImage && this.backgroundReady) {
//                 return this.backgroundImage.naturalHeight;
//             }
//             if(this.foregroundImage && this.foregroundReady) {
//                 return this.foregroundImage.naturalHeight;
//             }
//         },
//         draw() {
//             if(!this.foregroundReady || !this.backgroundReady) { return;}
//             const width = this.displayWidth();
//             const height = this.displayHeight();
//             if(!isFinite(width) || !isFinite(height)) { return;}
//             // Draw top layer with scratched portion removed
//             this.context.save();
//             this.context.fillStyle = 'black';
//             this.context.fillRect(0, 0, width, height);
//             this.context.globalCompositeOperation = 'destination-out';
//             this.context.drawImage(
//                 this.scratchContext.canvas,
//                 SCRATCH_LAYER_THICKNESS,
//                 SCRATCH_LAYER_THICKNESS,
//             );
//             // Draw foreground onto scratch layer content
//             this.context.globalCompositeOperation = 'source-atop';
//             this.drawForeground();
//             // Add shadow / thickness to scratch layer
//             // this.context.globalCompositeOperation = 'destination-over';
//             this.context.drawImage(this.scratchContext.canvas, 0, 0);
//             // Fill background in empty area, and crop to background shape
//             this.context.globalCompositeOperation = 'destination-atop';
//             this.drawBackground();
//             //
//             this.context.restore();
//         },
//         drawForeground() {
//             if(this.foregroundImage) {
//                 this.centerImage(this.foregroundImage);
//                 return;
//             }
//             let fillColor = SCRATCH_FOREGROUND_DEFAULT;
//             if(this.foreground[0] === '#') {
//                 fillColor = this.foreground;
//             }
//             this.context.fillStyle = fillColor;
//             this.context.fillRect(0, 0, this.displayWidth(), this.displayHeight());
//         },
//         drawBackground() {
//             if(this.backgroundImage) {
//                 this.centerImage(this.backgroundImage);
//                 return;
//             }
//             let fillColor = SCRATCH_BACKGROUND_DEFAULT;
//             if(this.background[0] === '#') {
//                 fillColor = this.background;
//             }
//             this.context.fillStyle = fillColor;
//             this.context.fillRect(0, 0, this.displayWidth(), this.displayHeight());
//         },
//         centerImage(image) {
//             const width = this.displayWidth();
//             const height = this.displayHeight();
//             let offsetX = 0;
//             let offsetY = 0;
//             let drawWidth = width;
//             let drawHeight = height;
//             const aspectRatioCanvas = width/height;
//             const aspectRatioImage = image.naturalWidth / image.naturalHeight;
//             if(aspectRatioCanvas >= aspectRatioImage) {
//                 drawWidth = aspectRatioImage * drawHeight;
//                 offsetX = (width - drawWidth) / 2;
//             } else {
//                 drawHeight = aspectRatioImage * drawWidth;
//                 offsetY = (height - drawHeight) / 2;
//             }
//             this.context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
//         },
//         handleMouseMove(mouseEvent) {
//             const width = this.displayWidth();
//             const height = this.displayHeight();
//             if(!isFinite(width) || !isFinite(height)) { return;}
//             // Calculate coordinates of event relative to the canvas
//             const bounds = this.$el.getBoundingClientRect();
//             const moveEndX = mouseEvent.clientX - bounds.left;
//             const moveEndY = mouseEvent.clientY - bounds.top;
//             // Compare to previous events (or initialize if first)
//             let moveStartX = this.lastMoveX;
//             let moveStartY = this.lastMoveY;
//             if(moveStartX === null) { moveStartX = moveEndX;}
//             if(moveStartY === null) { moveStartY = moveEndY;}
//             // Store last movement on state, for future comparisons
//             this.lastMoveX = moveEndX;
//             this.lastMoveY = moveEndY;
//             // Scratch line from previous coordinates to current coordinates
//             this.eraseScratchLine(moveStartX, moveStartY, moveEndX, moveEndY);
//             // Redraw
//             this.draw();
//         },
//         eraseScratchLine(startX, startY, endX, endY) {
//             // Draw a line on compositing canvas from start(x,y) to end(x,y)
//             this.scratchContext.strokeStyle = SCRATCH_SHADOW_COLOR;
//             this.scratchContext.lineWidth = SCRATCH_LINE_WIDTH;
//             this.scratchContext.beginPath();
//             this.scratchContext.moveTo(startX, startY);
//             this.scratchContext.lineTo(endX, endY);
//             this.scratchContext.closePath();
//             this.scratchContext.stroke();
//             this.checkScratched();
//         },
//         checkScratched() {
//             const width = this.displayWidth();
//             const height = this.displayHeight();
//             const dataDisplay = this.context.getImageData(0, 0, width, height);
//             const dataScratch = this.scratchContext.getImageData(0, 0, width, height);
//             let pixelTotal = 0;
//             let pixelScratched = 0;
//             for(let displayIndex = 3; displayIndex < dataDisplay.data.length; displayIndex += 4) {
//                 const alpha = dataDisplay.data[displayIndex];
//                 if(!alpha) { continue;}
//                 pixelTotal++;
//                 const scratchAlpha = dataScratch.data[displayIndex];
//                 if(!scratchAlpha) { continue;}
//                 pixelScratched++;
//             }
//             if(this.finished) { return;}
//             if(pixelScratched/pixelTotal < SCRATCH_COMPLETE_PERCENT) { return;}
//             this.scratchContext.fillStyle = 'SCRATCH_SHADOW_COLOR';
//             this.scratchContext.fillRect(0, 0, this.displayWidth(), this.displayHeight());
//             this.draw();
//             this.finished = true;
//             this.$emit(EVENT_FINISHED);
//         },
//     },
// });
