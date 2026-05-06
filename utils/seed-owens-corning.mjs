/**
 * Seeds an OwensCorningHomePage with all components populated from the
 * Owens Corning HTML mockup. Image fields are intentionally left blank
 * (CMS-side ImageMedia items don't exist for the mockup CDN URLs); add
 * them via the CMS UI later.
 *
 * Usage:
 *   node --env-file=.env utils/seed-owens-corning.mjs
 */

import { randomUUID } from 'crypto';

const API = 'https://api.cms.optimizely.com/preview3/experimental';
const AUTH_URL = 'https://api.cms.optimizely.com/oauth/token';

const CONTAINER = 'edbb3527f7fb422fb3ae372d296a0a5a'; // "Optimizely" site root
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

function uuid32() {
    return randomUUID().replace(/-/g, '');
}

function link(url, text, target = '') {
    return { url, target, title: '', text };
}

async function createContent({ contentType, displayName, properties }) {
    const t = await getToken();
    const key = uuid32();
    const body = {
        key,
        contentType,
        container: CONTAINER,
        displayName,
        locale: LOCALE,
        properties,
    };
    const r = await fetch(`${API}/content`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${t}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!r.ok) {
        const text = await r.text();
        throw new Error(
            `Create ${contentType} "${displayName}" failed: ${r.status} ${r.statusText} — ${text.slice(0, 500)}`
        );
    }
    console.log(`✅ ${contentType.padEnd(28)} ${displayName} → ${key}`);
    return key;
}

const ref = (key) => ({ reference: `cms://content/${key}` });

// ── Hero ─────────────────────────────────────────────────────────────
const heroKey = await createContent({
    contentType: 'OwensCorningHero',
    displayName: 'OC Home — Hero',
    properties: {
        Heading: 'Building\nA More',
        HighlightedHeading: 'Sustainable\nFuture',
        Body: '<p>Owens Corning is building a sustainable future through material innovation. Explore how our people and products are making the world a better place.</p>',
        Ctas: [
            link('/roofing', 'Roofing'),
            link('/insulation', 'Insulation'),
            link('/composites', 'Composites'),
            link('/doors', 'Doors'),
        ],
    },
});

// ── Card Set (3 featured stories) ────────────────────────────────────
const cardSetKey = await createContent({
    contentType: 'OwensCorningCardSet',
    displayName: 'OC Home — Featured Stories',
    properties: {
        Cards: [
            {
                Heading:
                    'Built to Outperform: Owens Corning Hosts 2025 Investor Day',
                Body: "<p>At the event, the company's executive leadership team highlighted Owens Corning's ability to drive growth and value creation through its updated enterprise strategy and presented financial goals through 2028.</p>",
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2025/Owens-Corning-Highlights-Long-Term-Enterprise-Strategy-for-Growth-and-New-Financial-Targets-at-2025-Investor-Day/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
            {
                Heading: '2024 Owens Corning Sustainability Report Published',
                Body: "<p>Owens Corning has published its 2024 Sustainability Report, Building Better Together, outlining the company's progress toward its 2030 sustainability goals.</p>",
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2025/Owens-Corning-Publishes-2024-Sustainability-Report/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
            {
                Heading:
                    "'Evergreen Mist' Introduced as 2026 Shingle Color of the Year",
                Body: '<p>Owens Corning introduces "Evergreen Mist" as the 2026 Shingle Color of the Year. Part of the TruDefinition® Duration® Designer shingle line, Evergreen Mist delivers both curb appeal and performance.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2025/Owens-Corning-Announces-Evergreen-Mist-as-2026-Shingle-Color-of-the-Year/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
        ],
    },
});

// ── Quick Links ─────────────────────────────────────────────────────
const quickLinksKey = await createContent({
    contentType: 'OwensCorningQuickLinks',
    displayName: 'OC Home — Quick Links',
    properties: {
        Heading: 'Quick Links',
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
            {
                IconClass: 'fa fa-file-pdf-o',
                Label: 'Residential Insulation Documents',
                Link: link(
                    '/en-us/insulation/residential/documents',
                    'Residential Insulation Documents'
                ),
            },
            {
                IconClass: 'fa fa-search',
                Label: 'Find Insulation Suppliers',
                Link: link(
                    '/en-us/insulation/residential/where-to-buy',
                    'Find Insulation Suppliers'
                ),
            },
            {
                IconClass: 'fa fa-search',
                Label: 'Insulation Contractors',
                Link: link(
                    '/en-us/insulation/find-a-professional',
                    'Insulation Contractors'
                ),
            },
        ],
    },
});

// ── Attention Bar ────────────────────────────────────────────────────
const attentionBarKey = await createContent({
    contentType: 'OwensCorningAttentionBar',
    displayName: 'OC Home — Find an Expert',
    properties: {
        Heading: 'Find an Expert Near You',
        Ctas: [
            link('/roofing/contractors', 'Roofing'),
            link('/insulation/find-a-professional', 'Insulation'),
            link('/contact-us', 'Composites'),
        ],
    },
});

// ── News Section ─────────────────────────────────────────────────────
const newsSectionKey = await createContent({
    contentType: 'OwensCorningNewsSection',
    displayName: 'OC Home — Recent News',
    properties: {
        Heading: 'Recent News',
        MoreLink: link(
            'http://newsroom.owenscorning.com/',
            'More News',
            '_blank'
        ),
        Items: [
            {
                Prehead: 'Executive Leadership',
                Title: 'Owens Corning Names Todd Fister Chief Financial and Operating Officer',
                Body: '<p>Fister assumes responsibility for executing key enterprise initiatives that drive growth and performance.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2026/Owens-Corning-Names-Todd-Fister-Chief-Financial-and-Operating-Officer-to-Accelerate-Organic-Growth-and-Strengthen-Market-Leading-Positions/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
            {
                Prehead: 'Enterprise Strategy',
                Title: 'Owens Corning Completes Sale of Glass Reinforcements Business to Praana Group',
                Body: '<p>The transaction strengthens Owens Corning as a focused building products leader in North America and Europe.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2026/Owens-Corning-Completes-Sale-of-Glass-Reinforcements-Business-to-Praana-Group/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
            {
                Prehead: 'Q1 Earnings Date',
                Title: 'Owens Corning to Announce First-Quarter Financial Results on May 6',
                Body: '<p>The company will host a call to discuss its financial results at 9 a.m. ET the same day.</p>',
                Link: link(
                    'https://newsroom.owenscorning.com/all-news-releases/news-details/2026/Owens-Corning-to-Announce-First-Quarter-Financial-Results-on-May-6/default.aspx',
                    'Learn More',
                    '_blank'
                ),
            },
        ],
    },
});

// ── Footer ───────────────────────────────────────────────────────────
const footerKey = await createContent({
    contentType: 'OwensCorningFooter',
    displayName: 'OC Home — Footer',
    properties: {
        Tagline:
            '<p>Our people and our products make the world a better place.</p>',
        SocialLinks: [
            { Platform: 'facebook', Url: 'https://www.facebook.com/WeAreOwensCorning' },
            { Platform: 'twitter', Url: 'http://www.twitter.com/OwensCorning' },
            { Platform: 'youtube', Url: 'http://www.youtube.com/owenscorning' },
            { Platform: 'linkedin', Url: 'http://www.linkedin.com/company/owens-corning' },
            { Platform: 'instagram', Url: 'https://www.instagram.com/weareowenscorning/' },
        ],
        Columns: [
            {
                Title: 'Our Products',
                Links: [
                    link('/roofing', 'Roofing'),
                    link('/insulation/residential', 'Residential Insulation'),
                    link('/insulation/commercial', 'Commercial Insulation'),
                    link('/doors', 'Doors'),
                    link('/en/nonwovens', 'Nonwovens'),
                    link('/en/lumber/', 'Lumber'),
                    link('/composites', 'Composite Solutions'),
                    link('/vidawool', 'VidaWool® Growing Media'),
                    link('http://sds.owenscorning.com/', 'Safety Data Sheets', '_blank'),
                    link('/patents', 'Patents'),
                ],
            },
            {
                Title: 'Our Company',
                Links: [
                    link(
                        'http://investor.owenscorning.com/investor-relations/default.aspx',
                        'Investors',
                        '_blank'
                    ),
                    link('/corporate/sustainability', 'Sustainability'),
                    link('http://newsroom.owenscorning.com/', 'Newsroom', '_blank'),
                    link('https://careers.owenscorning.com/', 'Careers / Job', '_blank'),
                    link('/en-us/literature', 'Literature'),
                    link('/corporate/retiree-forms', 'Retiree Forms'),
                    link('/en-us/corporate/supplier-program', 'Supplier Program'),
                ],
            },
            {
                Title: 'Contact Us',
                Links: [
                    link('tel:18004387465', 'Call 1-800-GET-PINK®'),
                    link(
                        'http://helpline.owenscorning.com/',
                        'Business Conduct Helpline',
                        '_blank'
                    ),
                    link('/roofing/warranty/#manage-warranty', 'Warranty Management'),
                    link('/contact-us/', 'Submit Product Questions'),
                    link('/contact-us/', 'Give Us Feedback'),
                ],
            },
        ],
        QuickLinksLeft: [
            link('/contact-us', 'Contact Us'),
            link('https://careers.owenscorning.com/', 'Careers / Jobs', '_blank'),
            link(
                'http://investor.owenscorning.com/investor-relations/default.aspx',
                'Investors',
                '_blank'
            ),
            link('/locations-languages', 'Locations & Languages'),
        ],
        QuickLinksRight: [
            link('/unsubscribe/', 'Unsubscribe'),
            link('/terms-of-use', 'Terms of Use'),
            link('/privacy-policy', 'Privacy Policy'),
            link('#', 'Manage Preferences'),
        ],
        CopyrightText:
            '<p>&copy; 2026 Owens Corning. The color PINK is a registered trademark of Owens Corning. THE PINK PANTHER™ &amp; &copy; 1964–2026 Metro-Goldwyn-Mayer Studios Inc. All Rights Reserved.</p>',
    },
});

// ── Home Page ────────────────────────────────────────────────────────
const homePageKey = await createContent({
    contentType: 'OwensCorningHomePage',
    displayName: 'Owens Corning Home',
    properties: {
        HeroArea: [ref(heroKey)],
        MainContentArea: [
            ref(cardSetKey),
            ref(quickLinksKey),
            ref(attentionBarKey),
            ref(newsSectionKey),
        ],
        FooterArea: [ref(footerKey)],
        SeoSettings: {
            MetaTitle:
                'Roofing, Insulation, Composite Materials, and Doors | Owens Corning',
            MetaDescription:
                'Owens Corning has solutions for your building & remodeling needs. Browse through roofing products, insulation, shingles, asphalt, composites solutions, basement finishing & acoustic systems.',
        },
    },
});

console.log('');
console.log('Created OwensCorningHomePage:', homePageKey);
console.log('Container:', CONTAINER);
console.log('');
console.log('Open in CMS to publish, or check Optimizely Graph in ~30s.');
