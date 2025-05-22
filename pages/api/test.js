import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    let year = 2010;
    let make = "Toyota";
    let model = "Corolla";
    let variant = "1.8L SE";

    if (!year || !make || !model || !variant) {
      return res.status(400).json({
        error: "Please provide year, make, model, and variant parameters.",
      });
    }

    // Construct a prompt that instructs GPT to return the requested data in JSON.
    const prompt = `
    You are an automotive expert. I have a vehicle described by the following parameters:
    - Year: ${year}
    - Make: ${make}
    - Model: ${model}
    - Variant: ${variant}

    Please provide the following details in a structured JSON format. The JSON should have the following structure:

    {
    "General": {
        "introduction_date": "",
        "end_date": "",
        "service_interval_distance": ""
    },
    "Engine": {
        "engine_position": "",
        "engine_capacity_litre": "",
        "fuel_type": "",
        "fuel_capacity": "",
        "fuel_consumption": "",
        "fuel_range_average": "",
        "power_maximum": "",
        "torque_maximum": "",
        "acceleration_0_100_km_h": "",
        "maximum_speed": "",
        "co2_emissions": ""
    }
    }

    Be as accurate as possible. If you are unsure, give a best estimate or leave the field blank.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are a helpful assistant knowledgeable about automotive specifications." },
        { role: "user", content: prompt },
      ],
      temperature: 0, // for more factual responses
    });

    console.log(response.choices[0].message.content);

    const content = response.choices[0].message.content

    // Attempt to parse the returned string as JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      // If parsing fails, just return the raw response
      data = { raw_response: content };
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
