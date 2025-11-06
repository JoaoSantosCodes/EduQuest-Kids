import { supabase } from '../config/supabase';

// Exportar questões para CSV
export const exportQuestionsToCSV = (questions) => {
  if (!questions || questions.length === 0) {
    throw new Error('Nenhuma questão para exportar');
  }

  // Cabeçalho CSV
  const headers = [
    'Matéria',
    'Questão',
    'Opção A',
    'Opção B',
    'Opção C',
    'Opção D',
    'Resposta Correta',
    'Dificuldade',
    'Série',
    'Pontos',
    'Explicação',
    'Tags'
  ];

  // Converter questões para linhas CSV
  const rows = questions.map(q => {
    const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
    const tags = Array.isArray(q.tags) ? q.tags.join('; ') : '';
    
    return [
      q.subjects?.name || '',
      q.question_text || '',
      options[0] || '',
      options[1] || '',
      options[2] || '',
      options[3] || '',
      String.fromCharCode(65 + (q.correct_answer || 0)), // A, B, C, D
      q.difficulty || 'medium',
      q.grade_level || '',
      q.points || 10,
      q.explanation || '',
      tags
    ].map(field => {
      // Escapar vírgulas e aspas no CSV
      const fieldStr = String(field || '');
      if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
        return `"${fieldStr.replace(/"/g, '""')}"`;
      }
      return fieldStr;
    });
  });

  // Combinar cabeçalho e linhas
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Criar blob e download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `questoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar questões para JSON
export const exportQuestionsToJSON = (questions) => {
  if (!questions || questions.length === 0) {
    throw new Error('Nenhuma questão para exportar');
  }

  // Preparar dados para JSON
  const jsonData = questions.map(q => ({
    subject: q.subjects?.name || '',
    question_text: q.question_text || '',
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
    correct_answer: q.correct_answer || 0,
    difficulty: q.difficulty || 'medium',
    grade_level: q.grade_level || 7,
    points: q.points || 10,
    explanation: q.explanation || '',
    tags: Array.isArray(q.tags) ? q.tags : []
  }));

  // Criar blob e download
  const jsonContent = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `questoes_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar questões para Excel (CSV formatado)
export const exportQuestionsToExcel = (questions) => {
  // Por enquanto, exportar como CSV (que abre no Excel)
  // Para exportação real em Excel, seria necessário usar uma biblioteca como xlsx
  exportQuestionsToCSV(questions);
};

