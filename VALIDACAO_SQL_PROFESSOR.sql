-- ============================================
-- SCRIPT DE VALIDAÇÃO - PORTAL DO PROFESSOR
-- ============================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ============================================

\echo '🔍 1. VERIFICANDO ESTRUTURA DAS TABELAS...'

-- Verificar tabela teachers
SELECT 
  'teachers' as tabela,
  COUNT(*) as total_registros
FROM teachers;

-- Verificar tabela classroom_teachers
SELECT 
  'classroom_teachers' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
FROM classroom_teachers;

-- Verificar tabela attendance
SELECT 
  'attendance' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN date = CURRENT_DATE THEN 1 END) as hoje
FROM attendance;

-- Verificar tabela grades
SELECT 
  'grades' as tabela,
  COUNT(*) as total_registros
FROM grades;

-- Verificar tabela announcements
SELECT 
  'announcements' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_published = true THEN 1 END) as publicados
FROM announcements;

-- Verificar tabela learning_materials
SELECT 
  'learning_materials' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_public = true THEN 1 END) as publicos
FROM learning_materials;

-- Verificar tabela assignments
SELECT 
  'assignments' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_published = true THEN 1 END) as publicados
FROM assignments;

-- Verificar tabela assignment_submissions
SELECT 
  'assignment_submissions' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN status = 'graded' THEN 1 END) as avaliados
FROM assignment_submissions;

-- Verificar tabela calendar_events
SELECT 
  'calendar_events' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN start_date >= CURRENT_DATE THEN 1 END) as futuros
FROM calendar_events;

\echo ''
\echo '✅ Estrutura das tabelas verificada!'
\echo ''

-- 2. VERIFICAR DADOS DO PROFESSOR
-- ============================================

\echo '🔍 2. VERIFICANDO DADOS DO PROFESSOR...'

-- Buscar professor específico
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  u.role,
  t.id as teacher_id,
  t.created_at as cadastrado_em
FROM users u
JOIN teachers t ON t.user_id = u.id
WHERE u.email = 'supernerdconectado@gmail.com';

\echo ''
\echo '✅ Dados do professor verificados!'
\echo ''

-- 3. VERIFICAR TURMAS DO PROFESSOR
-- ============================================

\echo '🔍 3. VERIFICANDO TURMAS DO PROFESSOR...'

SELECT 
  c.id,
  c.name as turma,
  c.grade as serie,
  c.shift as turno,
  c.school_year as ano_letivo,
  ct.is_primary as principal,
  ct.is_active as ativo,
  (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as total_alunos
FROM classrooms c
JOIN classroom_teachers ct ON ct.classroom_id = c.id
JOIN teachers t ON t.id = ct.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
AND ct.is_active = true
ORDER BY c.grade, c.name;

\echo ''
\echo '✅ Turmas do professor verificadas!'
\echo ''

-- 4. VERIFICAR ALUNOS DO PROFESSOR
-- ============================================

\echo '🔍 4. VERIFICANDO ALUNOS DO PROFESSOR...'

SELECT DISTINCT
  s.id,
  u.name as aluno,
  s.enrollment_number as matricula,
  u.email,
  c.name as turma,
  c.grade as serie
FROM students s
JOIN users u ON u.id = s.user_id
JOIN classroom_students cs ON cs.student_id = s.id
JOIN classrooms c ON c.id = cs.classroom_id
JOIN classroom_teachers ct ON ct.classroom_id = c.id
JOIN teachers t ON t.id = ct.teacher_id
JOIN users tu ON tu.id = t.user_id
WHERE tu.email = 'supernerdconectado@gmail.com'
AND ct.is_active = true
ORDER BY c.grade, c.name, u.name
LIMIT 10;

\echo ''
\echo '✅ Alunos do professor verificados!'
\echo ''

-- 5. VERIFICAR MATÉRIAS DO PROFESSOR
-- ============================================

\echo '🔍 5. VERIFICANDO MATÉRIAS DO PROFESSOR...'

SELECT 
  s.id,
  s.name as materia,
  s.icon,
  s.color
FROM subjects s
JOIN teacher_subjects ts ON ts.subject_id = s.id
JOIN teachers t ON t.id = ts.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
ORDER BY s.name;

\echo ''
\echo '✅ Matérias do professor verificadas!'
\echo ''

-- 6. VERIFICAR FREQUÊNCIA
-- ============================================

\echo '🔍 6. VERIFICANDO FREQUÊNCIA...'

-- Frequência dos últimos 7 dias
SELECT 
  a.date as data,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END) as presentes,
  COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as faltas,
  COUNT(CASE WHEN a.status = 'late' THEN 1 END) as atrasos,
  COUNT(CASE WHEN a.status = 'justified' THEN 1 END) as justificadas
FROM attendance a
JOIN teachers t ON t.id = a.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
AND a.date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY a.date
ORDER BY a.date DESC;

\echo ''
\echo '✅ Frequência verificada!'
\echo ''

-- 7. VERIFICAR NOTAS
-- ============================================

\echo '🔍 7. VERIFICANDO NOTAS...'

-- Notas recentes
SELECT 
  u.name as aluno,
  sub.name as materia,
  g.evaluation_type as tipo,
  g.grade as nota,
  g.max_grade as nota_maxima,
  g.period as periodo,
  g.evaluation_date as data
FROM grades g
JOIN students s ON s.id = g.student_id
JOIN users u ON u.id = s.user_id
LEFT JOIN subjects sub ON sub.id = g.subject_id
JOIN teachers t ON t.id = g.teacher_id
JOIN users tu ON tu.id = t.user_id
WHERE tu.email = 'supernerdconectado@gmail.com'
ORDER BY g.evaluation_date DESC
LIMIT 10;

-- Estatísticas de notas
SELECT 
  sub.name as materia,
  COUNT(*) as total_notas,
  ROUND(AVG(g.grade), 2) as media,
  MIN(g.grade) as menor_nota,
  MAX(g.grade) as maior_nota
FROM grades g
LEFT JOIN subjects sub ON sub.id = g.subject_id
JOIN teachers t ON t.id = g.teacher_id
JOIN users tu ON tu.id = t.user_id
WHERE tu.email = 'supernerdconectado@gmail.com'
GROUP BY sub.name
ORDER BY sub.name;

\echo ''
\echo '✅ Notas verificadas!'
\echo ''

-- 8. VERIFICAR AVISOS
-- ============================================

\echo '🔍 8. VERIFICANDO AVISOS...'

SELECT 
  a.title as titulo,
  a.priority as prioridade,
  c.name as turma,
  a.is_published as publicado,
  a.publish_date as data_publicacao,
  a.expires_at as expira_em
FROM announcements a
LEFT JOIN classrooms c ON c.id = a.classroom_id
JOIN teachers t ON t.id = a.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
ORDER BY a.publish_date DESC
LIMIT 10;

\echo ''
\echo '✅ Avisos verificados!'
\echo ''

-- 9. VERIFICAR MATERIAIS DIDÁTICOS
-- ============================================

\echo '🔍 9. VERIFICANDO MATERIAIS DIDÁTICOS...'

SELECT 
  lm.title as titulo,
  lm.material_type as tipo,
  lm.file_size as tamanho,
  c.name as turma,
  s.name as materia,
  lm.is_public as publico,
  lm.download_count as downloads
FROM learning_materials lm
LEFT JOIN classrooms c ON c.id = lm.classroom_id
LEFT JOIN subjects s ON s.id = lm.subject_id
JOIN teachers t ON t.id = lm.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
ORDER BY lm.created_at DESC
LIMIT 10;

\echo ''
\echo '✅ Materiais didáticos verificados!'
\echo ''

-- 10. VERIFICAR ATIVIDADES
-- ============================================

\echo '🔍 10. VERIFICANDO ATIVIDADES...'

SELECT 
  a.title as titulo,
  a.assignment_type as tipo,
  a.due_date as data_entrega,
  a.is_published as publicado,
  c.name as turma,
  (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as total_submissoes,
  (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND status = 'graded') as avaliadas
FROM assignments a
LEFT JOIN classrooms c ON c.id = a.classroom_id
JOIN teachers t ON t.id = a.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
ORDER BY a.due_date DESC
LIMIT 10;

\echo ''
\echo '✅ Atividades verificadas!'
\echo ''

-- 11. VERIFICAR SUBMISSÕES DE ATIVIDADES
-- ============================================

\echo '🔍 11. VERIFICANDO SUBMISSÕES DE ATIVIDADES...'

SELECT 
  a.title as atividade,
  u.name as aluno,
  asub.status as status,
  asub.grade as nota,
  asub.submitted_at as data_submissao,
  asub.graded_at as data_avaliacao
FROM assignment_submissions asub
JOIN assignments a ON a.id = asub.assignment_id
JOIN students s ON s.id = asub.student_id
JOIN users u ON u.id = s.user_id
JOIN teachers t ON t.id = a.teacher_id
JOIN users tu ON tu.id = t.user_id
WHERE tu.email = 'supernerdconectado@gmail.com'
ORDER BY asub.submitted_at DESC
LIMIT 10;

\echo ''
\echo '✅ Submissões verificadas!'
\echo ''

-- 12. VERIFICAR EVENTOS DO CALENDÁRIO
-- ============================================

\echo '🔍 12. VERIFICANDO EVENTOS DO CALENDÁRIO...'

SELECT 
  ce.title as titulo,
  ce.event_type as tipo,
  ce.start_date as data_inicio,
  ce.end_date as data_fim,
  ce.location as local,
  c.name as turma
FROM calendar_events ce
LEFT JOIN classrooms c ON c.id = ce.classroom_id
JOIN teachers t ON t.id = ce.teacher_id
JOIN users u ON u.id = t.user_id
WHERE u.email = 'supernerdconectado@gmail.com'
AND ce.start_date >= CURRENT_DATE
ORDER BY ce.start_date ASC
LIMIT 10;

\echo ''
\echo '✅ Eventos do calendário verificados!'
\echo ''

-- 13. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ============================================

\echo '🔍 13. VERIFICANDO POLÍTICAS RLS...'

-- Verificar políticas habilitadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN (
  'attendance',
  'grades',
  'announcements',
  'learning_materials',
  'assignments',
  'assignment_submissions',
  'calendar_events'
)
ORDER BY tablename, policyname;

\echo ''
\echo '✅ Políticas RLS verificadas!'
\echo ''

-- 14. ESTATÍSTICAS GERAIS
-- ============================================

\echo '🔍 14. ESTATÍSTICAS GERAIS...'

-- Resumo geral do professor
SELECT 
  (SELECT COUNT(*) FROM classroom_teachers ct 
   JOIN teachers t ON t.id = ct.teacher_id 
   JOIN users u ON u.id = t.user_id 
   WHERE u.email = 'supernerdconectado@gmail.com' AND ct.is_active = true) as total_turmas,
  
  (SELECT COUNT(DISTINCT s.id) FROM students s
   JOIN classroom_students cs ON cs.student_id = s.id
   JOIN classroom_teachers ct ON ct.classroom_id = cs.classroom_id
   JOIN teachers t ON t.id = ct.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com' AND ct.is_active = true) as total_alunos,
  
  (SELECT COUNT(*) FROM teacher_subjects ts
   JOIN teachers t ON t.id = ts.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_materias,
  
  (SELECT COUNT(*) FROM attendance a
   JOIN teachers t ON t.id = a.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_frequencias,
  
  (SELECT COUNT(*) FROM grades g
   JOIN teachers t ON t.id = g.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_notas,
  
  (SELECT COUNT(*) FROM announcements a
   JOIN teachers t ON t.id = a.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_avisos,
  
  (SELECT COUNT(*) FROM learning_materials lm
   JOIN teachers t ON t.id = lm.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_materiais,
  
  (SELECT COUNT(*) FROM assignments a
   JOIN teachers t ON t.id = a.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_atividades,
  
  (SELECT COUNT(*) FROM calendar_events ce
   JOIN teachers t ON t.id = ce.teacher_id
   JOIN users u ON u.id = t.user_id
   WHERE u.email = 'supernerdconectado@gmail.com') as total_eventos;

\echo ''
\echo '✅ Estatísticas gerais calculadas!'
\echo ''

-- 15. VERIFICAR INTEGRIDADE DOS DADOS
-- ============================================

\echo '🔍 15. VERIFICANDO INTEGRIDADE DOS DADOS...'

-- Verificar registros órfãos (sem FK válida)
SELECT 
  'attendance' as tabela,
  COUNT(*) as registros_orfaos
FROM attendance a
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = a.teacher_id)
   OR NOT EXISTS (SELECT 1 FROM students WHERE id = a.student_id)
   OR NOT EXISTS (SELECT 1 FROM classrooms WHERE id = a.classroom_id)

UNION ALL

SELECT 
  'grades' as tabela,
  COUNT(*) as registros_orfaos
FROM grades g
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = g.teacher_id)
   OR NOT EXISTS (SELECT 1 FROM students WHERE id = g.student_id)

UNION ALL

SELECT 
  'announcements' as tabela,
  COUNT(*) as registros_orfaos
FROM announcements a
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = a.teacher_id)

UNION ALL

SELECT 
  'learning_materials' as tabela,
  COUNT(*) as registros_orfaos
FROM learning_materials lm
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = lm.teacher_id)

UNION ALL

SELECT 
  'assignments' as tabela,
  COUNT(*) as registros_orfaos
FROM assignments a
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = a.teacher_id)

UNION ALL

SELECT 
  'calendar_events' as tabela,
  COUNT(*) as registros_orfaos
FROM calendar_events ce
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = ce.teacher_id);

\echo ''
\echo '✅ Integridade dos dados verificada!'
\echo ''

\echo '=========================================='
\echo '✅ VALIDAÇÃO COMPLETA!'
\echo '=========================================='

