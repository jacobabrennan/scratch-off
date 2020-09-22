

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

//-- React Component (render function) -----------
function ScratchOff({width, height, background, foreground, onfinished}) {
    const canvasReference = React.useRef(null);
    const [context, setContext] = React.useState(null);
    const [scratchContext, setScratchContext] = React.useState(null);
    const [foregroundData, setForeground] = React.useState(defaultForeground);
    const [backgroundData, setBackground] = React.useState(defaultBackground);
    const [displaySize, setDisplaySize] = React.useState(null);
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
    // Size canvas
    React.useEffect(() => {
        determineSize(backgroundData, foregroundData, width, height, setDisplaySize);
    }, [backgroundData, foregroundData, width, height, setDisplaySize]);
    React.useEffect(() => {
        resizeCanvas(context, scratchContext, displaySize);
    }, [context, scratchContext, displaySize]);
    // Perform initial draw to display canvas
    React.useEffect(() => {
        draw(context, scratchContext, backgroundData, foregroundData, displaySize);
    }, [context, scratchContext, backgroundData, foregroundData, displaySize]);
    // Render DOM
    return (
        <canvas
            ref={canvasReference}
            onMouseMove={() => {}}
        />
    );
}

//-- State management utilities ------------------
function setup(canvas, setContext, setScratchContext) {
    // Setup main display context
    const context = canvas.getContext('2d');
    // Setup scratch canvas
    const scratchCanvas = document.createElement('canvas');
    const scratchContext = scratchCanvas.getContext('2d');
    // Send changes to React hooks
    setContext(context);
    setScratchContext(scratchContext);
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
function determineSize(backgroundData, foregroundData, width, height, setDisplaySize) {
    let widthNew;
    let heightNew;
    if(backgroundData.image) {
        widthNew = backgroundData.image.naturalWidth;
        heightNew = backgroundData.image.naturalHeight;
    }
    else if(foregroundData.image) {
        widthNew = foregroundData.image.naturalWidth;
        heightNew = foregroundData.image.naturalHeight;
    }
    if(Number.isFinite(width)) {
        widthNew = width;
    }
    if(Number.isFinite(height)) {
        heightNew = height;
    }
    setDisplaySize({
        width: widthNew,
        height: heightNew,
    });
}
function resizeCanvas(context, scratchContext, displaySize) {   
    if(!context || !scratchContext) { return;}
    const scratchCanvas = scratchContext.canvas;
    scratchCanvas.width = displaySize.width;
    scratchCanvas.height = displaySize.height;
    context.canvas.width = displaySize.width;
    context.canvas.height = displaySize.height;
}

//-- Drawing Utilities ---------------------------
function draw(context, scratchContext, background, foreground, displaySize) {
    // Ensure component is ready for drawing
    if(!context || !scratchContext) { return;}
    if(!background.ready || !foreground.ready) { return;}
    if(!Number.isFinite(displaySize.width) || !Number.isFinite(displaySize.height)) { return;}
    // Draw top layer with scratched portion removed
    context.save();
    context.fillStyle = 'black';
    context.fillRect(0, 0, displaySize.width, displaySize.height);
    context.globalCompositeOperation = 'destination-out';
    context.drawImage(
        scratchContext.canvas,
        SCRATCH_LAYER_THICKNESS,
        SCRATCH_LAYER_THICKNESS,
    );
    // Draw foreground onto scratch layer content
    context.globalCompositeOperation = 'source-atop';
    drawLayer(context, foreground, displaySize);
}
function drawLayer(context, layerData, displaySize) {
    // Handle Drawing Image
    if(layerData.image) {
        centerImage(context, layerData.image, displaySize);
        return;
    }
    // Handle Drawing Color overlay
    context.fillStyle = layerData.color;
    context.fillRect(0, 0, displaySize.width, displaySize.height);
}
function centerImage(context, image, displaySize) {
    let offsetX = 0;
    let offsetY = 0;
    let drawWidth = displaySize.width;
    let drawHeight = displaySize.height;
    const aspectRatioCanvas = displaySize.width / displaySize.height;
    const aspectRatioImage = image.naturalWidth / image.naturalHeight;
    if(aspectRatioCanvas >= aspectRatioImage) {
        drawWidth = aspectRatioImage * drawHeight;
        offsetX = (displaySize.width - drawWidth) / 2;
    } else {
        drawHeight = aspectRatioImage * drawWidth;
        offsetY = (displaySize.height - drawHeight) / 2;
    }
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}


// Vue.component('image-scratcher', {
//         draw() {
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
