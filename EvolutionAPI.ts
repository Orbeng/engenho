// src/utils/EvolutionAPI.ts

interface MessagePayload {
  number: string; // Phone number in international format (e.g. 5511999999999)
  options?: {
    delay?: number; // Delay in milliseconds between messages
    presence?: 'unavailable' | 'available' | 'composing' | 'recording' | 'paused';
  };
  replyToMessageId?: string;
}

interface TextMessagePayload extends MessagePayload {
  text: {
    text: string;
  };
}

interface MediaMessagePayload extends MessagePayload {
  media: {
    url: string; // URL of the file to send
  };
}

interface DocumentMessagePayload extends MessagePayload {
  document: {
    url: string; // URL of the document to send
    fileName: string; // Name of the document
  };
}

interface MessageResponse {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  message: any;
  messageTimestamp: number;
}

class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;
  
  constructor(baseUrl: string, apiKey: string, instanceName: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.instanceName = instanceName;
  }
  
  private async makeRequest(endpoint: string, method: string = 'POST', body?: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error calling Evolution API ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Check if the instance is connected
  async checkInstanceStatus(): Promise<any> {
    const response = await this.makeRequest(`/instance/status/${this.instanceName}`, 'GET');
    return response;
  }
  
  // Send text message
  async sendTextMessage(number: string, message: string): Promise<MessageResponse> {
    const payload: TextMessagePayload = {
      number: number,
      text: {
        text: message
      }
    };
    
    const response = await this.makeRequest(`/message/sendText/${this.instanceName}`, 'POST', payload);
    return response;
  }
  
  // Send media (image, video, etc.)
  async sendMediaMessage(number: string, mediaUrl: string, caption: string = ''): Promise<MessageResponse> {
    const payload: MediaMessagePayload = {
      number: number,
      media: {
        url: mediaUrl
      }
    };
    
    if (caption) {
      // Evolution API might have different ways to add caption depending on implementation
      // This is a general approach - check Evolution API documentation for specifics
      (payload as any).caption = caption;
    }
    
    const response = await this.makeRequest(`/message/sendMedia/${this.instanceName}`, 'POST', payload);
    return response;
  }
  
  // Send document (PDF, etc.)
  async sendDocumentMessage(number: string, documentUrl: string, fileName: string): Promise<MessageResponse> {
    const payload: DocumentMessagePayload = {
      number: number,
      document: {
        url: documentUrl,
        fileName: fileName
      }
    };
    
    const response = await this.makeRequest(`/message/sendDocument/${this.instanceName}`, 'POST', payload);
    return response;
  }
  
  // Send payment link (boleto) via WhatsApp
  async sendPaymentLink(number: string, boletoLink: string, amount: number, description: string): Promise<MessageResponse> {
    const message = `Olá! Segue o boleto para pagamento do serviço:\n\n${description}\nValor: R$ ${amount.toFixed(2)}\n\nAcesse: ${boletoLink}\n\nObrigado!`;
    
    return this.sendTextMessage(number, message);
  }
  
  // Send project status update
  async sendProjectUpdate(number: string, projectName: string, status: string, details: string): Promise<MessageResponse> {
    const message = `Atualização do Projeto: ${projectName}\nStatus: ${status}\n\n${details}`;
    
    return this.sendTextMessage(number, message);
  }
  
  // Send schedule reminder
  async sendScheduleReminder(number: string, eventTitle: string, dateTime: string, details: string): Promise<MessageResponse> {
    const message = `Lembrete: ${eventTitle}\nData/Hora: ${dateTime}\n\n${details}`;
    
    return this.sendTextMessage(number, message);
  }
  
  // Send document delivery notification
  async sendDocumentNotification(number: string, documentName: string, downloadLink: string): Promise<MessageResponse> {
    const message = `Documento disponível: ${documentName}\n\nClique no link abaixo para acessar:\n${downloadLink}`;
    
    return this.sendTextMessage(number, message);
  }
  
  // Get message history
  async getMessageHistory(): Promise<any[]> {
    const response = await this.makeRequest(`/message/${this.instanceName}`, 'GET');
    return response.messages || [];
  }
  
  // Get contacts
  async getContacts(): Promise<any[]> {
    const response = await this.makeRequest(`/chat/contacts/${this.instanceName}`, 'GET');
    return response.contacts || [];
  }
  
  // Create or connect to an instance
  async connectInstance(): Promise<any> {
    const payload = {
      instanceName: this.instanceName,
      // Additional configuration can be added here if required by Evolution API
    };
    
    const response = await this.makeRequest('/instance/create', 'POST', payload);
    return response;
  }
}

export default EvolutionAPI;