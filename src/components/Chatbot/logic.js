import { SCHEMES } from './data';

export const INTENTS = {
    GREETING: 'greeting',
    SCHEME_SEARCH: 'scheme_search',
    ELIGIBILITY: 'eligibility',
    DOCUMENTS: 'documents',
    APPLICATION: 'application',
    BENEFITS: 'benefits',
    UNKNOWN: 'unknown',
    HELP: 'help'  // Added help intent
};

// Simple keyword matching for intents
const KEYWORDS = {
    [INTENTS.GREETING]: ['hi', 'hello', 'hey', 'start', 'good morning', 'good afternoon'],
    [INTENTS.HELP]: ['help', 'what can you do', 'capabilities', 'features'], // Explicit help intent
    [INTENTS.ELIGIBILITY]: ['eligible', 'eligibility', 'can i apply', 'who can apply', 'criteria', 'qualification'],
    [INTENTS.DOCUMENTS]: ['document', 'doc', 'paper', 'proof', 'what is needed', 'requirement'],
    [INTENTS.APPLICATION]: ['apply', 'application', 'register', 'how to', 'process', 'procedure', 'form'],
    [INTENTS.BENEFITS]: ['benefit', 'offer', 'amount', 'money', 'profit', 'what will i get', 'advantage'],
    [INTENTS.SCHEME_SEARCH]: ['scheme', 'yojana', 'program', 'find', 'search', 'list', 'show']
};

const DISCLAIMER_FOOTER = "\n\n_This information is for guidance purposes only. Please verify details on the official government website._";

const CAPABILITY_MESSAGE = "I can help you with:\n\n• **Scheme Search**: Find schemes for farmers, students, etc.\n• **Eligibility**: Check criteria for specific schemes.\n• **Documents**: List required proofs.\n• **Application Steps**: Guide you through the process.\n\nPlease choose one of these topics or ask about a specific scheme.";

/**
 * Detects the intent of the user message.
 */
const detectIntent = (text) => {
    const lowerText = text.toLowerCase();

    // Check key phrases for help explicitly
    if (KEYWORDS[INTENTS.HELP].some(word => lowerText.includes(word))) {
        return INTENTS.HELP;
    }

    for (const [intent, words] of Object.entries(KEYWORDS)) {
        if (words.some(word => lowerText.includes(word))) {
            return intent;
        }
    }
    return INTENTS.UNKNOWN;
};

/**
 * Tries to find if a scheme is mentioned in the text.
 */
const findScheme = (text) => {
    const lowerText = text.toLowerCase();
    return SCHEMES.find(scheme =>
        scheme.keywords.some(keyword => lowerText.includes(keyword)) ||
        lowerText.includes(scheme.name.toLowerCase())
    );
};

/**
 * Generates a response based on intent and context.
 */
export const processMessage = async (text, context = {}) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const intent = detectIntent(text);
    const detectedScheme = findScheme(text);
    const currentScheme = detectedScheme || (context.schemeId ? SCHEMES.find(s => s.id === context.schemeId) : null);

    let responseText = "";
    let newContext = { ...context };

    if (detectedScheme) {
        newContext.schemeId = detectedScheme.id;
    }

    // Safety: Check for unsafe/out-of-scope keywords (simple list)
    const unsafeKeywords = ['bomb', 'illegal', 'hack', 'kill', 'suicide', 'bank details', 'password', 'otp'];
    if (unsafeKeywords.some(w => text.toLowerCase().includes(w))) {
        return {
            response: "I cannot assist with that request. I am designed to help with government scheme guidance only.",
            newContext
        };
    }

    switch (intent) {
        case INTENTS.GREETING:
            responseText = "Hello! I am Scheme Sathi Assistant. \nI can help you find schemes, check eligibility, or guide you through the application process.\n\n_Note: I provide guidance only. Please verify updates on official portals._";
            break;

        case INTENTS.HELP:
            responseText = CAPABILITY_MESSAGE;
            break;

        case INTENTS.SCHEME_SEARCH:
            if (currentScheme && !text.toLowerCase().includes('find') && !text.toLowerCase().includes('search')) {
                // User mentioned context scheme broadly
                responseText = `**${currentScheme.name}**\n\n${currentScheme.description}\n\nYou can ask about eligibility, documents, or how to apply.`;
            } else if (detectedScheme) {
                responseText = `**${detectedScheme.name}**\n\n${detectedScheme.description}\n\nYou can ask about eligibility, documents, or how to apply.`;
            } else {
                // Fallback for broad search
                responseText = `Here are some popular schemes you can explore:\n\n${SCHEMES.map(s => `• **${s.name}**`).join('\n')}\n\nAsk me about any of these!`;
            }
            break;

        case INTENTS.ELIGIBILITY:
            if (currentScheme) {
                // Safety: Non-assertive language
                responseText = `**Eligibility for ${currentScheme.name}**:\n\nYou **may be eligible** if you meet the following criteria:\n\n${currentScheme.eligibility.map(e => `• ${e}`).join('\n')}\n\nPlease check the official portal to confirm your status.${DISCLAIMER_FOOTER}`;
            } else {
                responseText = "Which scheme are you asking about? Please tell me the scheme name first (e.g., 'PM Kisan') so I can check criteria.";
            }
            break;

        case INTENTS.DOCUMENTS:
            if (currentScheme) {
                responseText = `**Documents required for ${currentScheme.name}**:\n\n${currentScheme.documents.map(d => `• ${d}`).join('\n')}`;
            } else {
                responseText = "Please specify which scheme you need document lists for.";
            }
            break;

        case INTENTS.APPLICATION:
            if (currentScheme) {
                responseText = `**How to apply for ${currentScheme.name}**:\n\n${currentScheme.application_process.map((step, i) => `${i + 1}. ${step}`).join('\n')}${DISCLAIMER_FOOTER}`;
            } else {
                responseText = "I can guide you through the application process. Which scheme do you want to apply for?";
            }
            break;

        case INTENTS.BENEFITS:
            if (currentScheme) {
                responseText = `**Benefits of ${currentScheme.name}**:\n\n${currentScheme.description}${DISCLAIMER_FOOTER}`;
            } else {
                responseText = "Please mention the scheme name to know its benefits.";
            }
            break;

        case INTENTS.UNKNOWN:
        default:
            if (currentScheme) {
                // Context exists but intent unclear
                responseText = `I'm not sure I understood. \n\nWe are discussing **${currentScheme.name}**. You can ask about:\n• Eligibility\n• Documents\n• Application Process`;
            } else {
                // Robust Fallback
                responseText = `I didn't quite understand that. \n\n${CAPABILITY_MESSAGE}`;
            }
            break;
    }

    return {
        response: responseText,
        newContext
    };
};
