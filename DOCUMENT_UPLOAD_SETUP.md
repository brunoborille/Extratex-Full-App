# Document Upload Feature Setup

## Overview
The document upload feature allows users to upload lab results (images or PDFs) and automatically extract assay values to populate the input fields.

## How It Works
1. Users upload a lab results document (JPG, PNG, or PDF)
2. The document is sent to a Supabase Edge Function
3. The edge function uses OpenAI's GPT-4 Vision API to extract relevant data
4. Extracted values (copper, gold, silver, humidity) automatically populate the input fields

## Required Setup

### OpenAI API Key
The edge function requires an OpenAI API key to process documents.

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add the API key to your Supabase project:
   - Go to your Supabase Dashboard
   - Navigate to Project Settings > Edge Functions
   - Add a new secret:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (starts with `sk-`)

## Usage

### In the Application
1. Navigate to the "Input" tab
2. Look for the "Upload Lab Results" card at the top
3. Click or drag-and-drop your lab results document
4. Wait for processing (usually 2-5 seconds)
5. The extracted values will automatically populate the input fields

### Supported File Types
- JPEG images (.jpg, .jpeg)
- PNG images (.png)
- PDF documents (.pdf)

### Maximum File Size
- 10MB per file

## Extracted Data
The system looks for and extracts the following values:
- **Copper (Cu)**: Copper percentage or grade
- **Humidity**: Moisture content, H2O percentage
- **Gold (Au)**: Gold content (g/t, ppm, or oz/t)
- **Silver (Ag)**: Silver content (g/t, ppm, or oz/t)

## Troubleshooting

### "Failed to process document"
- Ensure your OpenAI API key is correctly configured
- Check that the document is readable and contains lab results
- Verify the file size is under 10MB

### "No data could be extracted"
- The document may not contain recognizable lab results
- Try uploading a clearer image or a different format
- Ensure the document contains the metal assay values

### API Costs
- The feature uses OpenAI's GPT-4 Vision API
- Cost is approximately $0.01-0.03 per document processed
- Check [OpenAI Pricing](https://openai.com/pricing) for current rates
