import { NextResponse } from 'next/server';
import { WhatsAppAIService } from '@/lib/whatsapp-ai-service';

export async function GET() {
  try {
    const whatsappService = new WhatsAppAIService();
    const result = await whatsappService.testWhatsAppConnection();
    
    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      checks: {
        apiKeyConfigured: result.apiKeyConfigured,
        apiReachable: result.apiReachable,
      },
      error: result.error,
      recommendations: getRecommendations(result)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: `Service initialization failed: ${errorMessage}`,
      recommendations: [
        'Check if SUPABASE_SERVICE_ROLE_KEY is configured',
        'Verify environment variables are properly set',
        'Ensure you are running this on the server-side'
      ]
    }, { status: 500 });
  }
}

const getRecommendations = (result: {
  success: boolean;
  apiKeyConfigured: boolean;
  apiReachable: boolean;
  error?: string;
}): string[] => {
  const recommendations: string[] = [];
  
  if (!result.apiKeyConfigured) {
    recommendations.push('Set the WASENDER_API_KEY environment variable in your deployment');
    recommendations.push('Verify the API key is valid and has proper permissions');
  }
  
  if (!result.apiReachable) {
    recommendations.push('Check internet connectivity to WASender API');
    recommendations.push('Verify the WASender API endpoint is accessible from your server');
    recommendations.push('Check if there are any firewall restrictions blocking outbound requests');
  }
  
  if (result.error?.includes('timeout')) {
    recommendations.push('The WASender API may be experiencing high latency');
    recommendations.push('Consider increasing timeout values or try again later');
  }
  
  if (result.error?.includes('401')) {
    recommendations.push('API key authentication failed - verify your WASENDER_API_KEY');
  }
  
  if (result.error?.includes('429')) {
    recommendations.push('Rate limit exceeded - reduce request frequency');
  }
  
  if (result.success) {
    recommendations.push('WhatsApp connection is working properly');
    recommendations.push('You can now send AI responses via WhatsApp');
  }
  
  return recommendations;
}; 