import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const GTMPageView = () => {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
};

export default GTMPageView;
