

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

//-- Dependencies --------------------------------
import React from 'react';

//-- Constants -----------------------------------
const SCRATCH_FOREGROUND_DEFAULT = '#333';
const SCRATCH_BACKGROUND_DEFAULT = '#888';
const SCRATCH_LINE_WIDTH = 32;
const SCRATCH_LAYER_THICKNESS = 2;
const SCRATCH_SHADOW_COLOR = '#666';
const SCRATCH_COMPLETE_PERCENT = 98/100;

//-- Default Data --------------------------------
const defaultForeground = {
    image: null,
    color: null,
    ready: false,
};
const defaultBackground = {
    image: null,
    color: null,
    ready: false,
};
const defaultMousePosition = {
    startX: null,
    startY: null,
    endX: null,
    endY: null,
};

//-- React Component (render function) -----------
export default function ScratchOff({width, height, background, foreground, onfinished}) {
    if(background === undefined) { background = SCRATCH_BACKGROUND_DEFAULT;}
    if(foreground === undefined) { foreground = SCRATCH_FOREGROUND_DEFAULT;}
    const canvasReference = React.useRef(null);
    const [complete, setComplete] = React.useState(false);
    const [context, setContext] = React.useState(null);
    const [scratchContext, setScratchContext] = React.useState(null);
    const [foregroundData, setForeground] = React.useState(defaultForeground);
    const [backgroundData, setBackground] = React.useState(defaultBackground);
    const [displaySize, setDisplaySize] = React.useState(null);
    const [scratchPosition, setScratchPosition] = React.useState(defaultMousePosition);
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
    // Scratch image after mouse move
    React.useEffect(() => {
        eraseScratchLine(context, scratchContext, scratchPosition, displaySize, complete, setComplete);
    }, [context, scratchContext, scratchPosition, displaySize, complete, setComplete]);
    // Perform initial draw to display canvas
    React.useEffect(() => {
        draw(context, scratchContext, backgroundData, foregroundData, displaySize);
    }, [context, scratchContext, backgroundData, foregroundData, displaySize, scratchPosition]);
    // Invoke callback when complete
    React.useEffect(() => {
        if(complete & onfinished) {
            onfinished();
        }
    }, [complete]);
    // Render DOM
    return (
        <canvas
            ref={canvasReference}
            onMouseMove={(eventMouse) => {
                handleMouseMove(eventMouse, scratchPosition, setScratchPosition);
            }}
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
    if(typeof width === 'string') { width = parseInt(width);}
    if(typeof height === 'string') { height = parseInt(height);}
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
    // Add shadow / thickness to scratch layer
    context.drawImage(scratchContext.canvas, 0, 0);
    // Fill background in empty area, and crop to background shape
    context.globalCompositeOperation = 'destination-atop';
    drawLayer(context, background, displaySize);
    //
    context.restore();
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


//-- Interaction (mouse) utilities ---------------
function handleMouseMove(mouseEvent, scratchPosition, setScratchPosition) {
    // Calculate coordinates of event relative to the canvas
    const bounds = mouseEvent.currentTarget.getBoundingClientRect();
    const moveEndX = mouseEvent.clientX - bounds.left;
    const moveEndY = mouseEvent.clientY - bounds.top;
    // Compare to previous events (or initialize if first)
    let moveStartX = scratchPosition.endX;
    let moveStartY = scratchPosition.endY;
    if(moveStartX === null) { moveStartX = moveEndX;}
    if(moveStartY === null) { moveStartY = moveEndY;}
    // Store last movement on state, for future comparisons
    setScratchPosition({
        startX: moveStartX,
        startY: moveStartY,
        endX: moveEndX,
        endY: moveEndY,
    });
}
function eraseScratchLine(context, scratchContext, scratchPosition, displaySize, complete, setComplete) {
    if(!context || !scratchContext) { return;}
    if(!Number.isFinite(scratchPosition.startX) || !Number.isFinite(scratchPosition.startY)) { return;}
    // Draw a line on compositing canvas from start(x,y) to end(x,y)
    scratchContext.strokeStyle = SCRATCH_SHADOW_COLOR;
    scratchContext.lineWidth = SCRATCH_LINE_WIDTH;
    scratchContext.beginPath();
    scratchContext.moveTo(scratchPosition.startX, scratchPosition.startY);
    scratchContext.lineTo(scratchPosition.endX, scratchPosition.endY);
    scratchContext.closePath();
    scratchContext.stroke();
    // Check if scratching finished
    if(complete) { return;}
    const dataDisplay = context.getImageData(0, 0, displaySize.width, displaySize.height);
    const dataScratch = scratchContext.getImageData(0, 0, displaySize.width, displaySize.height);
    let pixelTotal = 0;
    let pixelScratched = 0;
    for(let displayIndex = 3; displayIndex < dataDisplay.data.length; displayIndex += 4) {
        const alpha = dataDisplay.data[displayIndex];
        if(!alpha) { continue;}
        pixelTotal++;
        const scratchAlpha = dataScratch.data[displayIndex];
        if(!scratchAlpha) { continue;}
        pixelScratched++;
    }
    if(pixelScratched/pixelTotal < SCRATCH_COMPLETE_PERCENT) { return;}
    scratchContext.fillStyle = SCRATCH_SHADOW_COLOR;
    scratchContext.fillRect(0, 0, displaySize.width, displaySize.height);
    setComplete(true);
}
