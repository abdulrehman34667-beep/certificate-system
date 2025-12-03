import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const filePath = path.join(process.cwd(), "api", "admin.json");
  const adminData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const { username, password } = req.body;

  if (username === adminData.username && password === adminData.password) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: "Invalid admin credentials" });
}
