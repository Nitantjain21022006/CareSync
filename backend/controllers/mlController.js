// @desc    Chat with AI Health Assistant
// @route   POST /api/ml/chat
// @access  Private
export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        // Mocking AI Response for now
        // In a real scenario, this would call an external LLM or local model
        let response = "";
        const msg = message.toLowerCase();

        if (msg.includes('hello') || msg.includes('hi')) {
            response = "Hello! I'm your AI health assistant. How can I help you today?";
        } else if (msg.includes('headache')) {
            response = "I'm sorry you're feeling that way. A headache can be caused by many things like stress, dehydration, or lack of sleep. Make sure to drink water and rest. If it persists, please consult Dr. Sarah Johnson.";
        } else if (msg.includes('record') || msg.includes('report')) {
            response = "You can view your medical reports in the 'Medical Records' section of your dashboard. Would you like me to summarize your last report?";
        } else if (msg.includes('appointment')) {
            response = "To book an appointment, head over to the 'Appointments' section. You can choose a doctor and a convenient time slot there.";
        } else {
            response = "I understand. I'm analyzing your health data to provide the best advice. Please note that I am an AI and you should always verify critical information with a licensed medical professional.";
        }

        res.status(200).json({
            success: true,
            data: {
                reply: response,
                sender: 'ai',
                timestamp: new Date()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
