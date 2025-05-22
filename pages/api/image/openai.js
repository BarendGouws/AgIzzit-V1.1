// pages/api/image.js
import fs from "fs";
import path from "path";
import axios from "axios";
import sharp from "sharp";
import OpenAI, { toFile } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    // 1) Download the image via axios
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const imgBuffer = Buffer.from(response.data);

    // 2) Get dimensions and build a full-coverage white RGBA mask with sharp
    const { width, height } = await sharp(imgBuffer).metadata();
    const maskBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .png()
      .toBuffer();

    // 3) Wrap buffers as “files” for the SDK
    const imageFile = await toFile(imgBuffer, "image.png", { type: "image/png" });
    const maskFile  = await toFile(maskBuffer, "mask.png",  { type: "image/png" });

    // 4) Single edit call: remove background + enhance
    const editResp = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      mask: maskFile,
      prompt: "Remove only the background and make it fully transparent. Keep the foreground object exactly as it is, preserving all original details, colors, logos, reflections, and textures. Do not alter the subject.",
      n: 1,
      size: "auto"
    });

    // 5) Decode the base64 and save it
    const output = Buffer.from(editResp.data[0].b64_json, "base64");
    const outDir  = path.join(process.cwd(), "public", "openai");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const fileName = `image-${Date.now()}.png`;
    fs.writeFileSync(path.join(outDir, fileName), output);

    // 6) Return the public URL
    return res.status(200).json({
      success: true,
      url: `/openai/${fileName}`,
      usage: editResp.usage,
    });
  } catch (err) {
    console.error("🚨 /api/image error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
