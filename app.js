// Quiz Application Logic
class Quiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.userAnswers = [];
        this.score = 0;
        this.quizType = 'all'; // all, mcq, truefalse, or topicId
    }

    // Initialize quiz with specific type
    initializeQuiz(type) {
        this.quizType = type;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;

        if (type === 'all') {
            this.currentQuestions = [...quizData.questions];
        } else if (type === 'mcq') {
            this.currentQuestions = getMCQQuestions();
        } else if (type === 'truefalse') {
            this.currentQuestions = getTrueFalseQuestions();
        } else {
            // It's a topic ID
            this.currentQuestions = getQuestionsByTopic(type);
        }

        // Shuffle questions
        this.currentQuestions = this.currentQuestions.sort(() => Math.random() - 0.5);
        
        // Initialize user answers array
        this.userAnswers = new Array(this.currentQuestions.length).fill(null);
        
        return this.currentQuestions.length;
    }

    // Get current question
    getCurrentQuestion() {
        return this.currentQuestions[this.currentQuestionIndex];
    }

    // Submit answer
    submitAnswer(answerIndex) {
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
        this.calculateScore();
    }

    // Calculate score based on answers
    calculateScore() {
        this.score = 0;
        this.currentQuestions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correct) {
                this.score++;
            }
        });
    }

    // Get results
    getResults() {
        return {
            totalQuestions: this.currentQuestions.length,
            correctAnswers: this.score,
            incorrectAnswers: this.currentQuestions.length - this.score,
            percentage: Math.round((this.score / this.currentQuestions.length) * 100),
            answers: this.userAnswers,
            questions: this.currentQuestions
        };
    }

    // Get answer review
    getAnswerReview() {
        const review = [];
        this.currentQuestions.forEach((question, index) => {
            review.push({
                question: question.question,
                userAnswer: this.userAnswers[index],
                correctAnswer: question.correct,
                isCorrect: this.userAnswers[index] === question.correct,
                options: question.options,
                type: question.type,
                explanation: question.explanation
            });
        });
        return review;
    }

    // Move to next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    // Move to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }

    // Check if quiz is complete
    isQuizComplete() {
        return this.currentQuestionIndex === this.currentQuestions.length - 1;
    }
}

// Global quiz instance
let quiz = new Quiz();

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Start quiz
function startQuiz(type) {
    const questionCount = quiz.initializeQuiz(type);
    renderQuestion();
    showScreen('quiz-screen');
}

// Show topics selection
function showTopics() {
    const topicsGrid = document.getElementById('topics-grid');
    topicsGrid.innerHTML = '';

    quizData.topics.forEach(topic => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic-item';
        topicDiv.innerHTML = `
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
        `;
        topicDiv.onclick = () => {
            quiz.initializeQuiz(topic.id);
            renderQuestion();
            showScreen('quiz-screen');
        };
        topicsGrid.appendChild(topicDiv);
    });

    showScreen('topics-screen');
}

// Go back to home
function goHome() {
    showScreen('home-screen');
}

// Render current question
function renderQuestion() {
    const question = quiz.getCurrentQuestion();
    const questionIndex = quiz.currentQuestionIndex;
    const totalQuestions = quiz.currentQuestions.length;

    // Update counter and progress
    document.getElementById('question-counter').textContent = 
        `السؤال ${questionIndex + 1} من ${totalQuestions}`;
    
    document.getElementById('score-display').textContent = 
        `النقاط: ${quiz.score}`;
    
    const progressPercentage = ((questionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progressPercentage + '%';

    // Update question text
    document.getElementById('question-text').textContent = question.question;

    // Show question type
    const typeInfo = document.getElementById('question-type-info');
    if (question.type === 'mcq') {
        typeInfo.textContent = 'اختيار من متعدد';
        typeInfo.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
    } else {
        typeInfo.textContent = 'صواب أم خطأ';
        typeInfo.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
    }

    // Hide explanation initially
    document.getElementById('explanation-section').style.display = 'none';

    // Render options based on question type
    if (question.type === 'mcq') {
        renderMCQOptions(question, questionIndex);
        document.getElementById('mcq-options').style.display = 'flex';
        document.getElementById('tf-options').style.display = 'none';
    } else {
        document.getElementById('mcq-options').style.display = 'none';
        document.getElementById('tf-options').style.display = 'grid';
    }

    // Update navigation buttons
    document.getElementById('btn-prev').disabled = questionIndex === 0;
    document.getElementById('btn-next').textContent = 
        questionIndex === totalQuestions - 1 ? 'إنهاء ✓' : 'التالي →';
}

// Render MCQ options
function renderMCQOptions(question, questionIndex) {
    const container = document.getElementById('mcq-options');
    container.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        
        if (quiz.userAnswers[questionIndex] === index) {
            optionDiv.classList.add('selected');
        }

        optionDiv.innerHTML = `
            <span class="option-label">${String.fromCharCode(65 + index)}</span>
            <span>${option}</span>
        `;
        
        optionDiv.onclick = () => {
            // Remove previous selection
            container.querySelectorAll('.option-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Select new option
            optionDiv.classList.add('selected');
            quiz.submitAnswer(index);
            updateScoreDisplay();
        };

        container.appendChild(optionDiv);
    });
}

// Answer True/False
function answerTrueFalse(answer) {
    const answerIndex = answer ? 1 : 0;
    quiz.submitAnswer(answerIndex);
    updateScoreDisplay();
}

// Show explanation
function showExplanation() {
    const question = quiz.getCurrentQuestion();
    const explanationSection = document.getElementById('explanation-section');
    const explanationText = document.getElementById('explanation-text');

    explanationText.textContent = question.explanation;
    explanationSection.style.display = 'block';
    
    // Scroll to explanation
    explanationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Close explanation
function closeExplanation() {
    document.getElementById('explanation-section').style.display = 'none';
}

// Update score display
function updateScoreDisplay() {
    quiz.calculateScore();
    document.getElementById('score-display').textContent = 
        `النقاط: ${quiz.score}`;
}

// Navigate to next question
function nextQuestion() {
    if (quiz.currentQuestionIndex === quiz.currentQuestions.length - 1) {
        // Quiz is complete
        showResults();
    } else {
        if (quiz.nextQuestion()) {
            renderQuestion();
        }
    }
}

// Navigate to previous question
function previousQuestion() {
    if (quiz.previousQuestion()) {
        renderQuestion();
    }
}

// Show results screen
function showResults() {
    const results = quiz.getResults();
    const review = quiz.getAnswerReview();

    // Display final score
    const scoreDisplay = document.getElementById('final-score');
    scoreDisplay.innerHTML = `
        <div style="font-size: 0.5em; color: var(--text-secondary); margin-bottom: 20px;">
            لقد أكملت الاختبار بنجاح! 🎉
        </div>
        <div style="font-size: 2.5em; font-weight: bold; color: var(--primary-red);">
            ${results.percentage}%
        </div>
        <div style="font-size: 1.2em; color: var(--text-secondary); margin-top: 15px;">
            ${results.correctAnswers} من ${results.totalQuestions} إجابات صحيحة
        </div>
    `;

    // Display score breakdown
    const breakdownDiv = document.getElementById('score-breakdown');
    breakdownDiv.innerHTML = `
        <div class="breakdown-item correct">
            <div class="label">إجابات صحيحة</div>
            <div class="value">${results.correctAnswers}</div>
        </div>
        <div class="breakdown-item incorrect">
            <div class="label">إجابات خاطئة</div>
            <div class="value">${results.incorrectAnswers}</div>
        </div>
        <div class="breakdown-item">
            <div class="label">إجمالي الأسئلة</div>
            <div class="value">${results.totalQuestions}</div>
        </div>
    `;

    // Display answers review
    const reviewDiv = document.getElementById('answers-review');
    reviewDiv.innerHTML = '<h3>📋 مراجعة الإجابات</h3>';

    review.forEach((item, index) => {
        const answerItemDiv = document.createElement('div');
        answerItemDiv.className = `answer-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        let optionText = '';
        if (item.type === 'mcq') {
            const userAnswerText = item.userAnswer !== null ? 
                `${String.fromCharCode(65 + item.userAnswer)}: ${item.options[item.userAnswer]}` : 
                'لم تجب';
            const correctAnswerText = 
                `${String.fromCharCode(65 + item.correctAnswer)}: ${item.options[item.correctAnswer]}`;
            
            optionText = `
                <div class="answer-details">
                    <span class="your-answer">إجابتك: ${userAnswerText}</span>
                    <span class="correct-answer">الإجابة الصحيحة: ${correctAnswerText}</span>
                </div>
            `;
        } else {
            const userAnswerText = item.userAnswer !== null ? 
                (item.userAnswer === 1 ? 'صحيح ✓' : 'خطأ ✗') : 
                'لم تجب';
            const correctAnswerText = item.correctAnswer === 1 ? 'صحيح ✓' : 'خطأ ✗';
            
            optionText = `
                <div class="answer-details">
                    <span class="your-answer">إجابتك: ${userAnswerText}</span>
                    <span class="correct-answer">الإجابة الصحيحة: ${correctAnswerText}</span>
                </div>
            `;
        }

        const statusIcon = item.isCorrect ? '✓' : '✗';
        answerItemDiv.innerHTML = `
            <div class="answer-question">
                <strong>${index + 1}. ${item.question}</strong>
            </div>
            ${optionText}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                <strong style="color: var(--primary-red);">💡 الشرح:</strong>
                <p style="margin-top: 8px; color: var(--text-light);">${item.explanation}</p>
            </div>
        `;

        reviewDiv.appendChild(answerItemDiv);
    });

    showScreen('results-screen');
}

// Retake quiz
function retakeQuiz() {
    const quizType = quiz.quizType;
    quiz = new Quiz();
    startQuiz(quizType);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set initial screen
    showScreen('home-screen');
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('quiz-screen').classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                nextQuestion();
            } else if (e.key === 'ArrowRight') {
                previousQuestion();
            }
        }
    });
});
