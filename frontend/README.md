# Frontend

The frontend is built with React and displays the processed receipt information with expiry date tracking.

## Features

- Real-time display of items from receipts
- Expiry date tracking with D-day calculation
- Supabase Realtime integration for live updates
- Responsive UI for various screen sizes

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in a `.env` file:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url_here
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   REACT_APP_BACKEND_URL=your_backend_url_here
   ```

3. Run the development server:
   ```bash
   npm start
   ```

## Components

- `App.js`: Main application component
- `components/`: Reusable UI components
  - `ProductList.js`: Displays the list of products with expiry dates
  - `ExpiryCounter.js`: Shows D-day countdown for each product
- `utils/`: Utility functions
  - `supabaseClient.js`: Supabase client configuration

## Environment Variables

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `REACT_APP_BACKEND_URL`: URL of the backend Flask application