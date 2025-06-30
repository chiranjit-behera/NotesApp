const axios = require("axios");

const GeminiClient = {
  getSummary: async (content) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    console.log("content: ", content);
    

    const body = {
      contents: [{ parts: [{ text: `Summarize this: ${content}` }] }]
    };

    const res = await axios.post(`${url}?key=${apiKey}`, body);

    console.log(res.data.candidates[0].content.parts[0].text);
    
    return res.data.candidates[0].content.parts[0].text;
  }
};

module.exports = { GeminiClient };
