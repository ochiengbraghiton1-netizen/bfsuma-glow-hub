import { useParams } from "react-router-dom";
import { getLocationBySlug } from "@/config/locations";
import LocationPage from "@/components/LocationPage";
import NotFound from "@/pages/NotFound";

const LocationLanding = () => {
  const { city } = useParams<{ city: string }>();
  const location = city ? getLocationBySlug(city) : undefined;

  if (!location) return <NotFound />;

  return <LocationPage location={location} />;
};

export default LocationLanding;
