import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Exportar relatório de desempenho do aluno em PDF
export const exportStudentReportPDF = (studentData, reportData, childName) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Relatório de Desempenho', 105, 20, { align: 'center' });
  
  // Informações do aluno
  doc.setFontSize(12);
  doc.text(`Aluno: ${childName || 'N/A'}`, 20, 35);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 42);
  
  // Estatísticas gerais
  doc.setFontSize(14);
  doc.text('Estatísticas Gerais', 20, 55);
  
  const stats = reportData?.stats || studentData?.stats || {};
  const statsData = [
    ['Total de Quizzes', stats.totalQuizzes || 0],
    ['Média de Aproveitamento', `${Math.round(stats.avgScore || 0)}%`],
    ['Pontos Totais', stats.totalPoints || 0],
    ['Nível', stats.level || 1],
    ['Tempo de Estudo', formatTime(stats.studyTimeSeconds || 0)],
    ['Dias de Sequência', stats.streakDays || 0],
  ];
  
  doc.autoTable({
    startY: 60,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [147, 51, 234] },
  });
  
  // Desempenho por matéria
  if (reportData?.subjectPerformance && reportData.subjectPerformance.length > 0) {
    doc.setFontSize(14);
    doc.text('Desempenho por Matéria', 20, doc.lastAutoTable.finalY + 15);
    
    const subjectData = reportData.subjectPerformance.map((item) => [
      item.subject?.name || 'N/A',
      `${Math.round(item.avgScore || 0)}%`,
      item.quizzesCompleted || 0,
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Matéria', 'Média', 'Quizzes Completados']],
      body: subjectData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [147, 51, 234] },
    });
  }
  
  // Atividade semanal
  if (reportData?.dailyActivity && reportData.dailyActivity.length > 0) {
    doc.setFontSize(14);
    doc.text('Atividade Semanal', 20, doc.lastAutoTable.finalY + 15);
    
    const activityData = reportData.dailyActivity.map((day) => [
      new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      day.quizzes || 0,
      formatTime(day.time || 0),
      day.points || 0,
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Dia', 'Quizzes', 'Tempo', 'Pontos']],
      body: activityData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [147, 51, 234] },
    });
  }
  
  // Rodapé
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'EduQuest Kids - Sistema de Estudo Gamificado',
      105,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }
  
  // Salvar PDF
  const fileName = `Relatorio_${childName || 'Aluno'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Exportar relatório de quizzes do professor em PDF
export const exportTeacherReportPDF = (teacherData, quizzesData, studentsData) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Relatório do Professor', 105, 20, { align: 'center' });
  
  // Informações do professor
  doc.setFontSize(12);
  doc.text(`Professor: ${teacherData?.name || 'N/A'}`, 20, 35);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 42);
  
  // Estatísticas gerais
  doc.setFontSize(14);
  doc.text('Estatísticas Gerais', 20, 55);
  
  const statsData = [
    ['Questões Criadas', teacherData?.stats?.questionsCreated || 0],
    ['Quizzes Criados', teacherData?.stats?.quizzesCreated || 0],
    ['Alunos Ativos', teacherData?.stats?.activeStudents || 0],
    ['Média da Turma', `${Math.round(teacherData?.stats?.avgClassScore || 0)}%`],
  ];
  
  doc.autoTable({
    startY: 60,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [147, 51, 234] },
  });
  
  // Lista de quizzes
  if (quizzesData && quizzesData.length > 0) {
    doc.setFontSize(14);
    doc.text('Quizzes Criados', 20, doc.lastAutoTable.finalY + 15);
    
    const quizzesTableData = quizzesData.slice(0, 10).map((quiz) => [
      quiz.title || 'Sem título',
      quiz.subjects?.name || 'N/A',
      quiz.grade_level ? `${quiz.grade_level}ª série` : 'N/A',
      quiz.attempts || 0,
      `${quiz.avgScore || 0}%`,
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Título', 'Matéria', 'Série', 'Tentativas', 'Média']],
      body: quizzesTableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [147, 51, 234] },
    });
  }
  
  // Lista de alunos
  if (studentsData && studentsData.length > 0) {
    doc.setFontSize(14);
    doc.text('Desempenho dos Alunos', 20, doc.lastAutoTable.finalY + 15);
    
    const studentsTableData = studentsData.slice(0, 15).map((student) => [
      student.name || 'N/A',
      student.grade ? `${student.grade}ª série` : 'N/A',
      student.quizzesCompleted || 0,
      `${student.avgScore || 0}%`,
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Aluno', 'Série', 'Quizzes', 'Média']],
      body: studentsTableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [147, 51, 234] },
    });
  }
  
  // Rodapé
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'EduQuest Kids - Sistema de Estudo Gamificado',
      105,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }
  
  // Salvar PDF
  const fileName = `Relatorio_Professor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Função auxiliar para formatar tempo
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

