import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
// Nginx est le seul reverse proxy devant ce serveur : les en-têtes X-Forwarded-*
// qu'il ajoute (Host, For, Proto) sont fiables.
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: true });

const SITE_URL = 'https://firdawsitech.sn';
const API_BASE_URL = process.env['API_BASE_URL'] || 'https://api.firdawsitech.sn/api/v1';

interface SitemapProduct {
  slug: string;
  updatedAt?: string;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Sitemap généré dynamiquement (page d'accueil, boutique, et une entrée par
 * produit publié) afin que les nouveaux produits soient référencés sans
 * nécessiter un nouveau build/déploiement.
 */
app.get('/sitemap.xml', async (req, res) => {
  const staticUrls: Array<{ loc: string; changefreq: string; priority: string }> = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/boutique`, changefreq: 'daily', priority: '0.9' },
  ];

  let products: SitemapProduct[] = [];
  try {
    const response = await fetch(`${API_BASE_URL}/vitrine/all`);
    if (response.ok) {
      products = (await response.json()) as SitemapProduct[];
    }
  } catch {
    // En cas d'échec de l'API, on renvoie quand même le sitemap statique.
  }

  const productEntries = products.map((p) => {
    const lastmod = p.updatedAt ? p.updatedAt.substring(0, 10) : undefined;
    return `  <url>\n    <loc>${xmlEscape(`${SITE_URL}/boutique/${p.slug}`)}</loc>\n${
      lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''
    }    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  const staticEntries = staticUrls.map(
    (u) =>
      `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticEntries,
    ...productEntries,
  ].join('\n')}\n</urlset>\n`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
