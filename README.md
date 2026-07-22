# Through Her Eyes

An open-source, adjustable low-vision simulator that applies visual effects to a live camera feed. It is designed to help families, friends, designers and developers start more informed conversations about low vision.

This project is an educational conversation aid—not a medical device, diagnostic tool or exact reproduction of any person’s sight. A diagnosis or acuity measurement alone cannot tell us precisely what someone sees. Let the person with lived experience guide the settings and the conversation.

## Features

- Live front or rear camera on supported phones and computers
- Switchable left-eye and right-eye example profiles
- Adjustable simulation strength, contrast, color, glare and haze
- Central-loss and narrowed-field overlays
- Press-and-hold comparison with the unfiltered camera view
- Safety guidance before the camera starts
- No image capture, upload, analytics or server-side processing

## Privacy

Camera frames stay inside the browser and are not transmitted or stored by this application. The source contains no patient records, personal diagnoses, deployment identifiers, API keys or analytics code.

As with any open-source project, review your hosting provider and any changes you make before deploying it publicly.

## Run locally

Requirements:

- Node.js 22 or newer
- npm

```bash
git clone https://github.com/mindthevirt/through-her-eyes.git
cd through-her-eyes
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Camera access works on `localhost`. On another device, browsers generally require HTTPS before allowing camera access.

To create and run a production build:

```bash
npm run build
npm start
```

## Using the simulator safely

- Sit or stand still while using it. Do not walk while watching the filtered feed.
- Never use it near roads, stairs, heat, sharp objects or other hazards.
- Do not treat a preset as proof of what another person sees.
- Ask the person whose vision you are discussing what feels similar, what feels wrong and what support they actually want.

## How it works

The app requests a camera stream with the browser `getUserMedia` API. CSS filters reduce detail, contrast, color and brightness. Layered gradients approximate central and peripheral field loss, glare and haze. The profile numbers are illustrative UI defaults, not clinical measurements.

## Customize

- Profile defaults: `app/page.tsx`
- Visual overlays and layout: `app/globals.css`
- Page metadata: `app/layout.tsx`

If you adapt the simulator for a specific person, keep their medical information out of the repository. Store only the minimum settings you need, obtain their consent and describe the result as an approximation.

## Contributing

Issues and pull requests are welcome. Please keep accessibility, privacy and respectful disability language central to proposed changes.

## License

[MIT](LICENSE)
