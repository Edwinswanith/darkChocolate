// // src/api.js

// import OpenAI from 'openai';

// const openai = new OpenAI({ apiKey: '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', dangerouslyAllowBrowser: true });

// const getFunctionalitiesPrompt = (groupType, userPrompt) => `
// You are an experienced UI/UX designer. Based on the provided group type and user prompt, please provide a detailed list of functionalities that should be included within this group. The functionalities should be practical and cover typical user needs for the specified group type. The user prompt is: "${userPrompt}"

// For example:
// - **Login**: User ID, Password, Login, Sign Up, Sign In, Forgot Password
// - **Dashboard**: View Reports, User Statistics, Notifications, Settings
// - **Attendance Management**: Clock In, Clock Out, View Attendance, Request Leave

// The output format must contain only one grouptype that is "${groupType}" not other types should be added. Please respond in the following JSON format:
// {
//   "groupType": "${groupType}",
//   "functionalities": [
//     "Functionality 1",
//     "Functionality 2",
//     "Functionality 3",
//     ...
//   ]
// }
// `;

// const fetchFunctionalities = async (groupType, userPrompt) => {
//   try {
//     const prompt = getFunctionalitiesPrompt(groupType, userPrompt);

//     const completion = await openai.chat.completions.create({
//       messages: [
//         { role: "system", content: "You are a knowledgeable assistant that provides detailed user flow functionalities." },
//         { role: "user", content: prompt }
//       ],
//       model: "gpt-4o",
//     });

//     const responseContent = completion.choices[0].message.content;

//     console.log(`Raw response for ${groupType}:`, responseContent);

//     const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

//     if (!jsonMatch) {
//       throw new Error(`No JSON found in the response for ${groupType}`);
//     }

//     const jsonString = jsonMatch[0];
//     const parsedResponse = JSON.parse(jsonString);

//     if (parsedResponse.groupType !== groupType) {
//       throw new Error(`Unexpected groupType in response for ${groupType}`);
//     }

//     const functionalities = parsedResponse.functionalities;

//     return functionalities;
//   } catch (error) {
//     console.error(`Error fetching functionalities for ${groupType}:`, error);
//     return [];
//   }
// };

// export { fetchFunctionalities };


// src/api.js

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: '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', dangerouslyAllowBrowser: true });

const getFunctionalitiesPrompt = (groupType, userPrompt, formattedQA) => `
You are an experienced UI/UX designer. Based on the provided group type, user prompt, and additional user answers.
 please provide a more relavent list of functionalities that should be included within this group. 
 The functionalities should be practical and cover typical user needs for the specified group type.
 Make sure the funtionalities are based on user's prompt and user's answer. 
 Keep the funtionalities minimalistic and prioritize it based on the user's prompt and user's answer.

User prompt: "${userPrompt}"
Additional user answers provided by the user:
${formattedQA}

For example:
- **Login**: User ID, Password, Login, Sign Up, Sign In, Forgot Password
- **Dashboard**: View Reports, User Statistics, Notifications, Settings
- **Attendance Management**: Clock In, Clock Out, View Attendance, Request Leave

The output format must contain only one grouptype that is "${groupType}" not other types should be added. Please respond in the following JSON format:
{
  "groupType": "${groupType}",
  "functionalities": [
    "Functionality 1",
    "Functionality 2",
    "Functionality 3",
    ...
  ]
}
`;

const fetchFunctionalities = async (groupType, userPrompt, formattedQA) => {
  try {
    const prompt = getFunctionalitiesPrompt(groupType, userPrompt, formattedQA);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a knowledgeable assistant that provides detailed user flow functionalities." },
        { role: "user", content: prompt }
      ],
      model: "gpt-4o",
    });

    const responseContent = completion.choices[0].message.content;

    console.log(`Raw response for ${groupType}:`, responseContent);

    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error(`No JSON found in the response for ${groupType}`);
    }

    const jsonString = jsonMatch[0];
    const parsedResponse = JSON.parse(jsonString);

    if (parsedResponse.groupType !== groupType) {
      throw new Error(`Unexpected groupType in response for ${groupType}`);
    }

    const functionalities = parsedResponse.functionalities;

    return functionalities;
  } catch (error) {
    console.error(`Error fetching functionalities for ${groupType}:`, error);
    return [];
  }
};

export { fetchFunctionalities };