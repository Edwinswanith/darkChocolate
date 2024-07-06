// // src/initial.jsx

// import React, { useState } from 'react';
// import OpenAI from 'openai';
// import './initial.css';  // Import the CSS file for styling
// import logo from './images/logo_bizzzup.png';

// // Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: "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",
//   dangerouslyAllowBrowser: true
// });

// const PromptInput = () => {
//   const [prompt, setPrompt] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [showQuestions, setShowQuestions] = useState(false);
  

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     console.log('Form submitted');

//     const messages = [
//       {
//         role: "system",
//         content: "You are a wise assistant. Based on the user's input, help us understand the user's motive. "
//                  + "Provide the output in a JSON format where the questions will be the keys and the options will be the values.No other additional information should be present "
//                  + "Ask a series of questions (maximum of 5) and provide options a, b, c, d, and e. The user can manually enter their response if needed."
//       },
//       {
//         role: "user",
//         content: `User input: ${prompt}`
//       }
//     ];

//     try {
//       const completion = await openai.chat.completions.create({
//         messages: messages,
//         model: "gpt-4o",
//       });

//       const responseContent = completion.choices[0].message.content;

//       // Log the raw response content
//       console.log('Raw API response content:', responseContent);

//       // Extract JSON part from the response
//       const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) {
//         throw new Error('No JSON found in the response');
//       }
//       const jsonString = jsonMatch[0];

//       // Parse the JSON string
//       let responseData;
//       try {
//         responseData = JSON.parse(jsonString);
//         console.log('Parsed JSON response:', responseData);
//       } catch (e) {
//         console.error('Error parsing JSON:', e);
//         return;
//       }

//       // Convert the JSON structure to an array of questions
//       const questionsArray = Object.entries(responseData).map(([question, options]) => ({
//         question,
//         options
//       }));

//       // Ensure the questions array is properly initialized
//       if (questionsArray.length > 0) {
//         setQuestions(questionsArray);
//         setShowQuestions(true);
//       } else {
//         throw new Error('Invalid JSON structure: questions not found or not an array');
//       }
//     } catch (error) {
//       console.error('Error during API call or parsing:', error);
//     }
//   };

//   const handleAnswerClick = (answer) => {
//     setUserAnswers([...userAnswers, answer]);
//     setCurrentQuestionIndex(currentQuestionIndex + 1);
//   };

//   const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

//   const restart = () => {
//     setPrompt('');
//     setQuestions([]);
//     setCurrentQuestionIndex(0);
//     setUserAnswers([]);
//     setShowQuestions(false);
//   };

//   return (
//     <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
//       <div className="header">
//         <img src={logo} alt="Company Logo" className="logo" />
//         <h1 style={{ color: '#0000ff' }}>Enter a Prompt</h1>
//       </div>
//       {!showQuestions && (
//         <form onSubmit={handleSubmit}>
//           <textarea
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             rows="10"
//             cols="50"
//           />
//           <br />
//           <button type="submit">Submit</button>
//         </form>
//       )}
//       {showQuestions && currentQuestionIndex < questions.length && (
//         <div>
//           <div className="progress-bar">
//             <div className="progress" style={{ width: `${progress}%` }}></div>
//           </div>
//           <div className="question-section">
//             <p>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</p>
//             {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
//               <button key={key} onClick={() => handleAnswerClick(`${key}. ${value}`)}>
//                 {key}. {value}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//       {showQuestions && currentQuestionIndex >= questions.length && (
//         <div>
//           <h2>Thank you for your responses!</h2>
//           <button onClick={restart}>Submit Another Prompt</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Initial;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import '../css/styles.css';  // Import the CSS file for styling
import logo from '../images/logo_bizzzup.png';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

const Initial = () => {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const navigate = useNavigate();  // Initialize navigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted');

    const messages = [
      {
        role: "system",
        content: "You are a wise person who is experienced in the business ecosystem. Based on the user's input, help us understand the user's motive. "
                 + "Provide the output in a JSON format where the questions will be the keys and the options will be the values. No other additional information should be present in the output other then json "
                 + "Ask a series of questions (maximum of 5) and provide options a, b, c, d, and e. The user can manually enter their response if needed."
      },
      {
        role: "user",
        content: `User input: ${prompt}`
      }
    ];

    try {
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4o",
      });

      const responseContent = completion.choices[0].message.content;

      // Log the raw response content
      console.log('Raw API response content:', responseContent);

      // Extract JSON part from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }
      const jsonString = jsonMatch[0];

      // Parse the JSON string
      let responseData;
      try {
        responseData = JSON.parse(jsonString);
        console.log('Parsed JSON response:', responseData);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return;
      }

      // Convert the JSON structure to an array of questions
      const questionsArray = Object.entries(responseData).map(([question, options]) => ({
        question,
        options
      }));

      // Ensure the questions array is properly initialized
      if (questionsArray.length > 0) {
        setQuestions(questionsArray);
        setShowQuestions(true);
      } else {
        throw new Error('Invalid JSON structure: questions not found or not an array');
      }
    } catch (error) {
      console.error('Error during API call or parsing:', error);
    }
  };

  const handleAnswerClick = (answer) => {
    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Navigate to PromptInput with the answers
      navigate('/promptinput', { state: { prompt, questions, userAnswers: updatedAnswers } });
    }
  };

  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

  const restart = () => {
    setPrompt('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowQuestions(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
      <div className="header">
        <img src={logo} alt="Company Logo" className="logo" />
        <h1 style={{ color: '#0000ff' }}>Enter a Prompt</h1>
      </div>
      {!showQuestions && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows="10"
            cols="50"
          />
          <br />
          <button type="submit">Submit</button>
        </form>
      )}
      {showQuestions && currentQuestionIndex < questions.length && (
        <div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="question-section">
            <p>{`${questions[currentQuestionIndex].question}`}</p>
            {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
              <button key={key} onClick={() => handleAnswerClick(`${key}. ${value}`)}>
                {key}. {value}
              </button>
            ))}
          </div>
        </div>
      )}
      {showQuestions && currentQuestionIndex >= questions.length && (
        <div>
          <h2>Thank you for your responses!</h2>
          <button onClick={restart}>Submit Another Prompt</button>
        </div>
      )}
    </div>
  );
};

export default Initial;