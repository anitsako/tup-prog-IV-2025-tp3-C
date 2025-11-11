const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function token() {
  try { return localStorage.getItem("token") || ""; } catch { return ""; }
}

async function handle(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.errors?.length) msg = data.errors.map(e => e.msg).join(" · ");
      else if (data?.message) msg = data.message;
    } catch {}
    if (res.status === 401) {
      localStorage.removeItem("token");
    }
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return {}; }
}

export default {
  async get(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token() ? `Bearer ${token()}` : undefined,
      },
    });
    return handle(res);
  },
  async post(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token() ? `Bearer ${token()}` : undefined,
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  },
  async put(path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token() ? `Bearer ${token()}` : undefined,
      },
      body: JSON.stringify(body),
    });
    return handle(res);
  },
  async del(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token() ? `Bearer ${token()}` : undefined,
      },
    });
    return handle(res);
  },
};
