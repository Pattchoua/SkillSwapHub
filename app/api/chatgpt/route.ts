import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { question } = await request.json();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are ChatGPT, a highly knowledgeable assistant. Provide detailed and accurate information in response to questions.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
      }),
    });

    const responseData = await response.json();
    //const reply = responseData.choices[0].message.content;
    if (responseData.choices && responseData.choices.length > 0) {
      const reply = responseData.choices[0].message.content;
      return NextResponse.json({ reply });
    } else {
      return NextResponse.json({ error: "No AI response received" });
    }

    // return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
};
