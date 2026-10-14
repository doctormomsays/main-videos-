// Fonts are bundled from npm so renders never depend on the network.
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/pacifico/latin-400.css';
import '@fontsource/quicksand/latin-600.css';
import '@fontsource/quicksand/latin-700.css';
import {continueRender, delayRender} from 'remotion';

// Hold rendering until the faces are actually loaded, so no frame uses a fallback font.
const handle = delayRender('Loading brand fonts');
Promise.all(
  [
    '600 40px Montserrat',
    '800 40px Montserrat',
    '900 40px Montserrat',
    '700 40px "Playfair Display"',
    '400 40px Pacifico',
    '600 40px Quicksand',
    '700 40px Quicksand',
  ].map((f) => document.fonts.load(f)),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
