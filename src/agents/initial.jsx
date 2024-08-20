import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import '../css/styles.css';  // Import the CSS file for styling
import logo from '../images/logo_bizzzup.png';

// Initialize OpenAI (assuming you've set up environment variables for the API key)
const openai = new OpenAI({
     apiKey: "",
     dangerouslyAllowBrowser: true
  });

const Initial = () => {
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const messages = [
      {
        role: "system",
        content: "You are a wise person who is experienced in the business ecosystem. Based on the user's input, help us understand the user's motive. "
                 + "Provide the output in a JSON format where the questions will be the keys and the options will be the values. No other additional information should be present in the output other than JSON. "
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
        model: "gpt-4",
      });

      const responseContent = completion.choices[0].message.content;
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }
      const jsonString = jsonMatch[0];
      const responseData = JSON.parse(jsonString);

      const questionsArray = Object.entries(responseData).map(([question, options]) => ({
        question,
        options
      }));

      if (questionsArray.length > 0) {
        setQuestions(questionsArray);
        setShowQuestions(true);
      } else {
        throw new Error('Invalid JSON structure: questions not found or not an array');
      }
    } catch (error) {
      console.error('Error during API call or parsing:', error);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClick = (answer) => {
    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 header">
          <img src={logo} alt="Company Logo" className="mx-auto mb-4" style={{ maxWidth: '200px' }} />
          <h1 className="text-3xl font-bold text-white">Business Insight Generator</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!showQuestions && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your business idea or challenge..."
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </form>
        )}

        {showQuestions && currentQuestionIndex < questions.length && (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 progress-bar">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-in-out progress-bar-inner"
                style={{ width: `${progress}%` }}
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">{questions[currentQuestionIndex].question}</h2>
            <div className="space-y-2">
              {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswerClick(`${key}. ${value}`)}
                  className="w-full text-left p-3 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 option-card"
                >
                  <span className="font-semibold">{key}.</span> {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {showQuestions && currentQuestionIndex >= questions.length && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Thank you for your responses!</h2>
            <button
              onClick={restart}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold mx-auto"
            >
              Submit Another Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Initial;
