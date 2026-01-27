# Move Fonts to App Directory

To fix the Satoshi font loading issue, please move the font files from `public/fonts/` to `app/fonts/`.

## Steps:

1. Create the `app/fonts/` directory if it doesn't exist
2. Copy these files from `public/fonts/` to `app/fonts/`:
   - Satoshi-Light.otf
   - Satoshi-Regular.otf
   - Satoshi-Medium.otf
   - Satoshi-Bold.otf
   - Satoshi-Black.otf

## Why?

Next.js `localFont` works best when fonts are co-located in the `app` directory rather than in the `public` folder. The public folder is for static assets served at runtime, while fonts need to be processed at build time.

## Alternative

If you prefer to keep fonts in `public/fonts/`, you can use CSS `@font-face` in `globals.css` instead, but `localFont` provides better optimization.
