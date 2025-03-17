let currentApiKey = '';
let messageHistory = [];
let isProcessing = false;
let currentLanguage = 'pt-BR';

// Inicializa os parâmetros do modelo
let modelParameters = {
    language: '',
    temperature: 0.7,
    maxTokens: 1000
};

// Gerenciamento de Elementos
let elements = [];
let selectedElements = [];

// Funções do Modal
function openElementModal() {
    const modal = document.getElementById('elementModal');
    modal.style.display = 'block';
}

function closeElementModal() {
    const modal = document.getElementById('elementModal');
    modal.style.display = 'none';
}

// Função para criar novo elemento
function createElement(event) {
    event.preventDefault();
    
    const element = {
        id: Date.now(),
        name: document.getElementById('elementName').value,
        address: document.getElementById('elementAddress').value,
        limit: parseInt(document.getElementById('elementLimit').value),
        content: document.getElementById('elementContent').value
    };
    
    elements.push(element);
    updateElementsList();
    closeElementModal();
    document.getElementById('elementForm').reset();
}

// Função para atualizar a lista de elementos
function updateElementsList() {
    const elementsList = document.querySelector('.elements-list');
    elementsList.innerHTML = '';
    
    elements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'element-item';
        elementDiv.innerHTML = `
            <div>
                <strong>${element.name}</strong>
                <br>
                <small>${element.address} (Limite: ${element.limit})</small>
            </div>
            <div class="element-actions">
                <button onclick="selectElement(${element.id})">Selecionar</button>
                <button onclick="deleteElement(${element.id})">Excluir</button>
            </div>
        `;
        elementsList.appendChild(elementDiv);
    });
}

// Função para selecionar elemento
function selectElement(elementId) {
    const element = elements.find(e => e.id === elementId);
    if (element && !selectedElements.find(e => e.id === elementId)) {
        selectedElements.push(element);
        updateSelectedElementsList();
    }
}

// Função para remover elemento selecionado
function removeSelectedElement(elementId) {
    selectedElements = selectedElements.filter(e => e.id !== elementId);
    updateSelectedElementsList();
}

// Função para excluir elemento
function deleteElement(elementId) {
    elements = elements.filter(e => e.id !== elementId);
    selectedElements = selectedElements.filter(e => e.id !== elementId);
    updateElementsList();
    updateSelectedElementsList();
}

// Função para atualizar lista de elementos selecionados
function updateSelectedElementsList() {
    const selectedList = document.querySelector('.selected-list');
    selectedList.innerHTML = '';
    
    if (selectedElements.length > 0) {
        const title = document.createElement('h4');
        title.textContent = 'Elementos Selecionados';
        selectedList.appendChild(title);
        
        selectedElements.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'selected-element';
            elementDiv.innerHTML = `
                <span>${element.name}</span>
                <button onclick="removeSelectedElement(${element.id})">Remover</button>
            `;
            selectedList.appendChild(elementDiv);
        });
    }
}

// Função auxiliar para atualizar texto de forma segura
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Função auxiliar para atualizar placeholder de forma segura
function updateElementPlaceholder(elementId, placeholder) {
    const element = document.getElementById(elementId);
    if (element) {
        element.placeholder = placeholder;
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    const texts = languages[lang];
    
    // Atualiza todos os textos da interface de forma segura
    updateElementText('pageTitle', texts.title);
    updateElementPlaceholder('apiKeyInput', texts.apiKeyPlaceholder);
    updateElementText('connectButton', texts.connectButton);
    updateElementText('modelSelectLabel', texts.modelSelectLabel);
    updateElementText('clearButton', texts.clearButton);
    updateElementPlaceholder('userInput', texts.inputPlaceholder);
    updateElementText('sendButton', texts.sendButton);
    
    // Atualiza os grupos de modelos
    const freeModels = document.getElementById('freeModels');
    const paidModels = document.getElementById('paidModels');
    if (freeModels) freeModels.label = texts.freeModelsGroup;
    if (paidModels) paidModels.label = texts.paidModelsGroup;
    
    // Atualiza os textos dos parâmetros
    updateElementText('parametersTitle', texts.parametersTitle);
    updateElementText('modelLanguageLabel', texts.modelLanguageLabel);
    updateElementText('temperatureLabel', texts.temperatureLabel);
    updateElementText('maxTokensLabel', texts.maxTokensLabel);
    
    // Atualiza a opção "Auto" no seletor de idioma do modelo
    const modelLanguageSelect = document.getElementById('modelLanguage');
    if (modelLanguageSelect && modelLanguageSelect.options[0]) {
        modelLanguageSelect.options[0].text = texts.autoLanguage;
    }
    
    // Atualiza o contador de tokens
    const tokenCount = document.getElementById('tokenCount');
    if (tokenCount) {
        const currentTokens = tokenCount.textContent.split(':')[1] || '0';
        tokenCount.textContent = `${texts.tokensUsed}${currentTokens}`;
    }
}

// Função para verificar se a API key é válida
function isValidApiKey(apiKey) {
    // Verifica se a API key tem o formato correto (geralmente começa com "sk-")
    return apiKey && apiKey.trim().startsWith('sk-');
}

// Função para testar a conexão com a API
async function testApiConnection(apiKey) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao testar conexão:', error);
        return false;
    }
}

async function fetchModels() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const texts = languages[currentLanguage];
    
    if (!apiKey) {
        alert(texts.errorMessages.apiKeyRequired);
        return;
    }

    // Mostra mensagem de carregamento
    const freeModels = document.getElementById('freeModels');
    freeModels.innerHTML = `<option value="">${texts.loadingModels}</option>`;
    
    // Testa a conexão primeiro
    const isConnected = await testApiConnection(apiKey);
    if (!isConnected) {
        alert('Não foi possível conectar à API do OpenRouter. Verifique sua API key e conexão com a internet.');
        freeModels.innerHTML = '<option value="">Erro de conexão</option>';
        return;
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro na resposta:', response.status, errorData);
            throw new Error(`${texts.errorMessages.fetchError} (${response.status})`);
        }

        const data = await response.json();
        console.log('Modelos recebidos:', data);
        
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            throw new Error('Nenhum modelo encontrado');
        }
        
        populateModels(data);
        
        currentApiKey = apiKey;
        document.getElementById('modelSelect').disabled = false;
        document.getElementById('userInput').disabled = false;
        document.getElementById('sendButton').disabled = false;
        document.getElementById('clearButton').disabled = false;
        
    } catch (error) {
        console.error('Erro completo:', error);
        alert(`${texts.errorMessages.fetchError} ${error.message}`);
        freeModels.innerHTML = '<option value="">Erro ao carregar modelos</option>';
    }
}

function populateModels(data) {
    const freeModelsGroup = document.getElementById('freeModels');
    const paidModelsGroup = document.getElementById('paidModels');
    const texts = languages[currentLanguage];
    
    freeModelsGroup.innerHTML = '';
    paidModelsGroup.innerHTML = '';

    if (data && Array.isArray(data.data)) {
        data.data.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.id} (Contexto: ${model.context_length})`;
            
            if (model.pricing && model.pricing.prompt > 0) {
                paidModelsGroup.appendChild(option);
            } else {
                freeModelsGroup.appendChild(option);
            }
        });
    }
}

// Função para obter os parâmetros atuais do modelo
function getModelParameters() {
    modelParameters.temperature = parseFloat(document.getElementById('temperatureSlider').value);
    modelParameters.maxTokens = parseInt(document.getElementById('maxTokensInput').value);
    modelParameters.language = document.getElementById('modelLanguage').value;
    
    return modelParameters;
}

// Função para adicionar instruções de idioma à mensagem
function addLanguageInstruction(messages, language) {
    // Se o idioma não estiver definido, use o idioma da interface
    const targetLanguage = language || currentLanguage.split('-')[0];
    
    if (!targetLanguage) return messages;
    
    // Mapeamento de códigos de idioma para nomes completos
    const languageNames = {
        'pt': 'português',
        'en': 'English',
        'es': 'español',
        'fr': 'français',
        'de': 'Deutsch',
        'it': 'italiano',
        'ja': '日本語',
        'ko': '한국어',
        'zh': '中文',
        'ru': 'русский'
    };
    
    const languageName = languageNames[targetLanguage] || targetLanguage;
    
    // Adiciona uma instrução de sistema no início da conversa
    if (messages.length > 0 && messages[0].role !== 'system') {
        const systemMessage = {
            role: 'system',
            content: `Please respond in ${languageName}. The user's preferred language is ${languageName}.`
        };
        return [systemMessage, ...messages];
    } else if (messages.length > 0) {
        // Atualiza a mensagem de sistema existente
        const updatedSystemMessage = {
            role: 'system',
            content: `${messages[0].content} Please respond in ${languageName}. The user's preferred language is ${languageName}.`
        };
        return [updatedSystemMessage, ...messages.slice(1)];
    }
    
    return messages;
}

// Configuração do Marked.js
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Função para adicionar mensagem ao chat com suporte a Markdown
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Processa o conteúdo com Markdown
    const processedContent = marked.parse(content);
    messageDiv.innerHTML = processedContent;
    
    // Destaca o código após inserir no DOM
    messageDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para adicionar mensagem de digitação
function addTypingMessage() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';
}

// Modificar a função sendMessage para incluir elementos selecionados
async function sendMessage() {
    if (isProcessing) return;

    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    const selectedModel = document.getElementById('modelSelect').value;
    const texts = languages[currentLanguage];
    
    if (!message || !selectedModel) {
        alert(texts.errorMessages.messageRequired);
        return;
    }

    isProcessing = true;
    document.getElementById('sendButton').disabled = true;
    
    // Adiciona mensagem do usuário ao histórico e ao chat
    const userMessage = { role: "user", content: message };
    messageHistory.push(userMessage);
    addMessageToChat('user', message);
    userInput.value = '';
    
    // Obtém os parâmetros atuais do modelo
    const params = getModelParameters();
    
    // Adiciona informações dos elementos selecionados à mensagem
    let contextMessage = message;
    if (selectedElements.length > 0) {
        contextMessage += "\n\nElementos selecionados:\n";
        selectedElements.forEach(element => {
            contextMessage += `\n- ${element.name} (${element.address}): ${element.content}`;
        });
    }
    
    // Adiciona instruções de idioma se necessário
    const messagesWithLanguage = addLanguageInstruction([...messageHistory], params.language);
    messagesWithLanguage[messagesWithLanguage.length - 1].content = contextMessage;

    // Adiciona uma mensagem de "digitando..."
    addTypingMessage();

    try {
        console.log('Enviando requisição para o modelo:', {
            model: selectedModel,
            messages: messagesWithLanguage,
            temperature: params.temperature,
            max_tokens: params.maxTokens
        });

        // Verifica se a API key ainda é válida
        if (!currentApiKey) {
            throw new Error('API key não encontrada. Por favor, reconecte-se.');
        }

        const requestBody = {
            model: selectedModel,
            messages: messagesWithLanguage,
            temperature: params.temperature,
            max_tokens: params.maxTokens
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Remove a mensagem de "digitando..."
        removeTypingMessage();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Erro na resposta:', response.status, errorData);
            throw new Error(`${texts.errorMessages.modelError} (${response.status}): ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        console.log('Resposta recebida:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Formato de resposta inválido');
        }
        
        const assistantResponse = data.choices[0].message.content;
        
        // Adiciona resposta do assistente ao histórico e ao chat
        const assistantMessage = { role: "assistant", content: assistantResponse };
        messageHistory.push(assistantMessage);
        addMessageToChat('assistant', assistantResponse);

        // Atualiza contador de tokens
        updateTokenCount(data.usage);

    } catch (error) {
        // Remove a mensagem de "digitando..." se ainda existir
        removeTypingMessage();
        
        console.error('Erro completo:', error);
        addMessageToChat('system', `${texts.errorMessages.modelError} (${error.message})`);
        
        // Se for um erro de autenticação, solicita reconexão
        if (error.message.includes('401') || error.message.includes('403')) {
            currentApiKey = '';
            document.getElementById('modelSelect').disabled = true;
            document.getElementById('userInput').disabled = true;
            document.getElementById('sendButton').disabled = true;
            alert('Erro de autenticação. Por favor, reconecte-se com uma API key válida.');
        }
    } finally {
        isProcessing = false;
        document.getElementById('sendButton').disabled = false;
    }
}

function updateTokenCount(usage) {
    const tokenCount = document.getElementById('tokenCount');
    if (!tokenCount) return;

    const texts = languages[currentLanguage];
    tokenCount.textContent = `${texts.tokensUsed}${usage.total_tokens || 0}`;
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    messageHistory = [];
    updateTokenCount({ total_tokens: 0 });
}

// Inicializa os eventos para os controles de parâmetros
function initParameterControls() {
    // Atualiza o valor exibido do slider de temperatura
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    
    temperatureSlider.addEventListener('input', function() {
        temperatureValue.textContent = this.value;
        modelParameters.temperature = parseFloat(this.value);
    });
    
    // Atualiza o valor de tokens máximos
    const maxTokensInput = document.getElementById('maxTokensInput');
    maxTokensInput.addEventListener('change', function() {
        modelParameters.maxTokens = parseInt(this.value);
    });
    
    // Atualiza o idioma do modelo
    const modelLanguage = document.getElementById('modelLanguage');
    modelLanguage.addEventListener('change', function() {
        modelParameters.language = this.value;
    });
}

// Evento de tecla Enter para enviar mensagem
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Ajusta altura do textarea automaticamente
document.getElementById('userInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Inicializa a interface com o idioma padrão
document.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLanguage);
    initParameterControls();
    
    // Adiciona eventos do modal
    const modal = document.getElementById('elementModal');
    const addElementBtn = document.getElementById('addElementBtn');
    const closeBtn = document.querySelector('.close');
    const elementForm = document.getElementById('elementForm');
    
    addElementBtn.onclick = openElementModal;
    closeBtn.onclick = closeElementModal;
    elementForm.onsubmit = createElement;
    
    window.onclick = function(event) {
        if (event.target == modal) {
            closeElementModal();
        }
    };
});

// Remove a mensagem de "digitando..."
function removeTypingMessage() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
} 