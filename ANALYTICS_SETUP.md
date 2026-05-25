Analytics setup

- **Purpose:** Integrates Google Analytics (GA4) via `gtag` and exposes simple helpers in `src/utils/analytics.js`.
- **Enable:** Create a `.env` file at project root with the key:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- **Behavior:** If `VITE_GA_MEASUREMENT_ID` is set, the app will load `gtag` and send `page_view` events when the app's hash route changes.
- **Usage:** You can call `trackEvent(name, params)` from components to log custom events.
