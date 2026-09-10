import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { questions } from '../data/questions';
import { careers } from '../data/careers';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../services/supabase';

export default function Test() {
  const { t, langCode } = useLanguage();
  const navigate = useNavigate();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const q = questions[currentIdx];
  const total = questions.length;
  
  const isUz = langCode === 'uz';
  const questionText = isUz ? q.questionUz : q.questionRu;

  useEffect(() => {
    const sid = localStorage.getItem('studentId');
    if (!sid) navigate('/');
  }, []);

  const handleSelect = (idx) => {
    setAnswers({ ...answers, [q.id]: idx });
    setError('');
  };

  const handleNext = async () => {
    if (answers[q.id] === undefined) {
      setError(t.selectAnswerError);
      return;
    }

    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      await finishTest();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setError('');
    }
  };

  const finishTest = async () => {
    setSubmitting(true);
    try {
      const studentId = localStorage.getItem('studentId');
      
      // Calculate scores
      const scores = {}; // careerId -> score
      careers.forEach(c => scores[c.id] = 0);
      
      const inserts = [];
      
      for (const qObj of questions) {
        const selectedOptIdx = answers[qObj.id];
        const selectedOpt = qObj.options[selectedOptIdx];
        
        scores[selectedOpt.careerId] += 1;
        
        inserts.push({
          student_id: studentId,
          question_id: qObj.id,
          answer_id: selectedOptIdx
        });
      }
      
      // Find highest score and handle ties fairly
      let maxScore = -1;
      let topCandidates = [];
      for (const [cId, score] of Object.entries(scores)) {
        if (score > maxScore) {
          maxScore = score;
          topCandidates = [parseInt(cId)];
        } else if (score === maxScore) {
          topCandidates.push(parseInt(cId));
        }
      }
      
      // Agar bir nechta soha bir xil eng yuqori ball olgan bo'lsa, ulardan birini tasodifiy tanlaymiz
      const topCareerId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
      
      const topCareer = careers.find(c => c.id === topCareerId);
      const interestName = isUz ? topCareer.nameUz : topCareer.nameRu;
      
      // Vaqtincha test qilish uchun (Supabase ulanmagan bo'lsa)
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Save answers
        const mockAnswers = JSON.parse(localStorage.getItem('mock_answers') || '[]');
        mockAnswers.push(...inserts);
        localStorage.setItem('mock_answers', JSON.stringify(mockAnswers));

        // Update student
        const mockStudents = JSON.parse(localStorage.getItem('mock_students') || '[]');
        const updatedStudents = mockStudents.map(s => {
          if (s.id === studentId) {
            return {
              ...s,
              test_completed: true,
              interest_area: interestName,
              test_completed_at: new Date().toISOString()
            };
          }
          return s;
        });
        localStorage.setItem('mock_students', JSON.stringify(updatedStudents));

        localStorage.setItem('resultCareerId', topCareerId);
        navigate('/result');
        return;
      }

      // Save to Supabase
      await supabase.from('test_answers').insert(inserts);
      
      await supabase.from('students').update({
        test_completed: true,
        interest_area: interestName,
        test_completed_at: new Date().toISOString()
      }).eq('id', studentId);
      
      // Save result locally for Result screen
      localStorage.setItem('resultCareerId', topCareerId);
      navigate('/result');
      
    } catch (err) {
      console.error(err);
      setError("Error submitting test");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container slide-up">
      <div className="glass-panel content-box" style={{ maxWidth: '600px' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
          {t.questionPrefix} {currentIdx + 1} / {total}
        </h4>
        
        <ProgressBar current={currentIdx + 1} total={total} />
        
        <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', lineHeight: '1.5' }}>
          {questionText}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {q.options.map((opt, idx) => {
            const isSelected = answers[q.id] === idx;
            return (
              <div 
                key={idx}
                onClick={() => handleSelect(idx)}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.05)'}`,
                  background: isSelected ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isUz ? opt.textUz : opt.textRu}
              </div>
            );
          })}
        </div>

        {error && <div className="error-text">{error}</div>}
        
        <div style={{ display: 'flex', gap: '16px' }}>
          {currentIdx > 0 && (
            <button className="btn-secondary" onClick={handlePrev} disabled={submitting}>
              {t.prevBtn}
            </button>
          )}
          <button className="btn-primary" onClick={handleNext} disabled={submitting}>
            {submitting ? '...' : (currentIdx === total - 1 ? t.finishBtn : t.nextBtn)}
          </button>
        </div>
      </div>
    </div>
  );
}
