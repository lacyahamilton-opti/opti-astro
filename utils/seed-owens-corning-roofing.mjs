/**
 * Seeds an OwensCorningHomePage-typed "Roofing" page under the
 * "Owens Corning" BlankExperience container, then publishes it.
 *
 * Reuses the existing OC Home footer; creates fresh hero / card set /
 * quick links / attention bar / news section. Image fields left blank.
 *
 * Usage: node --env-file=.env utils/seed-owens-corning-roofing.mjs
 */

import { randomUUID } from 'crypto';

const API = 'https://api.cms.optimizely.com/preview3/experimental';
const AUTH_URL = 'https://api.cms.optimizely.com/oauth/token';

const CONTAINER = '32d9151996bd4ea68811555e83bc5939'; // "Owens Corning" BlankExperience
const FOOTER_KEY = 'e24c5f38742b4a949f600e0502189b2e'; // reuse existing OC Home footer
const LOCALE = 'en';

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
        throw new Error(
            `Create ${contentType} "${displayName}" failed: ${r.status} ${(await r.text()).slice(0, 400)}`
        );
    }
    console.log(`✅ ${contentType.padEnd(28)} ${displayName} → ${key}`);
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
        throw new Error(
            `Publish ${key} failed: ${r.status} ${(await r.text()).slice(0, 300)}`
        );
    }
    console.log(`📢 published ${key}`);
}

// ── Hero ─────────────────────────────────────────────────────────────
const heroKey = await createContent({
    contentType: 'OwensCorningHero',
    displayName: 'Roofing — Hero',
    properties: {
        Heading: 'Built to\nOutperform',
        HighlightedHeading: 'Every Storm',
        Body: '<p>Engineered for performance, designed for curb appeal. Explore the roofing systems, components, and warranty programs that protect what matters most.</p>',
        Ctas: [
            link('/roofing/contractors', 'Find a Contractor'),
            link('/en-us/roofing/shingles', 'Pick Your Shingles'),
            link('/en-us/roofing/warranty', 'Warranty Info'),
        ],
    },
});

// ── Card Set ─────────────────────────────────────────────────────────
const cardSetKey = await createContent({
    contentType: 'OwensCorningCardSet',
    displayName: 'Roofing — Featured',
    properties: {
        Cards: [
            {
                Heading: 'Shingles for Every Style',
                Body: '<p>From classic three-tab to designer profiles, find the right shingle for your home. Engineered for durability, designed for curb appeal.</p>',
                Link: link('/en-us/roofing/shingles', 'Browse Shingles'),
            },
            {
                Heading: 'A Complete Roofing System',
                Body: '<p>Underlayments, ventilation, ice & water barriers, and starter strips that work together. Better together than apart.</p>',
                Link: link('/en-us/roofing/components', 'Explore Components'),
            },
            {
                Heading: '2026 Shingle Color of the Year',
                Body: '<p>Meet Evergreen Mist — part of the TruDefinition® Duration® Designer line. Curb appeal and performance in one shingle.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2025/Owens-Corning-Announces-Evergreen-Mist-as-2026-Shingle-Color-of-the-Year/default.aspx',
                    'Read the Story',
                    '_blank'
                ),
            },
        ],
    },
});

// ── Quick Links ─────────────────────────────────────────────────────
const quickLinksKey = await createContent({
    contentType: 'OwensCorningQuickLinks',
    displayName: 'Roofing — Quick Links',
    properties: {
        Heading: 'Roofing Quick Links',
        Items: [
            {
                IconClass: 'fa fa-home',
                Label: 'Pick Your Shingles',
                Link: link('/en-us/roofing/shingles', 'Pick Your Shingles'),
            },
            {
                IconClass: 'fa fa-file-text-o',
                Label: 'Roofing Warranty 101',
                Link: link('/en-us/roofing/warranty', 'Roofing Warranty 101'),
            },
            {
                IconClass: 'fa fa-file-pdf-o',
                Label: 'Roofing Documents',
                Link: link('/en-us/roofing/documents', 'Roofing Documents'),
            },
            {
                IconClass: 'fa fa-search',
                Label: 'Find Roofing Suppliers',
                Link: link(
                    '/en-us/roofing/where-to-buy',
                    'Find Roofing Suppliers'
                ),
            },
            {
                IconClass: 'fa fa-hard-hat',
                Label: 'Roofing Contractors',
                Link: link('/en-us/roofing/contractors', 'Roofing Contractors'),
            },
            {
                IconClass: 'fa fa-laptop',
                Label: 'Warranty Registration',
                Link: link(
                    '/en-us/roofing/warranty/register-standard',
                    'Warranty Registration'
                ),
            },
        ],
    },
});

// ── Attention Bar ────────────────────────────────────────────────────
const attentionBarKey = await createContent({
    contentType: 'OwensCorningAttentionBar',
    displayName: 'Roofing — Find a Pro',
    properties: {
        Heading: 'Find a Roofing Professional Near You',
        Ctas: [
            link('/roofing/contractors', 'Find a Contractor'),
            link('/en-us/roofing/where-to-buy', 'Find a Supplier'),
        ],
    },
});

// ── News Section ─────────────────────────────────────────────────────
const newsSectionKey = await createContent({
    contentType: 'OwensCorningNewsSection',
    displayName: 'Roofing — News',
    properties: {
        Heading: 'Roofing News',
        MoreLink: link(
            'http://newsroom.owenscorning.com/',
            'More News',
            '_blank'
        ),
        Items: [
            {
                Prehead: 'Color of the Year',
                Title: "'Evergreen Mist' Introduced as 2026 Shingle Color of the Year",
                Body: '<p>Part of the TruDefinition® Duration® Designer line, Evergreen Mist delivers curb appeal and performance.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2025/Owens-Corning-Announces-Evergreen-Mist-as-2026-Shingle-Color-of-the-Year/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
            {
                Prehead: 'Innovation',
                Title: 'New Components Designed to Work Together',
                Body: '<p>From underlayments to starter strips, our roofing systems are engineered to perform as a unit.</p>',
                Link: link('/en-us/roofing/components', 'Learn More'),
            },
            {
                Prehead: 'Warranty',
                Title: 'Owens Corning Roofing Warranty: Built In, Not Bolted On',
                Body: '<p>From standard to platinum protection, see how our warranty programs cover what matters most.</p>',
                Link: link('/en-us/roofing/warranty', 'Learn More'),
            },
        ],
    },
});

// ── Roofing Page ─────────────────────────────────────────────────────
const pageKey = await createContent({
    contentType: 'OwensCorningHomePage',
    displayName: 'Roofing',
    properties: {
        HeroArea: [ref(heroKey)],
        MainContentArea: [
            ref(cardSetKey),
            ref(quickLinksKey),
            ref(attentionBarKey),
            ref(newsSectionKey),
        ],
        FooterArea: [ref(FOOTER_KEY)], // reuse existing OC Home footer
        SeoSettings: {
            MetaTitle: 'Roofing | Owens Corning',
            MetaDescription:
                'Owens Corning roofing systems — shingles, components, warranties, and contractor resources for residential and commercial roofing.',
        },
    },
});

// ── Publish everything ───────────────────────────────────────────────
console.log('');
console.log('Publishing all new content...');
for (const k of [
    heroKey,
    cardSetKey,
    quickLinksKey,
    attentionBarKey,
    newsSectionKey,
    pageKey,
]) {
    await publish(k);
}

console.log('');
console.log('Created Roofing page:', pageKey);
console.log('Container:', CONTAINER);
console.log('');
console.log('Optimizely Graph should sync within ~30s.');
