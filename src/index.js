import Offcanvas from "./Offcanvas.js";
import OffcanvasRawCSS from './Offcanvas.css?raw';

//Added the css
const OffcanvasCSS = new CSSStyleSheet();

OffcanvasCSS.replaceSync(OffcanvasRawCSS);

Offcanvas.stylesSheets.adopted.push(OffcanvasCSS);

//Define the custom element
Offcanvas.define();

export {Offcanvas}
export default Offcanvas;