export async function sendOBDData(payload) {
  const res = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload })
  });

  if (!res.ok) {
    throw new Error("API error: " + res.status);
  }

  return res.json();
}
