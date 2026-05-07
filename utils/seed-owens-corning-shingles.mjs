/**
 * Seeds an OwensCorningShinglesPage (OwensCorningHomePage type) under the
 * Roofing page, with a ProductList component pointing at the PIM fixture feed.
 *
 * Usage: node --env-file=.env utils/seed-owens-corning-shingles.mjs
 */

import { randomUUID } from 'crypto';

const API = 'https://api.cms.optimizely.com/preview3/experimental';
const AUTH_URL = 'https://api.cms.optimizely.com/oauth/token';

// Container = Roofing page key (parent)
const CONTAINER = 'ed0c3b436ea441149cfad8b6e34ccd55';
const FOOTER_KEY = 'e24c5f38742b4a949f600e0502189b2e';
const LOCALE = 'en';

// Base URL where the PIM feed is served — update if your dev/prod URL differs
const SITE_BASE = process.env.SITE_URL ?? 'http://localhost:4321';

let token;
async function getToken() {
    if (token) return token;
    const creds = Buffer.from(
        `${process.env.OPTIMIZELY_CLIENT_ID}:${process.env.OPTIMIZELY_CLIENT_SECRET}`
    ).toString('base64');
    const r = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const d = await r.json();
    if (!d.access_token) throw new Error('auth failed: ' + JSON.stringify(d));
    token = d.access_token;
    return token;
}

const uuid32 = () => randomUUID().replace(/-/g, '');
const link = (url, text, target = '') => ({ url, target, title: '', text });
const ref = (key) => ({ reference: `cms://content/${key}` });

async function createContent({ contentType, displayName, properties }) {
    const t = await getToken();
    const key = uuid32();
    const r = await fetch(`${API}/content`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${t}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            key,
            contentType,
            container: CONTAINER,
            displayName,
            locale: LOCALE,
            properties,
        }),
    });
    if (!r.ok) {
        const text = await r.text();
        throw new Error(
            `Create ${contentType} "${displayName}" failed: ${r.status} ${r.statusText} — ${text.slice(0, 500)}`
        );
    }
    console.log(`✅ ${contentType.padEnd(30)} ${displayName} → ${key}`);
    return key;
}

async function publish(key) {
    const t = await getToken();
    const r = await fetch(`${API}/content/${key}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${t}`,
            'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({ status: 'published' }),
    });
    if (!r.ok) {
        const text = await r.text();
        throw new Error(`Publish ${key} failed: ${r.status} — ${text.slice(0, 300)}`);
    }
    console.log(`📢 Published ${key}`);
}

// ── Hero ──────────────────────────────────────────────────────────────────────
const heroKey = await createContent({
    contentType: 'OwensCorningHero',
    displayName: 'Shingles — Hero',
    properties: {
        Heading: 'Our Shingle',
        HighlightedHeading: 'Collections',
        Body: '<p>From classic three-tab to designer impact-rated shingles, Owens Corning offers a full range of roofing products built for beauty, performance, and long-lasting protection.</p>',
        Ctas: [
            link('/en-us/roofing/shingles', 'Browse All Shingles'),
            link('/en-us/roofing/contractors', 'Find a Contractor'),
        ],
    },
});
await publish(heroKey);

// ── Product List ──────────────────────────────────────────────────────────────
const productListKey = await createContent({
    contentType: 'OwensCorningProductList',
    displayName: 'Shingles — Product Grid',
    properties: {
        Heading: 'Shingle Products',
        SubHeading: 'Explore our full lineup of architectural, designer, impact-rated, and cool-roof shingles.',
        PimEndpoint: `${SITE_BASE}/api/pim/shingles.json`,
        DisplayCount: 0,
    },
});
await publish(productListKey);

// ── Attention Bar ─────────────────────────────────────────────────────────────
const attentionBarKey = await createContent({
    contentType: 'OwensCorningAttentionBar',
    displayName: 'Shingles — Find an Expert',
    properties: {
        Heading: 'Ready to Start Your Roofing Project?',
        Ctas: [
            link('/en-us/roofing/contractors', 'Find a Contractor'),
            link('/en-us/roofing/where-to-buy', 'Where to Buy'),
            link('/en-us/roofing/warranty/register-standard', 'Register Warranty'),
        ],
    },
});
await publish(attentionBarKey);

// ── Shingles Page ─────────────────────────────────────────────────────────────
const pageKey = await createContent({
    contentType: 'OwensCorningHomePage',
    displayName: 'Shingles',
    properties: {
        HeroArea: [ref(heroKey)],
        MainContentArea: [ref(productListKey), ref(attentionBarKey)],
        FooterArea: [ref(FOOTER_KEY)],
        SeoSettings: {
            MetaTitle: 'Shingles | Roofing | Owens Corning',
            MetaDescription:
                'Browse Owens Corning shingles — architectural, designer, impact-rated and cool-roof options with industry-leading warranties.',
        },
    },
});
await publish(pageKey);

console.log('');
console.log('Created Shingles page:', pageKey);
console.log('Container (Roofing page):', CONTAINER);
console.log('');
console.log('PIM feed endpoint:', `${SITE_BASE}/api/pim/shingles.json`);
console.log('Open in CMS to verify, or check Graph in ~30s.');
