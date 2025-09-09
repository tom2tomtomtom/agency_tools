// AI Tool Recommendation Chat Widget
class ChatWidget {
    constructor() {
        // Check for API key in localStorage or global config
        this.apiKey = localStorage.getItem('openai_api_key') || this.getConfigKey();
        this.isOpen = false;
        this.departments = [
            'PR & Media Relations Team',
            'Behavioural Science Team',  
            'Events & Experiential Team',
            'Crisis Communications Team',
            'Brand Strategy Team',
            'Influencer & Partnership Team',
            'Government Relations Team',
            'Creative & Integrated Team',
            'Social & Content Team',
            'Leadership Team',
            'Client Experience Team',
            'Campaign Management Team',
            'Insights & Measurement Team',
            'Operations & Culture Team'
        ];
        
        this.departmentLinks = {
            'PR & Media Relations Team': 'pr-media-relations-team.html',
            'Behavioural Science Team': 'behavioural-science-team.html',
            'Events & Experiential Team': 'events-experiential-team.html',
            'Crisis Communications Team': 'crisis-communications-team.html',
            'Brand Strategy Team': 'brand-strategy-team.html',
            'Influencer & Partnership Team': 'influencer-partnership-team.html',
            'Government Relations Team': 'government-relations-team.html',
            'Creative & Integrated Team': 'creative-integrated-team.html',
            'Social & Content Team': 'social-content-team.html',
            'Leadership Team': 'leadership-team.html',
            'Client Experience Team': 'client-experience-team.html',
            'Campaign Management Team': 'campaign-management-team.html',
            'Insights & Measurement Team': 'insights-measurement-team.html',
            'Operations & Culture Team': 'operations-culture-team.html'
        };
        
        this.init();
    }
    
    getConfigKey() {
        // Load API key from global config if available
        return window.CONFIG?.OPENAI_API_KEY || null;
    }
    
    init() {
        this.bindEvents();
        this.updateUIState();
    }
    
    bindEvents() {
        const chatBubble = document.getElementById('chat-bubble');
        const chatClose = document.getElementById('chat-close');
        const chatSend = document.getElementById('chat-send');
        const chatInput = document.getElementById('chat-input');
        const apiKeySave = document.getElementById('api-key-save');
        const apiKeyInput = document.getElementById('api-key-input');
        
        chatBubble.addEventListener('click', () => this.toggleChat());
        chatClose.addEventListener('click', () => this.closeChat());
        chatSend.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        apiKeySave.addEventListener('click', () => this.saveApiKey());
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }
    
    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatBubble = document.getElementById('chat-bubble');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            chatWindow.classList.add('active');
            chatBubble.style.display = 'none';
            this.isOpen = true;
        }
    }
    
    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatBubble = document.getElementById('chat-bubble');
        
        chatWindow.classList.remove('active');
        chatBubble.style.display = 'flex';
        this.isOpen = false;
    }
    
    updateUIState() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        const apiKeySetup = document.querySelector('.api-key-setup');
        
        if (this.apiKey) {
            chatInput.disabled = false;
            chatSend.disabled = false;
            chatInput.placeholder = 'Describe your PR challenge...';
            apiKeySetup.classList.add('hidden');
        } else {
            chatInput.disabled = true;
            chatSend.disabled = true;
            chatInput.placeholder = 'Enter OpenAI API key first...';
            apiKeySetup.classList.remove('hidden');
        }
    }
    
    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key-input');
        const apiKey = apiKeyInput.value.trim();
        
        if (apiKey.startsWith('sk-') && apiKey.length > 20) {
            this.apiKey = apiKey;
            localStorage.setItem('openai_api_key', apiKey);
            apiKeyInput.value = '';
            this.updateUIState();
            this.addMessage('ai', '✅ API key saved! Now describe your PR or communications challenge and I\'ll recommend the perfect tools.');
        } else {
            this.addMessage('ai', '❌ Please enter a valid OpenAI API key (starts with "sk-")');
        }
    }
    
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message || !this.apiKey) return;
        
        // Add user message
        this.addMessage('user', message);
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const recommendation = await this.getRecommendation(message);
            this.hideTypingIndicator();
            this.addMessage('ai', recommendation);
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error getting recommendation:', error);
            this.addMessage('ai', '❌ Sorry, I couldn\'t process your request. Please check your API key and try again.');
        }
    }
    
    async getRecommendation(userMessage) {
        // Fallback recommendations for common scenarios
        const fallbackRecommendations = {
            'crisis': {
                departments: ['Crisis Communications Team', 'PR & Media Relations Team'],
                response: 'For crisis situations, I recommend starting with our Crisis Communications Team for immediate response planning and stakeholder messaging. The PR & Media Relations Team can help manage media coverage and journalist relationships during the crisis.'
            },
            'media': {
                departments: ['PR & Media Relations Team', 'Social & Content Team'],
                response: 'For media-related challenges, our PR & Media Relations Team has tools for media monitoring, journalist outreach, and press release optimization. The Social & Content Team can help extend your reach through digital channels.'
            },
            'government': {
                departments: ['Behavioural Science Team', 'Government Relations Team'],
                response: 'For government communications, the Behavioural Science Team specializes in behavior change campaigns and public health messaging. The Government Relations Team handles stakeholder mapping and policy communications.'
            },
            'event': {
                departments: ['Events & Experiential Team', 'Creative & Integrated Team'],
                response: 'For events and activations, our Events & Experiential Team has comprehensive tools for event planning and brand activations. The Creative & Integrated Team can help develop compelling campaign creative.'
            },
            'social': {
                departments: ['Social & Content Team', 'Influencer & Partnership Team'],
                response: 'For social media challenges, the Social & Content Team provides tools for content creation and digital campaigns. The Influencer & Partnership Team can help with influencer relations and collaboration management.'
            }
        };
        
        const prompt = `You are an AI assistant for a PR & Communications toolkit with 14 specialized departments and 70+ AI tools.

User Challenge: "${userMessage}"

Available Departments:
1. PR & Media Relations Team - Media monitoring, journalist outreach, press releases
2. Behavioural Science Team - Behavior change campaigns, government communications, research analysis
3. Events & Experiential Team - Event planning, brand activations, experiential marketing
4. Crisis Communications Team - Crisis response, reputation management, stakeholder messaging
5. Brand Strategy Team - Brand positioning, competitive analysis, brand architecture
6. Influencer & Partnership Team - Influencer relations, collaboration management, partnership strategy
7. Government Relations Team - Stakeholder mapping, policy communications, regulatory affairs
8. Creative & Integrated Team - Creative campaigns, integrated marketing, brand storytelling
9. Social & Content Team - Social media strategy, content creation, digital campaigns
10. Leadership Team - Strategic planning, executive communications, board presentations
11. Client Experience Team - Account management, client relations, project coordination
12. Campaign Management Team - Project planning, campaign execution, performance tracking
13. Insights & Measurement Team - Analytics, performance measurement, data analysis
14. Operations & Culture Team - Process optimization, team management, operational excellence

Instructions:
- If the user's challenge matches 1-3 departments, recommend those specific departments with brief explanations
- If no perfect match exists, provide a strategic approach using multiple departments
- Keep responses concise (2-3 sentences per recommendation)
- Focus on actionable advice
- End with "Click the department links below to access the specific AI tools!"

Format your response as natural conversation, not a list.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: prompt
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                // Check for specific error types
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your OpenAI API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again in a moment.');
                } else if (response.status >= 500) {
                    throw new Error('OpenAI service temporarily unavailable. Using fallback recommendations.');
                } else {
                    throw new Error(`API Error: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Unexpected API response format.');
            }
            
            let aiResponse = data.choices[0].message.content;
            
            // Extract department names and add clickable links
            const mentionedDepartments = this.departments.filter(dept => 
                aiResponse.toLowerCase().includes(dept.toLowerCase()) ||
                aiResponse.toLowerCase().includes(dept.split(' ')[0].toLowerCase())
            );
            
            if (mentionedDepartments.length > 0) {
                aiResponse += '\n\n' + this.createDepartmentLinks(mentionedDepartments);
            }
            
            return aiResponse;
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Use fallback recommendations
            const userMessageLower = userMessage.toLowerCase();
            for (const [keyword, fallback] of Object.entries(fallbackRecommendations)) {
                if (userMessageLower.includes(keyword)) {
                    return fallback.response + '\n\n' + this.createDepartmentLinks(fallback.departments);
                }
            }
            
            // Generic fallback
            return `I'm having trouble connecting to the AI service right now, but I can still help! Based on your message, you might want to explore these departments:

📊 **Insights & Measurement Team** - For data analysis and performance tracking
🎯 **Campaign Management Team** - For project planning and execution
👥 **Client Experience Team** - For stakeholder management and communication

Click the department links below to access specific AI tools!

${this.createDepartmentLinks(['Insights & Measurement Team', 'Campaign Management Team', 'Client Experience Team'])}`;
        }
    }
    
    createDepartmentLinks(departments) {
        const uniqueDepartments = [...new Set(departments)];
        const links = uniqueDepartments.map(dept => {
            const link = this.departmentLinks[dept];
            if (link) {
                return `<a href="${link}" class="tool-link" target="_blank">${dept}</a>`;
            }
            return null;
        }).filter(Boolean);
        
        return links.join('');
    }
    
    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.style.display = 'flex';
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.style.display = 'none';
    }
}

// Initialize the chat widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatWidget();
});

// Handle API key from URL parameter (for easy setup)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get('api_key');
    
    if (apiKey && apiKey.startsWith('sk-')) {
        localStorage.setItem('openai_api_key', apiKey);
        // Remove API key from URL for security
        const url = new URL(window.location);
        url.searchParams.delete('api_key');
        window.history.replaceState({}, document.title, url);
    }
});