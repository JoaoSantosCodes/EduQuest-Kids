-- ============================================
-- OTIMIZAÇÃO FINAL DE POLÍTICAS RLS
-- Substituir auth.uid() por (select auth.uid())
-- para melhorar performance em escala
-- ============================================

-- ============================================
-- CLASSROOM_STUDENTS
-- ============================================

-- Parents can view children classrooms
DROP POLICY IF EXISTS "Parents can view children classrooms" ON classroom_students;
CREATE POLICY "Parents can view children classrooms" ON classroom_students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = classroom_students.student_id
  )
);

-- Students can view own classrooms
DROP POLICY IF EXISTS "Students can view own classrooms" ON classroom_students;
CREATE POLICY "Students can view own classrooms" ON classroom_students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = classroom_students.student_id
  )
);

-- Teachers can remove students from classrooms
DROP POLICY IF EXISTS "Teachers can remove students from classrooms" ON classroom_students;
CREATE POLICY "Teachers can remove students from classrooms" ON classroom_students
FOR DELETE USING (
  (EXISTS (
    SELECT 1
    FROM classrooms
    JOIN teachers ON teachers.id = classrooms.teacher_id
    JOIN users ON users.id = teachers.user_id
    WHERE users.id = (select auth.uid()) 
    AND classrooms.id = classroom_students.classroom_id
  )) OR (EXISTS (
    SELECT 1
    FROM classroom_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE u.id = (select auth.uid()) 
    AND ct.classroom_id = classroom_students.classroom_id 
    AND ct.is_active = true
  ))
);

-- Teachers can view classroom students
DROP POLICY IF EXISTS "Teachers can view classroom students" ON classroom_students;
CREATE POLICY "Teachers can view classroom students" ON classroom_students
FOR SELECT USING (
  (EXISTS (
    SELECT 1
    FROM classrooms
    JOIN teachers ON teachers.id = classrooms.teacher_id
    JOIN users ON users.id = teachers.user_id
    WHERE users.id = (select auth.uid()) 
    AND classrooms.id = classroom_students.classroom_id
  )) OR (EXISTS (
    SELECT 1
    FROM classroom_teachers ct
    JOIN teachers t ON t.id = ct.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE u.id = (select auth.uid()) 
    AND ct.classroom_id = classroom_students.classroom_id 
    AND ct.is_active = true
  ))
);

-- ============================================
-- CLASSROOM_TEACHERS
-- ============================================

-- Coordinators can remove classroom teachers
DROP POLICY IF EXISTS "Coordinators can remove classroom teachers" ON classroom_teachers;
CREATE POLICY "Coordinators can remove classroom teachers" ON classroom_teachers
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Coordinators can update classroom teachers
DROP POLICY IF EXISTS "Coordinators can update classroom teachers" ON classroom_teachers;
CREATE POLICY "Coordinators can update classroom teachers" ON classroom_teachers
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Coordinators can view all classroom teachers
DROP POLICY IF EXISTS "Coordinators can view all classroom teachers" ON classroom_teachers;
CREATE POLICY "Coordinators can view all classroom teachers" ON classroom_teachers
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Teachers can view own classroom assignments
DROP POLICY IF EXISTS "Teachers can view own classroom assignments" ON classroom_teachers;
CREATE POLICY "Teachers can view own classroom assignments" ON classroom_teachers
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE u.id = (select auth.uid()) 
    AND t.id = classroom_teachers.teacher_id
  )
);

-- ============================================
-- CLASSROOMS
-- ============================================

-- Coordinators can delete all classrooms
DROP POLICY IF EXISTS "Coordinators can delete all classrooms" ON classrooms;
CREATE POLICY "Coordinators can delete all classrooms" ON classrooms
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Coordinators can update all classrooms
DROP POLICY IF EXISTS "Coordinators can update all classrooms" ON classrooms;
CREATE POLICY "Coordinators can update all classrooms" ON classrooms
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Coordinators can view all classrooms
DROP POLICY IF EXISTS "Coordinators can view all classrooms" ON classrooms;
CREATE POLICY "Coordinators can view all classrooms" ON classrooms
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator'
  )
);

-- Teachers can delete own classrooms
DROP POLICY IF EXISTS "Teachers can delete own classrooms" ON classrooms;
CREATE POLICY "Teachers can delete own classrooms" ON classrooms
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM teachers
    WHERE teachers.user_id = (select auth.uid()) 
    AND teachers.id = classrooms.teacher_id
  )
);

-- Teachers can update own classrooms
DROP POLICY IF EXISTS "Teachers can update own classrooms" ON classrooms;
CREATE POLICY "Teachers can update own classrooms" ON classrooms
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM teachers
    WHERE teachers.user_id = (select auth.uid()) 
    AND teachers.id = classrooms.teacher_id
  )
);

-- Teachers can view own classrooms
DROP POLICY IF EXISTS "Teachers can view own classrooms" ON classrooms;
CREATE POLICY "Teachers can view own classrooms" ON classrooms
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM teachers
    WHERE teachers.user_id = (select auth.uid()) 
    AND teachers.id = classrooms.teacher_id
  )
);

-- ============================================
-- COORDINATORS
-- ============================================

-- Coordinators can update own data
DROP POLICY IF EXISTS "Coordinators can update own data" ON coordinators;
CREATE POLICY "Coordinators can update own data" ON coordinators
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator' 
    AND users.id = coordinators.user_id
  )
);

-- Coordinators can view own data
DROP POLICY IF EXISTS "Coordinators can view own data" ON coordinators;
CREATE POLICY "Coordinators can view own data" ON coordinators
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM users
    WHERE users.id = (select auth.uid()) 
    AND users.role = 'coordinator' 
    AND users.id = coordinators.user_id
  )
);

-- ============================================
-- MESSAGES
-- ============================================

-- Users can update sent messages
DROP POLICY IF EXISTS "Users can update sent messages" ON messages;
CREATE POLICY "Users can update sent messages" ON messages
FOR UPDATE USING ((select auth.uid()) = from_user_id);

-- Users can view own messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
FOR SELECT USING (((select auth.uid()) = from_user_id) OR ((select auth.uid()) = to_user_id));

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Users can update own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE USING ((select auth.uid()) = user_id);

-- Users can view own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING ((select auth.uid()) = user_id);

-- ============================================
-- PARENT_STUDENT_RELATION
-- ============================================

-- Parents can view own relations
DROP POLICY IF EXISTS "Parents can view own relations" ON parent_student_relation;
CREATE POLICY "Parents can view own relations" ON parent_student_relation
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parents
    WHERE parents.user_id = (select auth.uid()) 
    AND parents.id = parent_student_relation.parent_id
  )
);

-- ============================================
-- PARENTAL_CONTROLS
-- ============================================

-- Parents can manage own controls
DROP POLICY IF EXISTS "Parents can manage own controls" ON parental_controls;
CREATE POLICY "Parents can manage own controls" ON parental_controls
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM parents
    WHERE parents.user_id = (select auth.uid()) 
    AND parents.id = parental_controls.parent_id
  )
);

-- Parents can view own controls
DROP POLICY IF EXISTS "Parents can view own controls" ON parental_controls;
CREATE POLICY "Parents can view own controls" ON parental_controls
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parents
    WHERE parents.user_id = (select auth.uid()) 
    AND parents.id = parental_controls.parent_id
  )
);

-- ============================================
-- PARENTS
-- ============================================
-- Já estão otimizadas (usam (select auth.uid()))

-- ============================================
-- QUESTIONS
-- ============================================
-- Já estão otimizadas (usam (select auth.uid()))

-- ============================================
-- QUIZ_ATTEMPTS
-- ============================================

-- Parents can view children attempts
DROP POLICY IF EXISTS "Parents can view children attempts" ON quiz_attempts;
CREATE POLICY "Parents can view children attempts" ON quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = quiz_attempts.student_id
  )
);

-- Students can update own attempts
DROP POLICY IF EXISTS "Students can update own attempts" ON quiz_attempts;
CREATE POLICY "Students can update own attempts" ON quiz_attempts
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = quiz_attempts.student_id
  )
);

-- Students can view own attempts
DROP POLICY IF EXISTS "Students can view own attempts" ON quiz_attempts;
CREATE POLICY "Students can view own attempts" ON quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = quiz_attempts.student_id
  )
);

-- Teachers can view attempts of own quizzes
DROP POLICY IF EXISTS "Teachers can view attempts of own quizzes" ON quiz_attempts;
CREATE POLICY "Teachers can view attempts of own quizzes" ON quiz_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM quizzes
    JOIN teachers ON teachers.id = quizzes.teacher_id
    WHERE teachers.user_id = (select auth.uid()) 
    AND quizzes.id = quiz_attempts.quiz_id
  )
);

-- ============================================
-- QUIZ_QUESTIONS
-- ============================================

-- Teachers can delete quiz questions
DROP POLICY IF EXISTS "Teachers can delete quiz questions" ON quiz_questions;
CREATE POLICY "Teachers can delete quiz questions" ON quiz_questions
FOR DELETE USING (
  EXISTS (
    SELECT 1
    FROM quizzes
    JOIN teachers ON teachers.id = quizzes.teacher_id
    JOIN users ON users.id = teachers.user_id
    WHERE users.id = (select auth.uid()) 
    AND quizzes.id = quiz_questions.quiz_id
  )
);

-- Teachers can update quiz questions
DROP POLICY IF EXISTS "Teachers can update quiz questions" ON quiz_questions;
CREATE POLICY "Teachers can update quiz questions" ON quiz_questions
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM quizzes
    JOIN teachers ON teachers.id = quizzes.teacher_id
    JOIN users ON users.id = teachers.user_id
    WHERE users.id = (select auth.uid()) 
    AND quizzes.id = quiz_questions.quiz_id
  )
);

-- Teachers can view quiz questions
DROP POLICY IF EXISTS "Teachers can view quiz questions" ON quiz_questions;
CREATE POLICY "Teachers can view quiz questions" ON quiz_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM quizzes
    JOIN teachers ON teachers.id = quizzes.teacher_id
    JOIN users ON users.id = teachers.user_id
    WHERE users.id = (select auth.uid()) 
    AND quizzes.id = quiz_questions.quiz_id
  )
);

-- ============================================
-- QUIZZES
-- ============================================

-- Teachers can update own quizzes
DROP POLICY IF EXISTS "Teachers can update own quizzes" ON quizzes;
CREATE POLICY "Teachers can update own quizzes" ON quizzes
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM teachers
    WHERE teachers.user_id = (select auth.uid()) 
    AND teachers.id = quizzes.teacher_id
  )
);

-- Teachers can view own quizzes
-- Já está otimizada (usa (select auth.uid()))

-- ============================================
-- STUDENT_ACHIEVEMENTS
-- ============================================

-- Parents can view children achievements
DROP POLICY IF EXISTS "Parents can view children achievements" ON student_achievements;
CREATE POLICY "Parents can view children achievements" ON student_achievements
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = student_achievements.student_id
  )
);

-- Students can view own achievements
DROP POLICY IF EXISTS "Students can view own achievements" ON student_achievements;
CREATE POLICY "Students can view own achievements" ON student_achievements
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = student_achievements.student_id
  )
);

-- ============================================
-- STUDENTS
-- ============================================

-- Parents can view own children
DROP POLICY IF EXISTS "Parents can view own children" ON students;
CREATE POLICY "Parents can view own children" ON students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = students.id
  )
);

-- Students can update own data
-- Já está otimizada (usa (select auth.uid()))

-- Students can view own data
-- Já está otimizada (usa (select auth.uid()))

-- Teachers can view students
DROP POLICY IF EXISTS "Teachers can view students" ON students;
CREATE POLICY "Teachers can view students" ON students
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM teachers
    WHERE teachers.user_id = (select auth.uid())
  )
);

-- ============================================
-- STUDY_PLANS
-- ============================================

-- Parents can view children plans
DROP POLICY IF EXISTS "Parents can view children plans" ON study_plans;
CREATE POLICY "Parents can view children plans" ON study_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = study_plans.student_id
  )
);

-- Students can view own plans
DROP POLICY IF EXISTS "Students can view own plans" ON study_plans;
CREATE POLICY "Students can view own plans" ON study_plans
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = study_plans.student_id
  )
);

-- ============================================
-- STUDY_SESSIONS
-- ============================================

-- Parents can view children sessions
DROP POLICY IF EXISTS "Parents can view children sessions" ON study_sessions;
CREATE POLICY "Parents can view children sessions" ON study_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM parent_student_relation psr
    JOIN parents p ON p.id = psr.parent_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = (select auth.uid()) 
    AND psr.student_id = study_sessions.student_id
  )
);

-- Students can update own sessions
DROP POLICY IF EXISTS "Students can update own sessions" ON study_sessions;
CREATE POLICY "Students can update own sessions" ON study_sessions
FOR UPDATE USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = study_sessions.student_id
  )
);

-- Students can view own sessions
DROP POLICY IF EXISTS "Students can view own sessions" ON study_sessions;
CREATE POLICY "Students can view own sessions" ON study_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM students
    WHERE students.user_id = (select auth.uid()) 
    AND students.id = study_sessions.student_id
  )
);

-- ============================================
-- TEACHERS
-- ============================================
-- Já estão otimizadas (usam (select auth.uid()))

-- ============================================
-- USERS
-- ============================================
-- Já estão otimizadas (usam (select auth.uid()))

-- ============================================
-- CONCLUSÃO
-- ============================================
-- Todas as políticas RLS foram otimizadas!
-- Performance melhorada em escala significativamente.

