import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Analysis Endpoint
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { summary, categories, monthlyIncome, monthlyExpenses, recentTransactions } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        summary: "Diagnóstico baseado nas regras financeiras recomendadas (50/30/20):",
        tips: [
          "Mantenha despesas fixas (moradia, contas básicas) abaixo de 50% da sua renda líquida.",
          "Limite gastos de festa, delivery e lazer a até 30% do orçamento para não comprometer suas reservas.",
          "Separe ao menos 10% a 20% logo no início do mês diretamente em um cofrinho ou investimento com liquidez diária.",
          "Revise assinaturas recorrentes ativas: cancele serviços de streaming ou apps que não usou nos últimos 30 dias."
        ],
        alerts: monthlyExpenses > monthlyIncome ? ["Suas despesas superaram suas receitas neste mês! Corte imediatamente gastos variáveis."] : [],
        potentialSavings: Math.max(0, Math.round(monthlyExpenses * 0.15))
      });
    }

    const prompt = `Você é o FinanBot, um consultor financeiro pessoal especialista em finanças comportamentais e economia doméstica no Brasil.
Analise os seguintes dados financeiros do usuário:
- Renda do Mês: R$ ${monthlyIncome?.toFixed(2) || '0.00'}
- Despesas do Mês: R$ ${monthlyExpenses?.toFixed(2) || '0.00'}
- Saldo: R$ ${(monthlyIncome - monthlyExpenses)?.toFixed(2) || '0.00'}
- Distribuição de gastos por categoria: ${JSON.stringify(categories || [])}
- Transações recentes ou destaques: ${JSON.stringify(recentTransactions || [])}

Responda em JSON rigoroso com a seguinte estrutura:
{
  "healthScore": 0 a 100,
  "summary": "resumo de 2 a 3 frases sobre a situação financeira do usuário de forma acolhedora, realista e prática em português do Brasil",
  "alerts": ["alerta crítico 1 se houver risco de endividamento ou descontrole em categorias como festa/lazer/delivery", "..."],
  "tips": [
    "Dica prática 1 com valor ou percentual de corte sugerido",
    "Dica prática 2 detalhando onde e como economizar (ex: alimentação, festas, transporte)",
    "Dica prática 3 sobre hábitos e planejamento"
  ],
  "potentialSavings": valor numérico aproximado em Reais que o usuário consegue economizar por mês cortando supérfluos,
  "cutOpportunities": [
    { "category": "nome da categoria", "suggestedCutPercent": 25, "reason": "motivo do corte" }
  ]
}
Retorne APENAS o JSON válido sem blocos de markdown adicionais se possível.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating AI analysis:', error);
    return res.status(500).json({
      error: 'Não foi possível gerar a análise por IA no momento.',
      message: error?.message || 'Erro interno'
    });
  }
});

// AI Chat Assistant Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        reply: "Olá! Sou seu assistente de gestão financeira. No momento, o serviço inteligente está em modo padrão. Lembre-se: priorize pagar contas essenciais, monte uma reserva de emergência equivalente a 3 a 6 meses do seu custo de vida e evite parcelamentos com juros!",
      });
    }

    const systemInstruction = `Você é o FinanBot, um assistente e mentor de inteligência financeira pessoal acolhedor, objetivo, simpático e didático para usuários brasileiros.
Você analisa receitas, despesas, categorias (alimentação, festas, lazer, transporte, boletos, cartões) e dá dicas concretas de como cortar gastos, negociar dívidas, usar a regra 50/30/20 e economizar dinheiro no dia a dia.
Contexto atual do usuário:
- Renda Mensal: R$ ${context?.monthlyIncome || 0}
- Despesas Mensais: R$ ${context?.monthlyExpenses || 0}
- Saldo: R$ ${(context?.monthlyIncome || 0) - (context?.monthlyExpenses || 0)}
- Categorias com maior gasto: ${JSON.stringify(context?.topCategories || [])}
- Metas ativas: ${JSON.stringify(context?.goals || [])}
- Contas pendentes: ${JSON.stringify(context?.pendingBills || [])}

Responda sempre em português do Brasil de forma clara, motivadora e com listas ou bullets quando ajudar a organizar o raciocínio.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text || 'Desculpe, não consegui formular uma resposta agora.' });
  } catch (error: any) {
    console.error('Error during AI chat:', error);
    return res.status(500).json({
      error: 'Erro ao processar mensagem.',
      reply: 'Tive um pequeno contratempo ao conectar com o serviço de IA. Mas posso te adiantar: manter seus gastos organizados por categoria é o primeiro passo para a liberdade financeira!'
    });
  }
});

// AI Investments Recommendation Endpoint
app.post('/api/ai/investments', async (req: Request, res: Response) => {
  try {
    const { profile, amount, horizon, objective } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        marketOverview: "O cenário atual no Brasil oferece excelentes oportunidades tanto em Renda Fixa com taxas de juros atrativas quanto em Ações e Fundos Imobiliários com preços descontados na B3.",
        bestChoicesToday: [
          {
            name: "Tesouro Selic / CDB 100%+ CDI",
            category: "Renda Fixa & Reserva",
            percentage: profile === 'conservador' ? 70 : profile === 'moderado' ? 45 : 20,
            reason: "Liquidez diária, máxima segurança e excelente rentabilidade sem oscilações negativas.",
            tickerExample: "Tesouro Selic 2029 / CDB Liquidez Diária"
          },
          {
            name: "Fundos Imobiliários (FIIs de Tijolo e Papel)",
            category: "Renda Passiva Mensal",
            percentage: profile === 'conservador' ? 20 : profile === 'moderado' ? 35 : 35,
            reason: "Dividendos mensais isentos de Imposto de Renda para pessoas físicas na sua conta todo mês.",
            tickerExample: "HGLG11, MXRF11, KNCR11, XPML11"
          },
          {
            name: "Ações de Empresas Sólidas & Dividendos (B3)",
            category: "Bolsa de Valores",
            percentage: profile === 'conservador' ? 10 : profile === 'moderado' ? 20 : 45,
            reason: "Empresas perenes que geram caixa mesmo em crises (bancos, energia, saneamento).",
            tickerExample: "BBAS3, ITUB4, TAEE11, EGIE3, VALE3"
          }
        ],
        goldenTip: "Nunca invista em Renda Variável (Bolsa de Valores) o dinheiro que você pode precisar nos próximos 12 meses. Comece pela sua Reserva de Emergência!",
        practicalSteps: [
          "1. Abra conta em uma corretora com taxa de corretagem zero para FIIs e ações.",
          "2. Faça o teste de 'Suitability' (perfil de investidor) na corretora.",
          "3. Transfira o valor via PIX e acesse a aba 'Renda Fixa' ou o 'Home Broker' para bolsa.",
          "4. Reinvista os dividendos mensais para acelerar o efeito dos juros compostos."
        ]
      });
    }

    const prompt = `Você é um analista e educador financeiro credenciado especializado no mercado financeiro brasileiro (B3, Tesouro Direto, FIIs, Ações).
O usuário deseja saber onde é melhor investir hoje com os seguintes parâmetros:
- Perfil do Investidor: ${profile || 'Moderado'}
- Valor disponível para investir: R$ ${amount || 500}
- Prazo / Horizonte: ${horizon || 'Médio Prazo (2 a 5 anos)'}
- Objetivo Principal: ${objective || 'Renda Passiva e Multiplicação de Patrimônio'}

Responda em JSON rigoroso com a seguinte estrutura:
{
  "marketOverview": "breve análise em 2 frases sobre o panorama econômico atual no Brasil (Bolsa de Valores B3, taxa Selic e inflação IPCA) e por que o dia de hoje é propício para investir com inteligência",
  "bestChoicesToday": [
    {
      "name": "Nome da classe ou ativo recomendado",
      "category": "Renda Fixa / FII / Ações / Tesouro IPCA+",
      "percentage": 40,
      "reason": "explicação simples, direta e didática de por que é excelente para o perfil dele hoje",
      "tickerExample": "exemplos de ativos/tickers conhecidos no Brasil (ex: Tesouro Selic, MXRF11, ITUB4, TAEE11)"
    }
  ],
  "goldenTip": "a dica de ouro mais importante para evitar perdas e ganhar consistência",
  "practicalSteps": [
    "passo 1 prático de como executar",
    "passo 2",
    "passo 3"
  ]
}
Retorne APENAS o JSON válido.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in investment advice endpoint:', error);
    const { profile } = req.body || {};
    return res.status(200).json({
      fallback: true,
      marketOverview: "O cenário atual no Brasil oferece excelentes oportunidades tanto em Renda Fixa com taxas de juros atrativas quanto em Ações e Fundos Imobiliários com preços descontados na B3.",
      bestChoicesToday: [
        {
          name: "Tesouro Selic / CDB 100%+ CDI",
          category: "Renda Fixa & Reserva",
          percentage: profile === 'conservador' ? 70 : profile === 'moderado' ? 45 : 20,
          reason: "Liquidez diária, máxima segurança e excelente rentabilidade sem oscilações negativas.",
          tickerExample: "Tesouro Selic 2029 / CDB Liquidez Diária"
        },
        {
          name: "Fundos Imobiliários (FIIs de Tijolo e Papel)",
          category: "Renda Passiva Mensal",
          percentage: profile === 'conservador' ? 20 : profile === 'moderado' ? 35 : 35,
          reason: "Dividendos mensais isentos de Imposto de Renda para pessoas físicas na sua conta todo mês.",
          tickerExample: "HGLG11, MXRF11, KNCR11, XPML11"
        },
        {
          name: "Ações de Empresas Sólidas & Dividendos (B3)",
          category: "Bolsa de Valores",
          percentage: profile === 'conservador' ? 10 : profile === 'moderado' ? 20 : 45,
          reason: "Empresas perenes que geram caixa mesmo em crises (bancos, energia, saneamento).",
          tickerExample: "BBAS3, ITUB4, TAEE11, EGIE3, VALE3"
        }
      ],
      goldenTip: "Nunca invista em Renda Variável (Bolsa de Valores) o dinheiro que você pode precisar nos próximos 12 meses. Comece pela sua Reserva de Emergência!",
      practicalSteps: [
        "1. Abra conta em uma corretora com taxa de corretagem zero para FIIs e ações.",
        "2. Faça o teste de 'Suitability' (perfil de investidor) na corretora.",
        "3. Transfira o valor via PIX e acesse a aba 'Renda Fixa' ou o 'Home Broker' para bolsa.",
        "4. Reinvista os dividendos mensais para acelerar o efeito dos juros compostos."
      ]
    });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`FinanSmart Server running on http://localhost:${PORT}`);
  });
}

startServer();
