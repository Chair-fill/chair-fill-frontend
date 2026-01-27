# Satoshi Font Setup

The application is configured to use the Satoshi font family. To complete the setup:

## Font Files Required

Place the following Satoshi font files in the `fonts/` directory at the root of your project:

- `Satoshi-Light.woff2` (weight: 300)
- `Satoshi-Regular.woff2` (weight: 400)
- `Satoshi-Medium.woff2` (weight: 500)
- `Satoshi-Bold.woff2` (weight: 700)
- `Satoshi-Black.woff2` (weight: 900)

## Directory Structure

```
chair-fill-frontend/
├── app/
│   └── layout.tsx
├── fonts/          ← Create this directory
│   ├── Satoshi-Light.woff2
│   ├── Satoshi-Regular.woff2
│   ├── Satoshi-Medium.woff2
│   ├── Satoshi-Bold.woff2
│   └── Satoshi-Black.woff2
└── ...
```

## Where to Get Satoshi Font

Satoshi is a commercial font. You can purchase it from:
- [Fontshare](https://www.fontshare.com/fonts/satoshi)
- Or use your licensed copy

## Alternative: Using Google Fonts

If you don't have access to Satoshi, you can temporarily use a similar font by updating `app/layout.tsx` to use a Google Font instead.
