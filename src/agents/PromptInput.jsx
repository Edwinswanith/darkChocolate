import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: , dangerouslyAllowBrowser: true });

const jsonExample = {
  "nodes": [
    { "id": "a", "type": "input", "data": { "label": "wire" } },
    { "id": "b", "type": "position-logger", "data": { "label": "drag me!" } },
    { "id": "c", "data": { "label": "your ideas" } },
    { "id": "d", "type": "output", "data": { "label": "with React Flow" } }
  ],
  "edges": [
    { "id": "a->c", "source": "a", "target": "c", "animated": true },
    { "id": "b->d", "source": "b", "target": "d" },
    { "id": "c->d", "source": "c", "target": "d", "animated": true }
  ]
};

const PromptInput = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt, questions, userAnswers } = location.state || { prompt: '', questions: [], userAnswers: [] };

  const [userFlowPrompt, setUserFlowPrompt] = useState('');

  useEffect(() => {
    // Combine user answers into a refined prompt
    const refinedPrompt = `User provided the following answers: ${userAnswers.join(', ')}. Based on these, generate a detailed user flow.`;
    setUserFlowPrompt(refinedPrompt);
    console.log('Prompt:', prompt);
    console.log('Questions:', questions);
    console.log('User Answers:', userAnswers);
  }, [prompt, questions, userAnswers]);

  const formatQuestionsAndAnswers = () => {
    return questions.map((q, i) => `${q.question} ${userAnswers[i]}`).join('\n');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted');

    const formattedQA = formatQuestionsAndAnswers();
    console.log('Formatted Questions and Answers:', formattedQA);

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a senior UI/UX designer based on the user prompt: "${prompt}". '
            'The user was asked a series of questions and provided the following answers:\n${formattedQA}\n You will provide a detailed user flow.`
          },
          {
            role: "user",
            content: `${userFlowPrompt}. Please provide the response in the following JSON format for nodes and edges: ${JSON.stringify(jsonExample, null, 2)}. Ensure there is no overlap between the nodes and the edges are neatly placed.`
          }
        ],
        model: "gpt-4o",
      });

      console.log('API response received', completion);

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
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return;
      }

      const { nodes, edges } = responseData;

      // Ensure nodes have a position if not specified
      const initializedNodes = nodes.map((node, index) => ({
        ...node,
        position: node.position || { x: 100 * index, y: 100 * index },
        draggable: true
      }));

      console.log('Nodes:', initializedNodes);
      console.log('Edges:', edges);

      navigate('/display', { state: { nodes: initializedNodes, edges, formattedQA } }); // Pass formattedQA as part of the state
    } catch (error) {
      console.error('Error during API call or navigation:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
      <h1 style={{ color: '#0000ff' }}>Refined Prompt</h1>
      <p>{userFlowPrompt}</p>
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PromptInput;
