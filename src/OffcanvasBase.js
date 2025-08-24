

class OffcanvasBase extends HTMLElement {

    static VERSION = '0.0.2';
    static DEFAULT_TAG_NAME = 'custom-offcanvas';
    static DEFAULT_ICONS = {
        'close-button': /*svg*/`<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
        </svg>`,
        'handle-button': /*svg*/`<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" data-rotate-icon>
            <path fill-rule="evenodd" d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"/>
        </svg>`
    };

    /**
     * Define the custom element and add stylesheets to it if not already defined.
     *
     * @param {string} [tagName=Offcanvas.DEFAULT_TAG_NAME] - The tag name to define the custom element.
     * @param {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} [stylesSheets={}] - An object with stylesheets to add to the element. It contains three properties: `links`, `adopted`, and `raw`.
     * @returns {void}
     */
    static define(tagName, stylesSheets = {}){

        tagName ??= this.DEFAULT_TAG_NAME;

        if(!window.customElements.get(tagName)){

            //Add new styles
            for(const key of ['links', 'adopted', 'raw']) {
                if(Array.isArray(stylesSheets[key])){
                    this.stylesSheets[key].push(...stylesSheets[key]);
                }
            }

            window.customElements.define(tagName, this);
        }
        else {
            console.warn(`Custom element with tag name "${tagName}" is already defined.`);
        }
    }

    //MARK: Styles
    /**
     * @type {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} Stylesheets to be applied to the component
     */
	static stylesSheets = {
		links: [],
		adopted: [],
		raw: [],
	};

    /**
     * Applies the given stylesheets to the component.
     * @param {{links:string[], adopted:CSSStyleSheet[], raw:string[]}} [stylesSheets=this.constructor.stylesSheets] 
     * - An object with stylesheets to be applied to the component. It contains three properties: `links`, `adopted`, and `raw`.
     * @returns {void}
     * @fires ready-links
     */
    applyStylesSheets(stylesSheets = {}){

        //Add new styles
        for(const key of ['links', 'adopted', 'raw']) {
            if(Array.isArray(stylesSheets[key])){
                this.constructor.stylesSheets[key].push(...stylesSheets[key]);
            }
        }

        //Get styles
        const {links, adopted, raw} = this.constructor.stylesSheets;

        const $styles = document.createElement('div');
        $styles.classList.add('styles');
        $styles.style.display = 'none';

        //Links
        const linksPromises = links.map((styleSheet) => {

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet;

            const { promise, resolve, reject } = Promise.withResolvers();

            //If it's already loaded (rare in shadow DOM, but possible)
            if(link.sheet){
                resolve({ link, href: styleSheet, status: 'loaded' });
            }
            else {
                link.addEventListener('load', () => resolve({ link, href: styleSheet, status: 'loaded' }));
                link.addEventListener('error', () => reject({ link, href: styleSheet, status: 'error' }));
            }

            $styles.append(link);

            return promise;
        });

        this.removeAttribute('ready-links');

        Promise.allSettled(linksPromises).then((results) => {

            this.dispatchEvent(
                new CustomEvent('ready-links', {
                    detail: { results: results.map((r) => r.value || r.reason) },
                })
            );

            this.setAttribute('ready-links', '');
        });

        //Raw css
        raw.forEach((style) => {

            const styleElement = document.createElement('style');
            styleElement.textContent = style;

            $styles.append(styleElement);
        });

        //Clear previous styles
        this.shadowRoot.querySelector('.styles')?.remove();

        //Add new styles
        this.shadowRoot.prepend($styles);
        
        //Adopted
        this.shadowRoot.adoptedStyleSheets = adopted;
    };


    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    //MARK: Getters and Setters
    set variant(value) {
        value ? this.setAttribute('variant', value) : this.removeAttribute('variant');
    }
    get variant() {
        return this.getAttribute('variant');
    }

    set open(value) {
        this.toggleAttribute('open', value);
    }
    get open() {
        return this.hasAttribute('open');
    }

    set handleButton(value){
        this.toggleAttribute('handle-button', value);
    }
    get handleButton(){
        return this.hasAttribute('handle-button');
    }
}

export {OffcanvasBase};
export default OffcanvasBase;