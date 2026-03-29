# Simple Weather Forecast Retriever

This repo contains a web app where users can enter their zip code or city and state 
and view the 7-day weather forecast

Currently deployed at: https://palmetto-challange.vercel.app/

## Architecture
- Framework: Next.js 16
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: Shadcn
- Tests: Vite

## Data Flow
1. User enters location information
2. Zippopotam's API is used to validate the location and retrieve the longitude and latitude
3. The validated city and state are returned to the client
4. The user clicks search and the server retrieves the weather data from `weather.gov`
5. Each day forecast is returned to the client to display
6. Fetch requests are cached client side using `swr` for faster results.

## Running
```
npm install
npm run dev
```