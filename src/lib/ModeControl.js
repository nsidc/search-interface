import { Control, defaultControls } from 'ol/control';

class ModeControl extends Control {
    constructor(mediator) {
        const options = {};

        const button = document.createElement('button');
        button.innerHTML = 'BB';
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
        this.shouldAddClass = true;

        this.mediator.bind('map:extentDrawEnded', this.resetToggle, this);
    }

    resetToggle() {
        this.shouldAddClass = true;
        this.element.classList.remove('toggle-active');
    }

    handleModeToggle() {
        if (this.shouldAddClass) {
            this.element.classList.add('toggle-active');
        } else {
            this.element.classList.remove('toggle-active');
        }
        this.shouldAddClass = !this.shouldAddClass;
        this.mediator.trigger('map:toggleMode');
    }
}

export default ModeControl;
