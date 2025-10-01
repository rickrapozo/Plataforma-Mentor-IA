# Configuração do Stripe - Guia de Setup

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Projeto configurado no Supabase
3. Aplicação React rodando

## 🔧 Configuração das Chaves do Stripe

### 1. Obter Chaves do Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
2. Vá para **Developers > API keys**
3. Copie as seguintes chaves:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e substitua os valores:

```env
# Stripe Configuration (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_sua_chave_publicavel_aqui"
STRIPE_SECRET_KEY="sk_test_sua_chave_secreta_aqui"
STRIPE_WEBHOOK_SECRET="whsec_sua_chave_webhook_aqui"
```

### 3. Configurar Produtos no Stripe

1. No Dashboard do Stripe, vá para **Products**
2. Crie dois produtos:

#### Plano Básico
- Nome: "Plano Básico"
- Preço: R$ 29,90/mês
- Copie o **Price ID** (começa com `price_`)

#### Plano Premium
- Nome: "Plano Premium"
- Preço: R$ 59,90/mês
- Copie o **Price ID** (começa com `price_`)

### 4. Atualizar Price IDs no Código

Edite o arquivo `src/components/subscription/SubscriptionPlans.tsx` e substitua:

```typescript
// Linha ~97 e ~98
onClick={() => handleSelectPlan(planKey === 'BASIC' ? 'price_SEU_ID_BASICO' : 'price_SEU_ID_PREMIUM')}
```

## 🔗 Configuração de Webhooks

### 1. Configurar Webhook no Stripe

1. No Dashboard do Stripe, vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. URL do endpoint: `https://SEU_PROJETO.supabase.co/functions/v1/stripe-webhook`
4. Selecione os eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. Configurar Webhook Secret

1. Após criar o webhook, copie o **Signing secret**
2. Adicione no arquivo `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_sua_chave_webhook_aqui"
```

## 🚀 Deploy das Funções Supabase

Execute os comandos para fazer deploy das funções:

```bash
# Deploy da função de checkout
supabase functions deploy create-checkout-session

# Deploy da função de portal do cliente
supabase functions deploy create-customer-portal

# Deploy da função de webhook
supabase functions deploy stripe-webhook
```

## 🧪 Testando a Integração

### 1. Cartões de Teste

Use estes cartões para testar:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### 2. Fluxo de Teste

1. Acesse `/subscription` na aplicação
2. Escolha um plano
3. Complete o checkout com cartão de teste
4. Verifique redirecionamento para página de sucesso
5. Teste cancelamento do checkout

## 📊 Monitoramento

- **Logs do Stripe**: Dashboard > Developers > Logs
- **Logs do Supabase**: Dashboard > Edge Functions > Logs
- **Webhooks**: Dashboard > Developers > Webhooks > [seu webhook] > Attempts

## 🔒 Segurança

- ✅ Chaves secretas apenas no backend (Supabase Edge Functions)
- ✅ Chaves públicas no frontend
- ✅ Validação de webhooks com signing secret
- ✅ Row Level Security (RLS) no Supabase

## 🆘 Troubleshooting

### Erro: "VITE_STRIPE_PUBLISHABLE_KEY não definida"
- Verifique se o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento

### Webhook não funciona
- Verifique se a URL do webhook está correta
- Confirme se o signing secret está correto
- Verifique logs no Dashboard do Stripe

### Checkout não abre
- Verifique se os Price IDs estão corretos
- Confirme se as funções Supabase foram deployadas
- Verifique logs no console do navegador