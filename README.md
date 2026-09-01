# Bundled dependencies

`runtime.js` was extracted from the working invitation's existing bundle. Its React and React DOM versions are 19.2.6; its Lucide React notices identify version 1.31.0. Existing license notices remain in the bundle. No dependency versions were changed during this refactor.

The only added bridge is `window.InvitationRuntime`, which exposes React, the JSX element factories, `createRoot` and the seven icons used by `app.js`.

`base.css` contains the original generated framework/base styles. It remains ahead of `styles.css` in the cascade. It also contains the existing Google Fonts import.

Normal text, style and interaction changes do not require editing these dependency files. A future dependency upgrade should rebuild a compatible runtime bridge and be checked against the invitation's rendering and interactions.
