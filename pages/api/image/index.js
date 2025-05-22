// pages/api/image.js
import fs from "fs";
import path from "path";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { url } = req.body;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "Missing image URL in request body" });
  }

  try {
    // 1) Download the image
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const imgBuffer = Buffer.from(response.data);

    console.log("Buffer size:", imgBuffer.length); // should not be 0

    // 2) Send image buffer to rembg server running on localhost:5000
    const rembgResponse = await axios.request({
        method: "post",
        url: "http://localhost:7000/api/remove",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        data: imgBuffer,
        responseType: "arraybuffer"
      });
      
      
      
      

    // 3) Save the transparent image
    const output = Buffer.from(rembgResponse.data);
    const outDir = path.join(process.cwd(), "public", "rembg");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const fileName = `image-${Date.now()}.png`;
    fs.writeFileSync(path.join(outDir, fileName), output);

    // 4) Return the image URL
    return res.status(200).json({
      success: true,
      url: `/rembg/${fileName}`
    });
  } catch (err) {
    console.error("🚨 /api/image error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
