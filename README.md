# Image-Scratcher
"Scratch-ticket" type component for Vue.js
## About
Image-Scratcher is a Vue component that displays an image covered in a scratchable layer - like a digital scratch ticket! The component has options to customize colors or specify an image overlay, and intelligently handles display width / height.
## Getting Started
Image-Scratcher is not part of any package management system.
To use the component, include the file directly in your project. If you are using ES6 modules then you'll need to import Vue into the module. Otherwise, the component will use the global Vue. You can then use Image-Scratcher like a normal Vue component: 
```
<image-scratcher
  width="100"
  height="100"
  background="photo.png"
  @finished="dostuff()"
/>
```

## Documentation
### Props
#### width: Integer (optional)
The width, in pixels, to display the component. Background images will be sized as thoughthe CSS property [```object-fit: contain```](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) were applied, while foreground images will be sized like ```object-fit: fill```. If background and foreground are omitted, then width is mandatory.
#### height: Integer (optional)
The height, in pixels, to display the component. See width for details.
#### background: Url | #hex-color (optional)
The image to be revealed by scratching. If a hex color is specified, a color will be revealed instead. If not specified, a default color (grey) will be used. If width and height are not specified, the element will default to using the size of the background image. By default, the component will crop its shape to the shape of the background image.
#### foreground: Url | #hex-color (optional)
A color or image to be drawn over the background, and then scratched off by the user. If width and height are not specified, and the background isn't an image, then the element will use the size of the foreground image.
### Events
#### Finished
The element emits a ```finished``` event once the user has scratched the entire image.
