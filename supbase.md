# BargainB - Supabase Setup Guide

This guide provides instructions for setting up and configuring Supabase in your development environment.

## Project Configuration

### General Settings

- **Project Name:** BargainB
- **Project ID:** oumhprsxyxnocgbzosvh
- **Project URL:** https://oumhprsxyxnocgbzosvh.supabase.co

### API Keys

```typescript
// Anon Public Key (Safe to commit)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWhwcnN4eXhub2NnYnpvc3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDk5MTIsImV4cCI6MjA2NDA4NTkxMn0.obV-VVrXWZ6y3_Q_OuQyk-COttfH_7yHnMxYpWtVlng'

// Service Role Key (NEVER commit or expose this!)
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWhwcnN4eXhub2NnYnpvc3ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUwOTkxMiwiZXhwIjoyMDY0MDg1OTEyfQ.IBgTilAos3LC1ZoDKRWcu1F0mcOiAAFTFInQMhE2Bt0'
```

⚠️ **Important:** Never expose your service role key in your codebase or commit it to version control. Use environment variables instead.

## Installation

Install the Supabase client library using your preferred package manager:

```bash
# npm
npm install @supabase/supabase-js

# yarn
yarn add @supabase/supabase-js

# pnpm
pnpm add @supabase/supabase-js
```

## Basic Setup

### Client Initialization

Create a new file called `lib/supabase.ts` (or `js`) and add the following code:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://oumhprsxyxnocgbzosvh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oumhprsxyxnocgbzosvh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## TypeScript Support

### Generating Types

1. Install the Supabase CLI if you haven't already:
```bash
npm install -g supabase
```

2. Generate TypeScript types from your database schema:
```bash
supabase gen types typescript --project-id oumhprsxyxnocgbzosvh > lib/database.types.ts
```

### Using Types

Example of using the generated types:

```typescript
import { Database } from './database.types'

// Type for a table row
type Movie = Database['public']['Tables']['movies']['Row']

// Type for an insert
type MovieInsert = Database['public']['Tables']['movies']['Insert']

// Type for an update
type MovieUpdate = Database['public']['Tables']['movies']['Update']
```

## Basic Usage Examples

### Fetching Data

```typescript
const fetchMovies = async () => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
  
  if (error) {
    console.error('Error fetching movies:', error)
    return
  }
  
  return data
}
```

### Inserting Data

```typescript
const addMovie = async (movie: MovieInsert) => {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select()
  
  if (error) {
    console.error('Error adding movie:', error)
    return
  }
  
  return data[0]
}
```

### Updating Data

```typescript
const updateMovie = async (id: number, updates: MovieUpdate) => {
  const { data, error } = await supabase
    .from('movies')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error('Error updating movie:', error)
    return
  }
  
  return data[0]
}
```

### Deleting Data

```typescript
const deleteMovie = async (id: number) => {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting movie:', error)
    return false
  }
  
  return true
}
```

## Best Practices

1. **Environment Variables**
   - Always use environment variables for sensitive keys
   - Include only the anon key in client-side code
   - Keep service role key secure and use only in trusted server environments

2. **Type Safety**
   - Regularly update your types when the database schema changes
   - Use TypeScript's type inference for better code completion and error catching
   - Define custom types for complex queries

3. **Error Handling**
   - Always check for errors in Supabase responses
   - Implement proper error handling and user feedback
   - Log errors appropriately for debugging

4. **Security**
   - Implement Row Level Security (RLS) policies
   - Never expose the service role key
   - Use the least privileged access principle

## Product Upload System

This project includes a comprehensive product upload system that can handle the `products_final.csv` file with graceful error handling, duplicate management, and missing GTIN generation.

### Features

- **Missing GTIN Handling**: Automatically generates unique GTINs for products without them
- **Duplicate Management**: Uses the variant system to handle products with duplicate GTINs
- **Batch Processing**: Processes products in batches of 50 for optimal performance
- **Error Recovery**: Continues processing even when individual products fail
- **Comprehensive Logging**: Detailed statistics and error reporting
- **Relationship Management**: Automatically creates categories, subcategories, and brands as needed

### Quick Start

1. **Install Dependencies**:
```bash
npm install @supabase/supabase-js csv-parse
```

2. **Test Connection**:
```bash
node scripts/test-connection.js
```

3. **Upload Products**:
```bash
node scripts/upload-products.js
```

### Environment Setup

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oumhprsxyxnocgbzosvh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Important**: The service role key is already configured in the scripts for development, but you should use environment variables for production.

### Upload Process

The upload system handles your CSV data as follows:

1. **Data Validation**: Checks each row for required fields
2. **GTIN Generation**: Creates unique GTINs for products missing them using MD5 hash of title + brand + unit_amount
3. **Duplicate Handling**: 
   - Skips exact duplicates
   - Creates variants for products with same GTIN but different characteristics
4. **Relationship Creation**: Automatically creates missing categories, subcategories, and brands
5. **Multi-table Insert**: Populates related tables (packaging, images, attributes)
6. **Error Handling**: Logs errors but continues processing

### Data Structure

Your CSV will be mapped to these database tables:

- **repo_products**: Main product information (GTIN, title, description, image)
- **repo_brands**: Brand information
- **repo_categories**: Category information  
- **repo_subcategories**: Subcategory information
- **repo_packaging**: Unit amounts, quantities, packaging details
- **repo_product_images**: Additional product images
- **repo_product_attributes**: Product attributes (type, flavor, size, etc.)
- **repo_product_variants**: Product variants for duplicates

### Expected Results

Based on your `products_final.csv` analysis:
- **Total Products**: ~30,665
- **Missing GTINs**: ~1,570 (will be auto-generated)
- **Duplicate GTINs**: ~3,933 (will be handled as variants)
- **Processing Time**: Estimated 10-15 minutes for full dataset

### Monitoring Progress

The script provides real-time progress updates:

```
Loading caches...
Loaded caches: 47 categories, 462 subcategories, 3 brands, 0 existing GTINs
Starting product upload...
Processing file: ./products_final.csv
Generated GTIN 9a1b2c3d4e5f6 for product: Nutrilon Nutrition
Processed batch. Total: 50, Success: 48, Errors: 2
...
=== Upload Complete ===
Total Processed: 30665
Successful: 29890
Errors: 775
Missing GTINs: 1570
Created GTINs: 1570
Duplicate GTINs: 3933
```

### Error Handling

The system gracefully handles:
- Missing or invalid GTINs
- Duplicate products
- Missing category/brand data
- Invalid numeric values
- Network timeouts
- Database constraint violations

Errors are logged but don't stop the overall process.

### Customization

You can modify the upload behavior by editing `scripts/upload-products.js`:

- **Batch Size**: Change `this.batchSize = 50` to process more/fewer items at once
- **GTIN Generation**: Modify the `generateGtin()` method for different GTIN formats
- **Duplicate Handling**: Adjust the duplicate detection logic in `processProduct()`
- **Field Mapping**: Update the product data mapping to match your CSV structure

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)
- [Supabase GitHub](https://github.com/supabase/supabase) 