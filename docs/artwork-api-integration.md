# Artwork API Integration

This document explains how to integrate your fine art portfolio with the housegallery API using Astro's native build-time data fetching.

## Overview

The portfolio fetches all artwork data directly from your housegallery CMS at build time using Astro's native API fetching capabilities. No placeholder data or intermediate files needed!

## Setup

### 1. API Key Required

You need an API key from your housegallery instance. Create one using:

```bash
cd ~/Code/Personal/housegallery
python manage.py create_api_key "Your Artist Name"
```

This will output an API key. Save it securely.

### 2. Environment Variables

Create a `.env` file in your project root:

```bash
# .env
HOUSEGALLERY_API_URL=http://localhost:8000
HOUSEGALLERY_API_KEY=your-api-key-here
```

### 3. Build the Site

```bash
npm run build
```

That's it! Astro will automatically:
- Fetch data from your housegallery API at build time
- Transform it to match the Astro schema
- Generate static pages for both placeholder and real artworks

## Data Transformation

The script transforms housegallery API data to match your Astro schema:

### API Structure → Astro Schema
- `title` → `title`
- `artists` → `collaborators`
- `description` → `description` & `artistStatement`
- `materials_list` → `materials`
- `size` → `dimensions`
- `date` → `creationDate`
- `images` → `images` (with different types: main, detail, process)
- `artifacts` → `processNotes` & `technicalNotes`

### Project Grouping Logic

Artworks are automatically grouped into projects based on:
1. **Collaborative works** - Multiple artists
2. **Material-based projects** - Same primary medium
3. **Default grouping** - Individual practice

## Development Workflow

### Development Mode
- During development (`npm run dev`), if no API key is provided, the site will show empty states
- Add your API key to `.env` to develop with real data

### Production Deployment
1. Set environment variables in your deployment platform:
   - `HOUSEGALLERY_API_URL=http://your-api-server.com`
   - `HOUSEGALLERY_API_KEY=your-api-key-here`
2. Deploy - the build process automatically fetches all your artwork data
3. Static pages are generated for each artwork

## Customization

### Adding New Fields

To add new fields from the API:

1. **Update the API interface** in `src/lib/artwork-data.ts`
2. **Update the transformation logic** in the same file
3. **Update the schema** in `src/content/config.ts` if needed
4. **Update your page templates** to display the new fields

### Custom Project Grouping

Modify the project grouping logic in the `transformAPIArtwork()` function in `src/lib/artwork-data.ts`.

### Image Handling

The system automatically categorizes images as:
- `main` - Primary artwork image
- `detail` - Additional views and close-ups
- `process` - Work-in-progress and process documentation
- `context` - Installation or exhibition views

## Troubleshooting

### No artworks found
- Check your API key is correct
- Verify the housegallery server is running on localhost:8000
- Ensure your artist account has artworks associated

### Authentication errors
- Verify the API key belongs to the correct artist
- Check that the key is active in the housegallery admin

### Build errors
- Run `npm run build` to see detailed error messages
- Check that all required fields are present in the transformed data
- Verify image URLs are accessible

## API Endpoints

The integration uses these housegallery API endpoints:

- `GET /api/v1/artworks/` - List all artworks
- `GET /api/v1/artworks/{id}/` - Get single artwork (for future use)

Authentication: `API-Key: your-key-here` header

## How It Works

The Astro-native integration:
- Fetches data directly during the build process
- No intermediate files are created
- API data is combined with placeholder data in memory
- Static pages are generated for all artworks

This approach is cleaner and more performant than pre-fetching to files.