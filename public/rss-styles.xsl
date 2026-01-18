<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" doctype-system="about:legacy-compat" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f8f8;
            color: #333;
            line-height: 1.6;
            padding: 4rem 2rem;
            min-height: 100vh;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
          }

          /* Header - clean and minimal */
          .header {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid rgba(255, 107, 107, 0.15);
          }

          .header h1 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
            line-height: 1.2;
            color: #333;
          }

          .header p {
            color: #666;
            font-size: 1.125rem;
            line-height: 1.625;
            font-style: italic;
            border-left: 3px solid #ff6b6b;
            padding-left: 1rem;
          }

          /* RSS Badge - matching site badges */
          .rss-badge {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 0.25rem 0.75rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 1rem;
            border: 2px solid #333;
            box-shadow: 2px 2px 0px #4ecdc4;
          }

          /* Subscribe note */
          .subscribe-note {
            background: white;
            color: #333;
            padding: 1rem 1.25rem;
            margin-bottom: 2rem;
            border: 2px solid #ff6b6b;
            box-shadow: 4px 4px 0px #4ecdc4;
            font-size: 0.9rem;
          }

          .subscribe-note a {
            color: #ff6b6b;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .subscribe-note a:hover {
            color: #4ecdc4;
          }

          /* Section heading - matches blog page */
          .section-heading {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            font-weight: 500;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 1.5rem 0;
          }

          /* Posts container */
          .posts {
            display: flex;
            flex-direction: column;
            gap: 3rem;
          }

          /* Post card - flat style like blog */
          .post {
            background: white;
            padding: 2rem;
            border-bottom: 2px solid rgba(255, 107, 107, 0.15);
          }

          .post:last-child {
            border-bottom: none;
          }

          /* Post date */
          .post-date {
            display: block;
            color: #666;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            font-weight: 500;
            letter-spacing: 0.02em;
            margin-bottom: 0.5rem;
          }

          /* Post title */
          .post-title {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.25;
            letter-spacing: -0.02em;
          }

          .post-title a {
            color: #333;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .post-title a:hover {
            color: #ff6b6b;
          }

          /* Post description */
          .post-description {
            font-size: 1rem;
            color: #444;
            line-height: 1.625;
            margin-bottom: 1rem;
          }

          /* Categories/tags - matching site badges */
          .post-categories {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .category {
            display: inline-flex;
            align-items: center;
            background: #ff6b6b;
            color: white;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            border-radius: 4px;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }

          .category:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          /* Footer */
          .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 2px solid rgba(255, 107, 107, 0.15);
            text-align: center;
          }

          .footer p {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            color: #666;
          }

          .footer a {
            color: #ff6b6b;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .footer a:hover {
            color: #4ecdc4;
          }

          /* Responsive */
          @media (max-width: 640px) {
            body {
              padding: 2rem 1rem;
            }

            .header h1 {
              font-size: 1.75rem;
            }

            .header p {
              font-size: 1rem;
            }

            .post {
              padding: 1.5rem;
            }

            .post-title {
              font-size: 1.35rem;
            }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            * {
              transition: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <div class="rss-badge">RSS Feed</div>
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
          </header>

          <div class="subscribe-note">
            This is an RSS feed. Copy this URL into your RSS reader to subscribe, or <a href="/">visit the website</a>.
          </div>

          <h2 class="section-heading">recent posts</h2>

          <main class="posts">
            <xsl:for-each select="/rss/channel/item">
              <article class="post">
                <time class="post-date">
                  <xsl:value-of select="substring(pubDate, 9, 3)"/>
                  <xsl:text> </xsl:text>
                  <xsl:value-of select="substring(pubDate, 6, 2)"/>, <xsl:value-of select="substring(pubDate, 13, 4)"/>
                </time>
                <h3 class="post-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                <p class="post-description">
                  <xsl:value-of select="description"/>
                </p>
                <xsl:if test="category">
                  <div class="post-categories">
                    <xsl:for-each select="category">
                      <span class="category">#<xsl:value-of select="."/></span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </article>
            </xsl:for-each>
          </main>

          <footer class="footer">
            <p>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="/rss/channel/link"/>
                </xsl:attribute>
                <xsl:value-of select="/rss/channel/link"/>
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
