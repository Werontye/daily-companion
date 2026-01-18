# Favicon Setup Instructions

The application now has favicon support configured. A placeholder SVG favicon has been created with the letters "DC" (Daily Companion).

## Current Files

- `/public/favicon.svg` - Temporary SVG favicon with "DC" letters

## To Add Your Custom Favicon

You need to create and add the following files to the `/public` directory:

### Required Files:

1. **favicon.ico** (32x32 or 16x16) - Classic ICO format for older browsers
2. **icon-192.png** (192x192) - For Android devices and PWA
3. **icon-512.png** (512x512) - For Android devices and PWA
4. **apple-touch-icon.png** (180x180) - For iOS devices

### How to Create These Files:

#### Option 1: Use an Online Favicon Generator

1. Visit [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload your logo or design
3. Download the generated files
4. Place them in the `/public` directory

#### Option 2: Use Design Software

1. Create your logo design in Figma, Photoshop, or Illustrator
2. Export in the following sizes:
   - 16x16 and 32x32 for `favicon.ico`
   - 192x192 for `icon-192.png`
   - 512x512 for `icon-512.png`
   - 180x180 for `apple-touch-icon.png`

#### Option 3: Use Command Line Tools

If you have ImageMagick installed:

```bash
# Convert SVG to PNG sizes
convert -background transparent favicon.svg -resize 192x192 public/icon-192.png
convert -background transparent favicon.svg -resize 512x512 public/icon-512.png
convert -background transparent favicon.svg -resize 180x180 public/apple-touch-icon.png
convert -background transparent favicon.svg -resize 32x32 public/favicon.ico
```

### Design Recommendations:

- **Simple and recognizable**: Favicons are very small, so use simple shapes and bold colors
- **Square aspect ratio**: Design should work well in a square format
- **Test at small sizes**: Make sure your design is visible at 16x16 pixels
- **Use your brand colors**: Match your application's color scheme
- **Consider dark mode**: Ensure the icon works on both light and dark backgrounds

### Current Placeholder Design:

The temporary favicon is a blue square (#2563eb) with white "DC" letters. You should replace this with your actual logo or brand icon.

## Metadata Configuration

The favicon metadata is configured in `/src/app/layout.tsx`:

```typescript
icons: {
  icon: [
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}
```

After adding your custom favicon files, restart the development server or redeploy the application to see the changes.
