// Parser de CSV para questões
export const parseCSVQuestions = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV deve ter pelo menos um cabeçalho e uma linha de dados');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (values.length < headers.length) {
      continue; // Pular linhas inválidas
    }

    try {
      const question = {
        question_text: values[1] || '',
        options: [
          values[2] || '',
          values[3] || '',
          values[4] || '',
          values[5] || ''
        ].filter(opt => opt.trim()),
        correct_answer: getCorrectAnswerIndex(values[6] || 'A'),
        difficulty: (values[7] || 'medium').toLowerCase(),
        grade_level: parseInt(values[8]) || 7,
        points: parseInt(values[9]) || 10,
        explanation: values[10] || '',
        tags: values[11] ? values[11].split(';').map(t => t.trim()).filter(t => t) : []
      };

      // Validar questão
      if (question.question_text && question.options.length >= 2) {
        questions.push(question);
      }
    } catch (error) {
      console.warn('Erro ao processar linha:', error, values);
    }
  }

  return questions;
};

// Parser de JSON para questões
export const parseJSONQuestions = (jsonText) => {
  try {
    const data = JSON.parse(jsonText);
    if (!Array.isArray(data)) {
      throw new Error('JSON deve ser um array de questões');
    }

    return data.map(q => ({
      question_text: q.question_text || '',
      options: Array.isArray(q.options) ? q.options : [],
      correct_answer: q.correct_answer || 0,
      difficulty: q.difficulty || 'medium',
      grade_level: q.grade_level || 7,
      points: q.points || 10,
      explanation: q.explanation || '',
      tags: Array.isArray(q.tags) ? q.tags : []
    })).filter(q => q.question_text && q.options.length >= 2);
  } catch (error) {
    throw new Error('Erro ao processar JSON: ' + error.message);
  }
};

// Função auxiliar para parsear linha CSV (considerando vírgulas dentro de aspas)
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Aspas duplas escapadas
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Vírgula fora de aspas = separador
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar último valor
  values.push(current.trim());
  
  return values;
};

// Converter letra (A, B, C, D) para índice (0, 1, 2, 3)
const getCorrectAnswerIndex = (letter) => {
  const upper = letter.toUpperCase().trim();
  const index = upper.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  return Math.max(0, Math.min(3, index));
};

// Validar questões antes de importar
export const validateQuestions = (questions) => {
  const errors = [];
  const validQuestions = [];

  questions.forEach((q, index) => {
    const questionErrors = [];

    if (!q.question_text || q.question_text.trim().length < 10) {
      questionErrors.push('Questão deve ter pelo menos 10 caracteres');
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      questionErrors.push('Questão deve ter pelo menos 2 opções');
    }

    if (q.options.some(opt => !opt || !opt.trim())) {
      questionErrors.push('Todas as opções devem estar preenchidas');
    }

    if (q.correct_answer < 0 || q.correct_answer >= q.options.length) {
      questionErrors.push('Resposta correta inválida');
    }

    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      questionErrors.push('Dificuldade deve ser: easy, medium ou hard');
    }

    if (q.grade_level < 1 || q.grade_level > 12) {
      questionErrors.push('Série deve estar entre 1 e 12');
    }

    if (questionErrors.length > 0) {
      errors.push({
        index: index + 1,
        question: q.question_text.substring(0, 50) + '...',
        errors: questionErrors
      });
    } else {
      validQuestions.push(q);
    }
  });

  return {
    validQuestions,
    errors,
    total: questions.length,
    valid: validQuestions.length,
    invalid: errors.length
  };
};

