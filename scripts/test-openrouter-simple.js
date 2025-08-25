const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
require('dotenv').config({ path: '.env.local' });

async function testOpenRouter() {
  console.log('Testing OpenRouter API connection...\n');
  
  // Check environment variable
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY environment variable is not set');
    return;
  }
  console.log('✅ OPENROUTER_API_KEY is set');
  
  try {
    const openrouter = createOpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    
    // Test the models we're using
    const models = [
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-haiku-20240307',
      'google/gemini-pro',
      'meta-llama/llama-3.1-8b-instruct:free'
    ];
    
    for (const modelName of models) {
      console.log(`\nTesting model: ${modelName}`);
      try {
        const model = openrouter(modelName);
        
        // Use AI SDK v5 syntax
        const result = await generateText({
          model: model,
          prompt: "Say 'Hello, this is a test' in one sentence.",
          maxTokens: 50
        });
        
        console.log(`✅ ${modelName} - Success!`);
        console.log(`   Response: ${result.text}`);
        
      } catch (error) {
        console.error(`❌ ${modelName} - Failed:`, error.message);
        
        // Try alternative syntax
        try {
          console.log(`   Trying alternative syntax for ${modelName}...`);
          const model = openrouter(modelName);
          const result = await generateText({
            model: model,
            messages: [{ role: 'user', content: "Say 'Hello, this is a test' in one sentence." }],
            maxTokens: 50
          });
          
          console.log(`✅ ${modelName} - Success with alternative syntax!`);
          console.log(`   Response: ${result.text}`);
          
        } catch (altError) {
          console.error(`   ❌ Alternative syntax also failed:`, altError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ OpenRouter client creation failed:', error.message);
  }
}

testOpenRouter().catch(console.error);
