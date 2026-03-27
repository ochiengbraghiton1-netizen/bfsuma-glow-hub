import { useParams, Navigate } from "react-router-dom";
import { getLocationBySlug } from "@/config/locations";
import LocationPage from "@/components/LocationPage";

const LocationLanding = () => {
  const { city } = useParams<{ city: string }>();
  const location = city ? getLocationBySlug(city) : undefined;

  if (!location) return <Navigate to="/not-found" replace />;

  return <LocationPage location={location} />;
};

export default LocationLanding;
