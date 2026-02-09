import axios from "axios";

export const fetchInsights = async () => {
  const res = await axios.get("http://localhost:5000/api/insights", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  return res.data;
};
