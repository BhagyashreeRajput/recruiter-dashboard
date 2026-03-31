import { useSearchParams } from "react-router-dom";

export default function useMappingQuery() {
  const [params, setParams] = useSearchParams();

  const get = (key, defaultValue = "") => {
    return params.get(key) || defaultValue;
  };

  const set = (newParams) => {
    const updated = new URLSearchParams(params);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });

    setParams(updated);
  };

  return { get, set, params };
}