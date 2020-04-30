

//==============================================================================

//-- Dependencies --------------------------------
import Vue from './vue.esm.browser.js';
import './scratcher.js';

//------------------------------------------------
new Vue({
    el: '#root',
    data: {
        height: 400,
        width: 400,
    },
    methods: {
        finished() {
            console.log('Finished')
        }
    }
});
