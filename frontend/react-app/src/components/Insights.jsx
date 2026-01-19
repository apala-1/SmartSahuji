import { useEffect, useState } from "react";
import { fetchInsights } from "../services/insights";

export default function Insights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchInsights()
      .then(setInsights)
      .catch(err => console.error(err));
  }, []);

  if (!insights) return <p>Loading…</p>;

  return (
    <div>
      <h2>Insights</h2>
      <p>Total Sales: Rs {insights.total_sales}</p>
      <p>Top Product: {insights.top_product}</p>
      <p>Top Category: {insights.top_category}</p>
      <p>{insights.summary}</p>
    </div>
  );
}
