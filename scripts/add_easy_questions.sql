-- =====================================================
-- EDUQUEST KIDS - 20 QUESTÕES DE MATEMÁTICA (FÁCIL)
-- =====================================================

-- Verificar se a matéria de Matemática existe
DO $$
DECLARE
  v_subject_id UUID;
  v_grade_level INTEGER := 6; -- 6º ano
BEGIN
  -- Buscar ID da matéria Matemática
  SELECT id INTO v_subject_id 
  FROM public.subjects 
  WHERE LOWER(name) LIKE '%matem%' 
  LIMIT 1;

  -- Se não encontrou, criar
  IF v_subject_id IS NULL THEN
    INSERT INTO public.subjects (name, icon, color, description)
    VALUES ('Matemática', '🔢', 'bg-blue-500', 'Matemática - Cálculos e Problemas')
    RETURNING id INTO v_subject_id;
    
    RAISE NOTICE 'Matéria Matemática criada: %', v_subject_id;
  ELSE
    RAISE NOTICE 'Matéria Matemática encontrada: %', v_subject_id;
  END IF;

  -- =====================================================
  -- INSERIR AS 20 QUESTÕES
  -- =====================================================

  -- Questão 1
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'João tinha R$ 10,00 e gastou R$ 4,00 em um lanche. Quanto sobrou?',
    '["R$ 3,00", "R$ 4,50", "R$ 6,00", "R$ 5,00"]',
    2, -- Índice da resposta correta (começando em 0)
    'R$ 10,00 - R$ 4,00 = R$ 6,00',
    10, TRUE, NOW()
  );

  -- Questão 2
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Maria comprou 5 balas, cada uma custando R$ 0,50. Quanto ela pagou?',
    '["R$ 1,50", "R$ 2,50", "R$ 3,00", "R$ 5,00"]',
    1,
    '5 × R$ 0,50 = R$ 2,50',
    10, TRUE, NOW()
  );

  -- Questão 3
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 8 × 6?',
    '["42", "48", "56", "38"]',
    1,
    '8 × 6 = 48',
    10, TRUE, NOW()
  );

  -- Questão 4
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Um pacote tem 12 biscoitos. Pedro comeu 4. Quantos restam?',
    '["6", "8", "10", "4"]',
    1,
    '12 - 4 = 8 biscoitos',
    10, TRUE, NOW()
  );

  -- Questão 5
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 45 ÷ 5?',
    '["5", "8", "9", "12"]',
    2,
    '45 ÷ 5 = 9',
    10, TRUE, NOW()
  );

  -- Questão 6
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Ana tinha 20 reais. Comprou um lanche de R$ 12,00. Quanto sobrou?',
    '["R$ 6,00", "R$ 7,00", "R$ 8,00", "R$ 10,00"]',
    2,
    'R$ 20,00 - R$ 12,00 = R$ 8,00',
    10, TRUE, NOW()
  );

  -- Questão 7
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 9 + 18?',
    '["25", "26", "27", "28"]',
    2,
    '9 + 18 = 27',
    10, TRUE, NOW()
  );

  -- Questão 8
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Qual é o dobro de 14?',
    '["20", "18", "28", "32"]',
    2,
    '14 × 2 = 28',
    10, TRUE, NOW()
  );

  -- Questão 9
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Lucas comprou 3 pães por R$ 1,00 cada. Quanto gastou?',
    '["R$ 1,00", "R$ 2,00", "R$ 3,00", "R$ 4,00"]',
    2,
    '3 × R$ 1,00 = R$ 3,00',
    10, TRUE, NOW()
  );

  -- Questão 10
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 50 – 17?',
    '["27", "33", "35", "37"]',
    1,
    '50 - 17 = 33',
    10, TRUE, NOW()
  );

  -- Questão 11
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Paula tinha 30 figurinhas e deu 10 para um amigo. Com quantas ficou?',
    '["15", "20", "25", "10"]',
    1,
    '30 - 10 = 20 figurinhas',
    10, TRUE, NOW()
  );

  -- Questão 12
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 7 × 4?',
    '["21", "28", "32", "14"]',
    1,
    '7 × 4 = 28',
    10, TRUE, NOW()
  );

  -- Questão 13
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'O triplo de 5 é:',
    '["10", "12", "15", "20"]',
    2,
    '5 × 3 = 15',
    10, TRUE, NOW()
  );

  -- Questão 14
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Se um lápis custa R$ 2,00, quanto custam 3 lápis?',
    '["R$ 3,00", "R$ 5,00", "R$ 6,00", "R$ 8,00"]',
    2,
    '3 × R$ 2,00 = R$ 6,00',
    10, TRUE, NOW()
  );

  -- Questão 15
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 100 – 25?',
    '["65", "75", "80", "85"]',
    1,
    '100 - 25 = 75',
    10, TRUE, NOW()
  );

  -- Questão 16
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Um ônibus tem 40 lugares. Se 25 estão ocupados, quantos estão livres?',
    '["10", "15", "18", "20"]',
    1,
    '40 - 25 = 15 lugares livres',
    10, TRUE, NOW()
  );

  -- Questão 17
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 6 × 9?',
    '["45", "54", "64", "36"]',
    1,
    '6 × 9 = 54',
    10, TRUE, NOW()
  );

  -- Questão 18
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Qual é a metade de 50?',
    '["10", "20", "25", "30"]',
    2,
    '50 ÷ 2 = 25',
    10, TRUE, NOW()
  );

  -- Questão 19
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Pedro comprou 2 hambúrgueres de R$ 9,00 cada. Quanto pagou?',
    '["R$ 9,00", "R$ 18,00", "R$ 20,00", "R$ 16,00"]',
    1,
    '2 × R$ 9,00 = R$ 18,00',
    10, TRUE, NOW()
  );

  -- Questão 20
  INSERT INTO public.questions (
    subject_id, grade_level, difficulty, question_text, options, 
    correct_answer, explanation, points, is_approved, created_at
  ) VALUES (
    v_subject_id, v_grade_level, 'easy',
    'Quanto é 72 ÷ 8?',
    '["8", "9", "10", "6"]',
    1,
    '72 ÷ 8 = 9',
    10, TRUE, NOW()
  );

  RAISE NOTICE '✅ 20 questões de nível FÁCIL adicionadas com sucesso!';
END $$;

