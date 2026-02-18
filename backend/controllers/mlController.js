import axios from 'axios';
import User from '../models/User.js';

// @desc    Chat with AI Health Assistant
// @route   POST /api/ml/chat
// @access  Private
export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                success: false,
                error: 'AI Services currently offline. Verification required.'
            });
        }

        // Fetch user data for personalization
        const user = await User.findById(req.user.id);
        const patientName = user.fullName;
        const vitals = user.metadata || {};
        const weight = vitals.weight || 'N/A';
        const bp = vitals.bp || 'N/A';

        const systemPrompt = `You are a specialized CareAI health assistant for the CareSync platform. 
        You are assisting patient ${patientName}. 
        Current Vitals: Weight: ${weight}, Blood Pressure: ${bp}.
        Use this data if relevant to provide precise, professional clinical observations.
        Maintain a formal, helpful, and scientific tone. 
        Always include a disclaimer that you are an AI and critical health decisions should be verified with their primary clinician.`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1024
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;

        res.status(200).json({
            success: true,
            data: {
                reply,
                sender: 'ai',
                timestamp: new Date()
            }
        });
    } catch (err) {
        console.error('AI Chat Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, error: 'Neural link synchronization failed.' });
    }
};
