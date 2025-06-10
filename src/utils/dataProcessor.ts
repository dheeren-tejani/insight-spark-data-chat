
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ProcessedData {
  data: any[];
  columns: string[];
  domain: string;
  confidence: number;
  detectedFeatures: string[];
  dataQuality: number;
}

const DOMAIN_PATTERNS = {
  finance: ['revenue', 'profit', 'stock', 'price', 'investment', 'portfolio', 'risk', 'sales', 'cost', 'expense', 'income', 'gdp', 'economic'],
  healthcare: ['patient', 'diagnosis', 'treatment', 'symptoms', 'medical', 'clinical', 'disease', 'therapy', 'health'],
  business: ['customer', 'marketing', 'conversion', 'retention', 'kpi', 'lead', 'campaign', 'churn'],
  scientific: ['experiment', 'hypothesis', 'research', 'correlation', 'statistical', 'analysis', 'study'],
  geographic: ['latitude', 'longitude', 'country', 'city', 'region', 'location', 'address', 'coordinates'],
  sports: ['player', 'team', 'score', 'performance', 'statistics', 'season', 'game', 'match'],
  economic: ['gdp', 'inflation', 'market', 'economic', 'indicators', 'trends', 'growth', 'unemployment']
};

export function detectDomain(columns: string[]): { domain: string; confidence: number; features: string[] } {
  const lowerColumns = columns.map(col => col.toLowerCase());
  const scores: { [key: string]: { score: number; features: string[] } } = {};
  
  Object.entries(DOMAIN_PATTERNS).forEach(([domain, patterns]) => {
    const matches = patterns.filter(pattern => 
      lowerColumns.some(col => col.includes(pattern))
    );
    scores[domain] = {
      score: matches.length / patterns.length,
      features: matches
    };
  });
  
  const bestMatch = Object.entries(scores).reduce((a, b) => 
    a[1].score > b[1].score ? a : b
  );
  
  return {
    domain: bestMatch[0],
    confidence: Math.round(bestMatch[1].score * 100),
    features: bestMatch[1].features
  };
}

export function calculateDataQuality(data: any[]): number {
  if (!data || data.length === 0) return 0;
  
  const totalCells = data.length * Object.keys(data[0] || {}).length;
  let validCells = 0;
  
  data.forEach(row => {
    Object.values(row || {}).forEach(value => {
      if (value !== null && value !== undefined && value !== '') {
        validCells++;
      }
    });
  });
  
  return Math.round((validCells / totalCells) * 100);
}

export async function processFile(file: File): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv' || fileExtension === 'txt' || fileExtension === 'tsv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const data = results.data;
          const columns = Object.keys(data[0] || {});
          const domainInfo = detectDomain(columns);
          const dataQuality = calculateDataQuality(data);
          
          resolve({
            data,
            columns,
            domain: domainInfo.domain,
            confidence: domainInfo.confidence,
            detectedFeatures: domainInfo.features,
            dataQuality
          });
        },
        error: reject
      });
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const columns = Object.keys(jsonData[0] || {});
          const domainInfo = detectDomain(columns);
          const dataQuality = calculateDataQuality(jsonData);
          
          resolve({
            data: jsonData,
            columns,
            domain: domainInfo.domain,
            confidence: domainInfo.confidence,
            detectedFeatures: domainInfo.features,
            dataQuality
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format'));
    }
  });
}
