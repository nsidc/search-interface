import { Control } from 'ol/control';

class ModeControl extends Control {
    constructor(mediator) {
        const options = {};

        const button = document.createElement('button');
        button.innerHTML = '<svg width="16" height="16" version="1.1" viewBox="0 0 100 100">' + 
            '<path d="M 20 20 H 85 V 85 H 20 Z" fill="transparent" stroke="black" stroke-width="2"></path>' + 
            '<circle cx="20" cy="20" r="10" fill="black"/><circle cx="85" cy="20" r="10" fill="black"/>' +
            '<circle cx="85" cy="85" r="10" fill="black"/><circle cx="20" cy="85" r="10" fill="black"/>' +
            '</svg>';
        button.title = "Draw Bounding Box"
        const element = document.createElement('div');
        element.setAttribute('id', 'mode-toggle');
        element.className = 'ol-unselectable ol-control';
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleModeToggle.bind(this), false);
        this.mediator = mediator;
        this.element = element;
        this.isActive = false;

        this.mediator.bind('map:extentDrawEnded', this.resetToggle, this);
    }

    resetToggle() {
        this.isActive = false;
        this.element.classList.remove('toggle-active');
    }

    handleModeToggle() {
        if (this.isActive) {
            this.element.classList.remove('toggle-active');
        } else {
            this.element.classList.add('toggle-active');
        }
        this.isActive = !this.isActive;
        this.mediator.trigger('map:toggleMode');
    }
}

export default ModeControl;
