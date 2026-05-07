import type { APIRoute } from 'astro';
import pimData from '../../../data/pim-shingles.json';

export const GET: APIRoute = () => {
    return new Response(JSON.stringify(pimData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
