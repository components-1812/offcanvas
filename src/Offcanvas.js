import OffcanvasBase from "./OffcanvasBase.js";

/**
 * Lateral sliding panel (offcanvas).
 *
 * @element custom-offcanvas
 *
 * @attr {("left"|"right")} [variant="left"] - Panel position or visual style.
 * @attr {boolean} [open] - Whether the panel is open.
 * @attr {boolean} [handle-button] - Whether to show a floating handle button.
 *
 * @fires ready-links - Fired when all external stylesheet links have finished loading.
 * @fires ready - Dispatched when the component has finished initializing (end of connectedCallback).
 * 
 * @slot header - Header content.
 * @slot close-button - Icon or content for the close button.
 * @slot default - Panel body content.
 * @slot footer - Footer content.
 * @slot backdrop - Slot inside the backdrop.
 */
class Offcanvas extends OffcanvasBase {

    #offcanvas = null;

    constructor(){
        super();

        this.shadowRoot.innerHTML = /*html*/`
            <div class="offcanvas">
                <div class="panel">
                    <div class="panel-content">
                        <header class="panel-header">
                            <slot name="header">
                                <h2 class="offcanvas-title">Offcanvas Title</h2>
                            </slot>
                            <button class="close-button" aria-label="Close">
                                <slot name="close-button">
                                    ${Offcanvas.DEFAULT_ICONS['close-button']}
                                </slot>
                            </button>
                        </header>
                        <div class="panel-body">
                            <slot>
                                Offcanvas Body Content
                            </slot>
                        </div>
                        <footer class="panel-footer">
                            <slot name="footer"></slot>
                        </footer>
                    </div>
                </div>
                <div class="offcanvas-backdrop">
                    <!-- Handle button will be appended here if 'handle-button' attribute is set -->
                    <slot name="backdrop"></slot>
                </div>
            </div>
        `;

        this.#offcanvas = this.shadowRoot.querySelector('.offcanvas');

        this.applyStylesSheets();
    }

    //MARK: Lifecycle Callbacks
    connectedCallback() {

        this.shadowRoot.querySelector('.close-button')
            .addEventListener('click', this.#handleClose, {});

        this.shadowRoot.querySelector('.offcanvas-backdrop')
            .addEventListener('click', this.#handleClose);

        this.dispatchEvent(new CustomEvent('ready'));
		this.setAttribute('ready', '');
    }
    disconnectedCallback() {

        this.shadowRoot.querySelector('.close-button')
            ?.removeEventListener('click', this.#handleClose);
        
        this.shadowRoot.querySelector('.offcanvas-backdrop')
            ?.removeEventListener('click', this.#handleClose);

        this.#disposeHandleButton();
    }

    static observedAttributes = ['variant', 'open', 'handle-button'];

    attributeChangedCallback(name, oldValue, newValue) {

        if(oldValue === newValue) return;

        if(name === 'variant'){
     
            this.variant ? this.#offcanvas?.setAttribute('variant', this.variant) : this.#offcanvas?.removeAttribute('variant');
            return;
        }
        if(name === 'open'){

            this.#offcanvas?.toggleAttribute('open', this.open);

            this.dispatchEvent( new CustomEvent('offcanvas-toggle', {
                detail: { open: this.open },
                bubbles: true,
                composed: true
            }));

            return;
        }
        if(name === 'handle-button'){

            if(this.handleButton){
                this.shadowRoot.querySelector('.offcanvas-backdrop')
                    .append(this.#renderHandleButton());
            }
            else {
                this.#disposeHandleButton();
            }
            return;
        }
    }

    //MARK: Public Methods
    show(){
        this.open = true;
    }
    hide(){
        this.open = false;
    }
    /** @param {boolean | undefined} force  */
    toggle(force){
        if(typeof force === 'boolean'){
            this.open = force;
        }
        else {
            this.open = !this.open;
        }
    }

    //MARK: Private Methods
    #renderHandleButton(){
        const handleButton = document.createElement('button');
        handleButton.classList.add('handle-button');

        handleButton.innerHTML = /*html*/`<slot name="handle-button">
            ${Offcanvas.DEFAULT_ICONS['handle-button']}
        </slot>`;

        handleButton.addEventListener('click', this.#handleOpen);

        return handleButton;
    }
    #disposeHandleButton(){
        const handleButton = this.shadowRoot.querySelector('.handle-button');
        handleButton?.removeEventListener('click', this.#handleOpen);
        handleButton?.remove();
    }

    //MARK: Listeners handlers
    #handleOpen = (e) => {
        e.stopPropagation();
        this.toggle();
    }
    #handleClose = (e) => {
        e.stopPropagation();
        this.hide();
        console.log('close')
    }
}

export {Offcanvas};
export default Offcanvas;



