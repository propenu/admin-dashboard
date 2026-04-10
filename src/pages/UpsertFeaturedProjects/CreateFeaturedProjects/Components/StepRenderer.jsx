import React from "react";
import BasicStep from "../Steps/BasicStep";
import HeroStep from "../Steps/HeroStep";
import BHKStep from "../Steps/BHKStep";
import AmenitiesStep from "../Steps/AmenitiesStep";
import GalleryStep from "../Steps/GalleryStep";
import AboutStep from "../Steps/AboutStep";
import LocationStep from "../Steps/LocationStep";
import PropertyProfilesStep from "../Steps/PropertyProfilesStep";
import SEOStep from "../Steps/SEOStep";

export const StepRenderer = ({ step, refs, payload, update, replace }) => {
  const map = {
    basic: <BasicStep ref={refs.basic} payload={payload} update={update} />,
    hero: (
      <HeroStep
        ref={refs.hero}
        payload={payload}
        update={update}
        replace={replace}
      />
    ),
    bhk: (
      <BHKStep
        ref={refs.bhk}
        payload={payload}
        update={update}
        replace={replace}
      />
    ),
    amenities: (
      <AmenitiesStep ref={refs.amenities} payload={payload} update={update} />
    ),
    gallery: (
      <GalleryStep ref={refs.gallery} payload={payload} update={update} />
    ),
    about: <AboutStep ref={refs.about} payload={payload} update={update} />,
    location: (
      <LocationStep ref={refs.location} payload={payload} update={update} />
    ),
    propertyProfiles: (
      <PropertyProfilesStep
        ref={refs.propertyProfiles}
        payload={payload}
        update={update}
      />
    ),
    seo: <SEOStep ref={refs.seo} payload={payload} update={update} />,
  };

  return map[step];
};
