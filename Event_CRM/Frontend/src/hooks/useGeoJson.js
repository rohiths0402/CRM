import { useEffect, useState } from "react";

const cache = new Map();

export const useGeoJson = (url) => {
  const [state, setState] = useState({ url: null, data: null, error: "" });

  useEffect(() => {
    if (!url) return;
    if (cache.has(url)) {
      setState({ url, data: cache.get(url), error: "" });
      return;
    }

    let cancelled = false;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Map data could not be loaded");
        return response.json();
      })
      .then((data) => {
        cache.set(url, data);
        if (!cancelled) setState({ url, data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState({ url, data: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const ready = state.url === url;
  const data = ready ? state.data : null;
  const error = ready ? state.error : "";

  return { data, error, loading: Boolean(url) && !data && !error };
};
