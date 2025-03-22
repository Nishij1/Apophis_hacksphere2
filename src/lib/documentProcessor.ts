import { createWorker } from 'tesseract.js';
import * as PDFJS from 'pdfjs-dist';
import { supabase } from './supabase';
import { AITranslationService } from './aiTranslation';

// Workaround for PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  id?: string;
  content: string;
  source: 'pdf' | 'image' | 'text';
  timestamp: Date;
  keywords?: string[];
  summary?: string;
  simplifiedContent?: string;
  medicalTerms?: Array<{
    term: string;
    explanation: string;
  }>;
}

interface SearchResult extends ProcessedDocument {
  similarity: number;
}

// Common medical stopwords and English stopwords combined
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'the', 'patient', 'treatment', 'medication', 'dose', 'mg',
  'tablets', 'daily', 'prescribed', 'doctor', 'hospital', 'medical', 'health'
]);

class DocumentProcessor {
  private static instance: DocumentProcessor;
  private ocrWorker: Tesseract.Worker | null = null;
  private translationService: AITranslationService;

  private constructor() {
    this.translationService = AITranslationService.getInstance();
  }

  public static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  private async initOCRWorker() {
    if (!this.ocrWorker) {
      this.ocrWorker = await createWorker('eng');
    }
    return this.ocrWorker;
  }

  private tokenizeText(text: string): string[] {
    // Simple tokenization by splitting on whitespace and removing punctuation
    return text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOPWORDS.has(word));
  }

  private calculateTermFrequency(tokens: string[]): Map<string, number> {
    const frequency = new Map<string, number>();
    tokens.forEach(token => {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    });
    return frequency;
  }

  private async identifyMedicalTerms(text: string): Promise<Array<{term: string, explanation: string}>> {
    try {
      const result = await this.translationService.translate({
        text,
        sourceLanguage: 'medical',
        targetLanguage: 'simple'
      });

      // Extract medical terms and their explanations from the AI response
      const medicalTerms = result.medicalTerms || [];
      return medicalTerms;
    } catch (error) {
      console.error('Error identifying medical terms:', error);
      return [];
    }
  }

  private async simplifyContent(content: string, medicalTerms: Array<{term: string, explanation: string}>): Promise<string> {
    try {
      const result = await this.translationService.translate({
        text: content,
        sourceLanguage: 'medical',
        targetLanguage: 'simple',
        context: { medicalTerms }
      });

      return result.translatedText;
    } catch (error) {
      console.error('Error simplifying content:', error);
      return content;
    }
  }

  private async analyzeContent(content: string): Promise<{
    keywords: string[],
    summary: string,
    simplifiedContent: string,
    medicalTerms: Array<{term: string, explanation: string}>
  }> {
    try {
      // Identify medical terms first
      const medicalTerms = await this.identifyMedicalTerms(content);
      
      // Generate simplified content with medical term explanations
      const simplifiedContent = await this.simplifyContent(content, medicalTerms);
      
      // Extract keywords from both original and simplified content
      const tokens = this.tokenizeText(content + ' ' + simplifiedContent);
      const termFreq = this.calculateTermFrequency(tokens);
      
      // Sort terms by frequency but exclude already identified medical terms
      const medicalTermSet = new Set(medicalTerms.map(t => t.term.toLowerCase()));
      const sortedTerms = Array.from(termFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([term]) => term)
        .filter(term => !medicalTermSet.has(term))
        .slice(0, 10);

      // Generate summary using simplified content, but ensure it contains key medical terms
      const sentences = simplifiedContent.match(/[^.!?]+[.!?]+/g) || [];
      const summarySentences = sentences
        .filter(sentence => 
          medicalTerms.some(term => 
            sentence.toLowerCase().includes(term.term.toLowerCase())
          ) ||
          sortedTerms.some(term => 
            sentence.toLowerCase().includes(term)
          )
        )
        .slice(0, 3);

      return {
        keywords: [...medicalTerms.map(t => t.term), ...sortedTerms],
        summary: summarySentences.join(' '),
        simplifiedContent,
        medicalTerms
      };
    } catch (error) {
      console.error('Error during content analysis:', error);
      // Provide basic analysis if AI services fail
      const tokens = this.tokenizeText(content);
      const termFreq = this.calculateTermFrequency(tokens);
      const sortedTerms = Array.from(termFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term]) => term);

      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      const summarySentences = sentences
        .filter(sentence => 
          sortedTerms.some(term => 
            sentence.toLowerCase().includes(term)
          )
        )
        .slice(0, 3);

      return {
        keywords: sortedTerms,
        summary: summarySentences.join(' '),
        simplifiedContent: content,
        medicalTerms: []
      };
    }
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter(item => 'str' in item)
        .map(item => (item as { str: string }).str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  }

  private async extractTextFromImage(file: File): Promise<string> {
    const worker = await this.initOCRWorker();
    const imageUrl = URL.createObjectURL(file);
    
    try {
      const { data: { text } } = await worker.recognize(imageUrl);
      return text;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  private async saveToSupabase(report: ProcessedDocument): Promise<string> {
    const { data, error } = await supabase
      .from('medical_reports')
      .insert([{
        content: report.content,
        source: report.source,
        timestamp: report.timestamp.toISOString(),
        keywords: report.keywords,
        summary: report.summary,
        simplifiedContent: report.simplifiedContent,
        medicalTerms: report.medicalTerms
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    return data.id;
  }

  public async processFile(file: File): Promise<ProcessedDocument> {
    let content: string;
    let source: 'pdf' | 'image' | 'text';

    if (file.type === 'application/pdf') {
      content = await this.extractTextFromPdf(file);
      source = 'pdf';
    } else if (file.type.startsWith('image/')) {
      content = await this.extractTextFromImage(file);
      source = 'image';
    } else {
      throw new Error('Unsupported file type');
    }

    // Analyze content for keywords, summary, and medical terms
    const { keywords, summary, simplifiedContent, medicalTerms } = await this.analyzeContent(content);

    const report = {
      content,
      source,
      timestamp: new Date(),
      keywords,
      summary,
      simplifiedContent,
      medicalTerms
    };

    // Save to Supabase and get the ID
    await this.saveToSupabase(report);
    
    return report;
  }

  public async loadReports(): Promise<ProcessedDocument[]> {
    const { data, error } = await supabase
      .from('medical_reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading reports:', error);
      throw error;
    }

    return data.map(report => ({
      ...report,
      timestamp: new Date(report.timestamp)
    }));
  }

  public async searchReports(query: string): Promise<{
    reports: ProcessedDocument[],
    relevanceScores: { [id: string]: number }
  }> {
    const { data: results, error } = await supabase
      .rpc('search_medical_reports', { 
        search_query: query,
        similarity_threshold: 0.3
      });

    if (error) {
      console.error('Error searching reports:', error);
      throw error;
    }

    // Convert similarity scores to relevance scores
    const relevanceScores: { [id: string]: number } = {};
    (results as SearchResult[]).forEach(result => {
      if (result.id) {
        relevanceScores[result.id] = result.similarity;
      }
    });

    // Sort and convert to ProcessedDocument format
    const reports = (results as SearchResult[]).map(result => ({
      id: result.id,
      content: result.content,
      source: result.source,
      timestamp: new Date(result.timestamp),
      keywords: result.keywords,
      summary: result.summary
    }));

    return {
      reports,
      relevanceScores
    };
  }

  public async cleanup() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
  }
}

export default DocumentProcessor;