import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAnalyticsEvent } from '../lib/firebase.js';

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackAnalyticsEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`
    });
  }, [location.pathname, location.search]);

  return null;
};
