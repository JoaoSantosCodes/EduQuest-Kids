-- ============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- EduQuest Kids - Supabase
-- ============================================
-- IMPORTANTE: Execute este SQL no Supabase SQL Editor
-- Depois de executar, teste todas as operações!

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relation ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE parental_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS PARA USERS
-- ============================================

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. POLÍTICAS PARA STUDENTS
-- ============================================

-- Alunos podem ver seus próprios dados
CREATE POLICY "Students can view own data"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'student'
      AND users.id = students.user_id
    )
  );

-- Alunos podem atualizar seus próprios dados
CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'student'
      AND users.id = students.user_id
    )
  );

-- Professores podem ver dados de alunos
CREATE POLICY "Teachers can view students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
    )
  );

-- Pais podem ver dados de seus filhos
CREATE POLICY "Parents can view own children"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation psr
      JOIN parents p ON p.id = psr.parent_id
      JOIN users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND psr.student_id = students.id
    )
  );

-- ============================================
-- 4. POLÍTICAS PARA PARENTS
-- ============================================

-- Pais podem ver seus próprios dados
CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'parent'
      AND users.id = parents.user_id
    )
  );

-- Pais podem atualizar seus próprios dados
CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'parent'
      AND users.id = parents.user_id
    )
  );

-- ============================================
-- 5. POLÍTICAS PARA TEACHERS
-- ============================================

-- Professores podem ver seus próprios dados
CREATE POLICY "Teachers can view own data"
  ON teachers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
      AND users.id = teachers.user_id
    )
  );

-- Professores podem atualizar seus próprios dados
CREATE POLICY "Teachers can update own data"
  ON teachers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'teacher'
      AND users.id = teachers.user_id
    )
  );

-- ============================================
-- 6. POLÍTICAS PARA SUBJECTS
-- ============================================

-- Todos os usuários autenticados podem ver matérias ativas
CREATE POLICY "Authenticated users can view active subjects"
  ON subjects FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Professores podem criar matérias (apenas admin pode aprovar)
CREATE POLICY "Teachers can create subjects"
  ON subjects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. POLÍTICAS PARA QUESTIONS
-- ============================================

-- Todos podem ver questões aprovadas e ativas
CREATE POLICY "Everyone can view approved questions"
  ON questions FOR SELECT
  USING (approved = true AND is_active = true);

-- Professores podem ver suas próprias questões (mesmo não aprovadas)
CREATE POLICY "Teachers can view own questions"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = questions.teacher_id
    )
  );

-- Professores podem criar questões
CREATE POLICY "Teachers can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = questions.teacher_id
    )
  );

-- Professores podem atualizar suas próprias questões
CREATE POLICY "Teachers can update own questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = questions.teacher_id
    )
  );

-- Professores podem deletar suas próprias questões (soft delete)
CREATE POLICY "Teachers can delete own questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = questions.teacher_id
    )
  );

-- ============================================
-- 8. POLÍTICAS PARA QUIZZES
-- ============================================

-- Todos podem ver quizzes ativos e disponíveis
CREATE POLICY "Everyone can view active quizzes"
  ON quizzes FOR SELECT
  USING (
    is_active = true
    AND status IN ('active', 'scheduled')
    AND (available_from IS NULL OR available_from <= NOW())
    AND (available_until IS NULL OR available_until >= NOW())
  );

-- Professores podem ver seus próprios quizzes (todos os status)
CREATE POLICY "Teachers can view own quizzes"
  ON quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = quizzes.teacher_id
    )
  );

-- Professores podem criar quizzes
CREATE POLICY "Teachers can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = quizzes.teacher_id
    )
  );

-- Professores podem atualizar seus próprios quizzes
CREATE POLICY "Teachers can update own quizzes"
  ON quizzes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND teachers.id = quizzes.teacher_id
    )
  );

-- ============================================
-- 9. POLÍTICAS PARA QUIZ_ATTEMPTS
-- ============================================

-- Alunos podem ver suas próprias tentativas
CREATE POLICY "Students can view own attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = quiz_attempts.student_id
    )
  );

-- Alunos podem criar tentativas
CREATE POLICY "Students can create attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = quiz_attempts.student_id
    )
  );

-- Alunos podem atualizar suas próprias tentativas
CREATE POLICY "Students can update own attempts"
  ON quiz_attempts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = quiz_attempts.student_id
    )
  );

-- Professores podem ver tentativas de seus quizzes
CREATE POLICY "Teachers can view attempts of own quizzes"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN teachers ON teachers.id = quizzes.teacher_id
      WHERE teachers.user_id = auth.uid()
      AND quizzes.id = quiz_attempts.quiz_id
    )
  );

-- Pais podem ver tentativas de seus filhos
CREATE POLICY "Parents can view children attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation psr
      JOIN parents p ON p.id = psr.parent_id
      JOIN users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND psr.student_id = quiz_attempts.student_id
    )
  );

-- ============================================
-- 10. POLÍTICAS PARA STUDY_SESSIONS
-- ============================================

-- Alunos podem ver suas próprias sessões
CREATE POLICY "Students can view own sessions"
  ON study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = study_sessions.student_id
    )
  );

-- Alunos podem criar sessões
CREATE POLICY "Students can create sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = study_sessions.student_id
    )
  );

-- Alunos podem atualizar suas próprias sessões
CREATE POLICY "Students can update own sessions"
  ON study_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = study_sessions.student_id
    )
  );

-- Pais podem ver sessões de seus filhos
CREATE POLICY "Parents can view children sessions"
  ON study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation psr
      JOIN parents p ON p.id = psr.parent_id
      JOIN users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND psr.student_id = study_sessions.student_id
    )
  );

-- ============================================
-- 11. POLÍTICAS PARA ACHIEVEMENTS
-- ============================================

-- Todos podem ver conquistas ativas
CREATE POLICY "Everyone can view active achievements"
  ON achievements FOR SELECT
  USING (is_active = true);

-- ============================================
-- 12. POLÍTICAS PARA STUDENT_ACHIEVEMENTS
-- ============================================

-- Alunos podem ver suas próprias conquistas
CREATE POLICY "Students can view own achievements"
  ON student_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = student_achievements.student_id
    )
  );

-- Sistema pode criar conquistas (via service role ou função)
-- Nota: Para permitir criação via frontend, pode precisar de uma função stored procedure

-- Pais podem ver conquistas de seus filhos
CREATE POLICY "Parents can view children achievements"
  ON student_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation psr
      JOIN parents p ON p.id = psr.parent_id
      JOIN users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND psr.student_id = student_achievements.student_id
    )
  );

-- ============================================
-- 13. POLÍTICAS PARA STUDY_PLANS
-- ============================================

-- Alunos podem ver seus próprios planos
CREATE POLICY "Students can view own plans"
  ON study_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = study_plans.student_id
    )
  );

-- Alunos, pais e professores podem criar planos
CREATE POLICY "Authorized users can create plans"
  ON study_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role = 'student'
        OR users.role = 'parent'
        OR users.role = 'teacher'
      )
    )
  );

-- Pais podem ver planos de seus filhos
CREATE POLICY "Parents can view children plans"
  ON study_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relation psr
      JOIN parents p ON p.id = psr.parent_id
      JOIN users u ON u.id = p.user_id
      WHERE u.id = auth.uid()
      AND psr.student_id = study_plans.student_id
    )
  );

-- ============================================
-- 14. POLÍTICAS PARA NOTIFICATIONS
-- ============================================

-- Usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias notificações
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 15. POLÍTICAS PARA MESSAGES
-- ============================================

-- Usuários podem ver mensagens enviadas ou recebidas
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = from_user_id
    OR auth.uid() = to_user_id
  );

-- Usuários podem criar mensagens
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Usuários podem atualizar mensagens enviadas
CREATE POLICY "Users can update sent messages"
  ON messages FOR UPDATE
  USING (auth.uid() = from_user_id);

-- ============================================
-- 16. POLÍTICAS PARA PARENTAL_CONTROLS
-- ============================================

-- Pais podem ver controles de seus filhos
CREATE POLICY "Parents can view own controls"
  ON parental_controls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.user_id = auth.uid()
      AND parents.id = parental_controls.parent_id
    )
  );

-- Pais podem criar/atualizar controles
CREATE POLICY "Parents can manage own controls"
  ON parental_controls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.user_id = auth.uid()
      AND parents.id = parental_controls.parent_id
    )
  );

-- ============================================
-- 17. POLÍTICAS PARA PARENT_STUDENT_RELATION
-- ============================================

-- Pais podem ver suas relações
CREATE POLICY "Parents can view own relations"
  ON parent_student_relation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.user_id = auth.uid()
      AND parents.id = parent_student_relation.parent_id
    )
  );

-- Pais podem criar relações (após validação)
CREATE POLICY "Parents can create relations"
  ON parent_student_relation FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.user_id = auth.uid()
      AND parents.id = parent_student_relation.parent_id
    )
  );

-- ============================================
-- 18. POLÍTICAS PARA ANALYTICS_EVENTS
-- ============================================

-- Usuários podem criar eventos de analytics
CREATE POLICY "Users can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todos os eventos (opcional - descomentar se necessário)
-- CREATE POLICY "Admin can view all analytics"
--   ON analytics_events FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM users
--       WHERE users.id = auth.uid()
--       AND users.role = 'admin'
--     )
--   );

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Após executar este SQL, TESTE todas as operações!
-- 2. Se alguma operação falhar, ajuste as políticas conforme necessário
-- 3. Para funções que precisam criar registros em nome de outros usuários,
--    considere criar stored procedures com SECURITY DEFINER
-- 4. Revise as políticas periodicamente para garantir segurança
-- 
-- ============================================

