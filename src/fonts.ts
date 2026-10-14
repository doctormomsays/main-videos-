// Fonts are bundled from npm so renders never depend on the network.
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/pacifico/latin-400.css';
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/great-vibes/latin-400.css';
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
    '300 40px Inter',
    '600 40px Inter',
    '700 40px Inter',
    'italic 400 40px "Instrument Serif"',
    '400 40px "Great Vibes"',
  ].map((f) => document.fonts.load(f)),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
