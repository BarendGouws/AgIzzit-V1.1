import axios from 'axios';
import * as cheerio from "cheerio";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function verifyWebsite (url) { console.log("verifyWebsite -> url", url)

  if (!url) {
    return { success: false, message: "url are required." };
  }

  try {
    // Fetch and parse the webpage
    const fetchPage = async (pageUrl) => {
      const { data: pageHtml } = await axios.get(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      return cheerio.load(pageHtml);
    };

    const $ = await fetchPage(url);

    // Extract title
    const title = $('title').text() || null;

    // Extract meta tags
    const metaTags = {};
    $('meta').each((_, element) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    // Extract primary color
    const colorOccurrences = {};
    $('[style*="color"]').each((_, el) => {
      const style = $(el).attr('style');
      const colorMatch = style.match(/color:\s*([^;]+)/);
      if (colorMatch) {
        const color = colorMatch[1].trim();
        colorOccurrences[color] = (colorOccurrences[color] || 0) + 1;
      }
    });
    const primaryColor = Object.keys(colorOccurrences).reduce((a, b) =>
      colorOccurrences[a] > colorOccurrences[b] ? a : b,
      null
    );

    // Extract unique URLs
    const urls = [];
    $('[href], [src], [data-src]').each((_, element) => {
      const href = $(element).attr('href') || $(element).attr('src') || $(element).attr('data-src');
      if (href && !href.startsWith('data:') && !href.endsWith('.js') && !href.endsWith('.css') && !href.startsWith('javascript:void(0)')) {
        const absoluteUrl = href.startsWith('http') ? href : new URL(href, url).href;
        urls.push(absoluteUrl);
      }
    });
    const uniqueUrls = [...new Set(urls)];

    // Generate a prompt for OpenAI
    const prompt = `
      Return a JSON object with the following fields extracted from the website:
      - primaryColor: String (Extract hex code of the primary color from the website)
      - logoUrl: String (Extract url with logo from uniqueUrls)
      - facebookPageUrl: String (Extract Facebook page URL, format correctly, e.g., https://www.facebook.com/username/)
      - instagramPageUrl: String (Extract Instagram page URL)
      - twitterPageUrl: String (Extract Twitter or X.com page URL)
      - tiktokPageUrl: String (Extract TikTok page URL)
      - youtubePageUrl: String (Extract YouTube page URL)
      - aboutUs: String (Generate an About Us based on the website content)
      - whyChooseUs: String (Generate a Why Choose Us based on the website content)
      - description: String (Generate a new description based on the website content)
      - tradingName: String (Extract trading name from title or metaTags)

      Data:
      Title: ${title}
      Meta Tags: ${JSON.stringify(metaTags, null, 2)}
      Primary Color: ${primaryColor}
      URLs: ${JSON.stringify(uniqueUrls, null, 2)}

      ONLY return a JSON object. Do not include any additional explanation or text.
    `;

    // Call OpenAI API
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });

    const chatContent = chatResponse.choices[0].message.content.trim();

    // Parse JSON from OpenAI response
    let extractedData;
    try {
      extractedData = JSON.parse(chatContent);
    } catch (error) {
      console.error('Raw ChatGPT Response:', chatContent);
      throw new Error('Failed to parse ChatGPT response as JSON. Ensure the prompt is producing valid JSON.');
    }

    extractedData.success = true;
    extractedData.facebookPageUrl.toString().toLowerCase().includes("facebook.com") ? extractedData.facebookPageUrl = extractedData.facebookPageUrl : extractedData.facebookPageUrl = "";
    extractedData.instagramPageUrl.toString().toLowerCase().includes("instagram.com") ? extractedData.instagramPageUrl = extractedData.instagramPageUrl : extractedData.instagramPageUrl = "";
    extractedData.twitterPageUrl.toString().toLowerCase().includes("twitter.com") || extractedData.twitterPageUrl.toString().toLowerCase().includes("x.com") ? extractedData.twitterPageUrl = extractedData.twitterPageUrl : extractedData.twitterPageUrl = "";
    extractedData.tiktokPageUrl.toString().toLowerCase().includes("tiktok.com") ? extractedData.tiktokPageUrl = extractedData.tiktokPageUrl : extractedData.tiktokPageUrl = "";
    extractedData.youtubePageUrl.toString().toLowerCase().includes("youtube.com") ? extractedData.youtubePageUrl = extractedData.youtubePageUrl : extractedData.youtubePageUrl = "";
    
    return extractedData;

  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: "An error occurred while verifying the website." };
  }
};
