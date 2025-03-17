# OpenRouter Chat Interface

Uma interface de chat simples para interagir com modelos de linguagem através da API do OpenRouter.

## Funcionalidades

- Conexão com a API do OpenRouter usando sua chave de API
- Seleção de modelos disponíveis (gratuitos e pagos)
- Suporte a múltiplos idiomas na interface (Português, Inglês, Espanhol)
- Configuração do idioma de resposta do modelo
- Ajuste de parâmetros como temperatura e tokens máximos
- Histórico de conversa com contexto
- Contagem de tokens utilizados

## Como usar

1. Abra o arquivo `index.html` em seu navegador
2. Insira sua chave de API do OpenRouter (começa com `sk-`)
3. Clique em "Conectar" para carregar os modelos disponíveis
4. Selecione um modelo na lista
5. Configure os parâmetros desejados:
   - Idioma do modelo: define o idioma em que o modelo responderá
   - Temperatura: controla a criatividade das respostas (0-2)
   - Tokens máximos: limita o tamanho das respostas

6. Digite sua mensagem e pressione Enter ou clique em "Enviar"
7. O modelo responderá mantendo o contexto da conversa

## Solução de problemas

Se você encontrar problemas de conexão:

1. Verifique se sua chave de API está correta
2. Certifique-se de que sua conexão com a internet está funcionando
3. Verifique se você tem créditos suficientes na sua conta do OpenRouter
4. Abra o console do navegador (F12) para ver mensagens de erro detalhadas

## Obter uma chave de API

Para obter uma chave de API do OpenRouter:

1. Crie uma conta em [openrouter.ai](https://openrouter.ai)
2. Acesse seu painel de controle
3. Gere uma nova chave de API
4. Copie a chave e use-a nesta interface

## Notas

- Os modelos gratuitos têm limites de uso
- Alguns modelos podem ter custos associados
- A API key é armazenada apenas na memória do navegador durante a sessão 