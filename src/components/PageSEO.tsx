import { Helmet } from "react-helmet-async";

const SITE_URL = "https://bfsumaroyal.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

const PageSEO = ({ title, description, path, ogImage, ogType = "website", noindex }: PageSEOProps) => {
  const url = `${SITE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BF SUMA Royal" />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default PageSEO;
