from flask import Flask, render_template, request, jsonify, session, g
import google.generativeai as genai
import json
import os
import dotenv
import requests
import sqlite3
import jwt
import datetime
import uuid
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

dotenv.load_dotenv()

app = Flask(__name__)
app.secret_key = "super-secret-key"
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'super-secret-jwt-key')
CORS(app)

# --- database ---
DATABASE = 'ace_the_interview.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS replies (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts (id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        db.commit()

init_db()

# ----Auth Middleware----
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({"message": "Token is missing"}), 401
            
        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=["HS256"])
            db = get_db()
            cursor = db.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (data['user_id'],))
            current_user = cursor.fetchone()
            if not current_user:
                return jsonify({"message": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"message": "Token is invalid"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# ── Gemini SDK (for interview simulation) ────────────────────────────────────
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# ── Gemini REST (for CV parsing + question generation) ───────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# ── Shared interview store (accessible by all clients — browser + Postman) ───
# Questions written here by /cv or /upload-questions are picked up by the
# browser's polling loop automatically, no session cookie mismatch.
interview_store = {
    "questions_content": "",
    "questions_for_gemini": "",  # kept for Gemini context, never cleared until interview ends
    "conversation": [],
    "evaluation": None,
    "active": False  # True only while interview is running
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def read_file_safe(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def append_to_log(question_num, question, answer):
    with open("interview_log.txt", "a", encoding="utf-8") as log:
        log.write(f"[Q{question_num}]\n")
        log.write(f"Q: {question}\n")
        log.write(f"A: {answer}\n\n")


def call_gemini_rest(prompt):
    """Gemini via raw REST — used for CV parsing & question generation."""
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
    response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        print("Gemini REST error:", response.text)
        response.raise_for_status()
    return response.json()


def ask_gemini_sdk(conversation_history: list, questions_content: str, log_content: str) -> dict:
    """Gemini via SDK — used for live interview simulation."""
    transcript = ""
    for turn in conversation_history:
        transcript += f"Interviewer: {turn['question']}\nCandidate: {turn['answer']}\n\n"

    prompt = f"""
You are an experienced HR interviewer conducting a real spoken job interview.

--- QUESTION BANK (ask questions ONLY from this list) ---
{questions_content}
--- END OF QUESTION BANK ---

--- PREVIOUS INTERVIEW LOG ---
{log_content if log_content else "No previous sessions."}
--- END OF LOG ---

--- CURRENT INTERVIEW TRANSCRIPT ---
{transcript if transcript else "The interview has just started. Greet the candidate and ask your first question."}
--- END OF TRANSCRIPT ---

INSTRUCTIONS:
- Use questions ONLY from the question bank above. Do not invent questions outside it.
- After each answer, respond naturally: briefly acknowledge in one sentence, then ask the next question from the bank.
- If an answer is too vague or short, probe deeper on the same question before moving on.
- No scores, ratings, or structured feedback — just speak like a real human interviewer.
- After all questions are covered, close the interview warmly.
- IMPORTANT: If the candidate says anything like "end the interview", "stop", "that's all", "finish", "I want to end", "let's stop" — treat it as a request to end and set interview_complete to true with a warm closing message. Do NOT keep asking questions.
- Your reply will be spoken aloud, so keep it natural and conversational.

Return ONLY valid JSON, no markdown:
{{
  "interviewer_reply": "Your full spoken response — brief acknowledgment + next question (or warm closing if done)",
  "next_question": "The question portion only for session tracking (empty string if closing)",
  "interview_complete": false
}}
    """

    response = model.generate_content(prompt)
    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "interviewer_reply": "Thanks for that. Can you walk me through a challenging project you've worked on?",
            "next_question": "Can you walk me through a challenging project you've worked on?",
            "interview_complete": False
        }


# a uthentication

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        
        if not name or not email or not password:
            return jsonify({"message": "Missing required fields"}), 400
            
        db = get_db()
        cursor = db.cursor()
        
        # if user exists
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"message": "User already exists"}), 400
            
        user_id = str(uuid.uuid4())
        hashed_pw = generate_password_hash(password)
        
        cursor.execute("INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
                      (user_id, name, email, hashed_pw))
        db.commit()
            
        # Gen token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        }, app.config['JWT_SECRET'], algorithm="HS256")
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "_id": user_id,
                "name": name,
                "email": email
            },
            "token": token
        }), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"message": "Missing credentials"}), 400
            
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({"message": "Invalid credentials"}), 400
            
        # Gen token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        }, app.config['JWT_SECRET'], algorithm="HS256")
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "_id": user['id'],
                "name": user['name'],
                "email": user['email']
            },
            "token": token
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route("/user", methods=["GET"])
@token_required
def get_user(current_user):
    return jsonify({
        "user": {
            "_id": current_user['id'],
            "name": current_user['name'],
            "email": current_user['email']
        }
    }), 200

@app.route("/posts", methods=["GET"])
def get_posts():
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT p.id, p.content, p.created_at, u.name as author
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        """)
        posts = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT r.id, r.post_id, r.content, r.created_at, u.name as author
            FROM replies r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at ASC
        """)
        replies = [dict(row) for row in cursor.fetchall()]
        
        replies_by_post = {}
        for r in replies:
            post_id = r['post_id']
            if post_id not in replies_by_post:
                replies_by_post[post_id] = []
            replies_by_post[post_id].append(r)
            
        for post in posts:
            post['replies'] = replies_by_post.get(post['id'], [])
            
        return jsonify({"posts": posts}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route("/posts", methods=["POST"])
@token_required
def create_post(current_user):
    try:
        data = request.get_json(silent=True) or {}
        content = data.get("content")
        
        if not content:
            return jsonify({"message": "Content is required"}), 400
            
        post_id = str(uuid.uuid4())
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)",
                      (post_id, current_user['id'], content))
        db.commit()
        
        return jsonify({"message": "Post created successfully"}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

@app.route("/posts/<post_id>/replies", methods=["POST"])
@token_required
def create_reply(current_user, post_id):
    try:
        data = request.get_json(silent=True) or {}
        content = data.get("content")
        
        if not content:
            return jsonify({"message": "Content is required"}), 400
            
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("SELECT id FROM posts WHERE id = ?", (post_id,))
        if not cursor.fetchone():
            return jsonify({"message": "Post not found"}), 404
            
        reply_id = str(uuid.uuid4())
        
        cursor.execute("INSERT INTO replies (id, post_id, user_id, content) VALUES (?, ?, ?, ?)",
                      (reply_id, post_id, current_user['id'], content))
        db.commit()
        
        return jsonify({"message": "Reply added successfully"}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"message": f"Server Error: {str(e)}"}), 500

# ─────────────────────────────────────────────────────────────────────────────
# Frontend
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return render_template("interview.html")


# ─────────────────────────────────────────────────────────────────────────────
# CV PARSING + QUESTION GENERATION
#
# POST /cv
# Form-data:
#   file        → PDF or image of the resume
#   role_id     → target job role (e.g. "Backend Engineer")
#   prompt      → any extra context / FAQ hints
#
# What it does:
#   1. Sends CV to http://localhost:8000/api/resume/parse for parsing
#   2. Receives parsed profile data (education, experience, skills, resumeText)
#   3. Sends resumeText directly to Gemini for question generation
#   4. Saves generated questions into interview_store (browser auto-picks up)
#
# Returns: { "status": "ok", "question_count": 8 }
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/cv", methods=["POST"])
def cv():
    file = request.files.get("file")
    role = request.form.get("role_id")
    frontend_prompt = request.form.get("prompt")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if not role:
        return jsonify({"error": "No role provided"}), 400
    if not frontend_prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # Step 1: Send file to external resume parsing API
    try:
        files = {"file": (file.filename, file.stream, file.content_type)}
        parse_response = requests.post(
            os.getenv("RESUME_PARSING_API_URL", "http://localhost:8000/api/resume/parse"),
            files=files
        )
        
        if parse_response.status_code != 200:
            return jsonify({"error": f"Resume parsing failed: {parse_response.text}"}), 400
        
        parse_data = parse_response.json()
        profile_data = parse_data.get("data", {})
        resume_text = profile_data.get("resumeText", "")
        
        if not resume_text:
            return jsonify({"error": "No resume text extracted from parsing API"}), 400
            
        print(f"✓ Resume parsed successfully for: {profile_data.get('name', 'Unknown')}")
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to parsing service: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error parsing resume: {str(e)}"}), 500

    # Step 2: Generate interview questions via Gemini REST using resumeText
    try:
        prompt = f"""
You are an experienced recruiter. Generate interview questions based on the candidate's resume and target role.
Return only structured questions. No explanation. No markdown. No backticks.
Return strictly valid JSON in this exact format:

{{
  "questions": "1. Tell me about yourself.\\n2. What is your greatest strength?\\n3. ..."
}}

Additional Context:
{frontend_prompt}

Target Role:
{role}

Candidate Resume:
{resume_text}
        """
        gemini_response = call_gemini_rest(prompt)
        raw_text = gemini_response['candidates'][0]['content']['parts'][0]['text']

        # Clean and parse the JSON
        clean = raw_text.strip().replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
        questions_content = parsed.get("questions", "").strip()

        if not questions_content:
            return jsonify({"error": "Gemini returned no questions"}), 500

        # Step 3: Store in interview_store — browser will auto-detect and start
        interview_store["questions_content"] = questions_content
        interview_store["questions_for_gemini"] = questions_content  # preserved for Gemini

        question_count = len([l for l in questions_content.splitlines() if l.strip()])
        return jsonify({"status": "ok", "question_count": question_count}), 200

    except Exception as e:
        print("Gemini error:", e)
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# MANUAL QUESTION UPLOAD (alternative to /cv — send plain text questions)
#
# POST /upload-questions
# { "questions": "1. Tell me about yourself.\n2. What is your strength?" }
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/upload-questions", methods=["POST"])
def upload_questions():
    data = request.get_json(silent=True) or {}
    questions_content = data.get("questions", "").strip()

    if not questions_content:
        return jsonify({"error": 'No questions provided. Send { "questions": "..." }'}), 400

    interview_store["questions_content"] = questions_content
    interview_store["questions_for_gemini"] = questions_content

    question_count = len([l for l in questions_content.splitlines() if l.strip()])
    return jsonify({"status": "ok", "question_count": question_count})


# ─────────────────────────────────────────────────────────────────────────────
# POLLING — browser checks this every 3s to know when to auto-start
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/questions-status", methods=["GET"])
def questions_status():
    questions_content = interview_store.get("questions_content", "").strip()
    if questions_content:
        question_count = len([l for l in questions_content.splitlines() if l.strip()])
        return jsonify({"ready": True, "question_count": question_count})
    return jsonify({"ready": False})


# ─────────────────────────────────────────────────────────────────────────────
# START INTERVIEW — called automatically by browser after polling confirms ready
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/start", methods=["POST"])
def start_interview():
    questions_content = interview_store.get("questions_content", "").strip()
    if not questions_content:
        return jsonify({"error": "No questions loaded. Call POST /cv or /upload-questions first."}), 400

    # Clear questions_content so polling returns ready:false — prevents restart
    # But keep questions_for_gemini so /answer can still use it
    interview_store["questions_content"] = ""
    interview_store["active"] = True

    session["conversation"] = []
    session["question_count"] = 0
    interview_store["conversation"] = []
    interview_store["evaluation"] = None

    log_content = read_file_safe("interview_log.txt")
    result = ask_gemini_sdk([], questions_content, log_content)

    first_reply = result.get("interviewer_reply", "Welcome! Let's begin. Tell me about yourself.")
    session["current_question"] = result.get("next_question", first_reply)
    session["question_count"] = 1

    return jsonify({"reply": first_reply})


# ─────────────────────────────────────────────────────────────────────────────
# ANSWER — browser sends each spoken answer here during the interview
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/answer", methods=["POST"])
def handle_answer():
    try:
        user_answer = request.json.get("answer", "").strip()
        if not user_answer:
            return jsonify({
                "completed": False,
                "reply": "I didn't quite catch that — could you please repeat your answer?"
            })

        # Use questions_for_gemini (never cleared during interview)
        questions_content = interview_store.get("questions_for_gemini", "")

        # Only block if interview is explicitly marked inactive
        if not interview_store.get("active", False):
            return jsonify({"completed": True, "reply": "The interview has already ended. Thank you!"})
        log_content = read_file_safe("interview_log.txt")

        current_question = session.get("current_question", "")
        conversation = session.get("conversation", [])

        conversation.append({"question": current_question, "answer": user_answer})
        session["conversation"] = conversation
        interview_store["conversation"] = conversation  # mirror to store for /evaluate
        append_to_log(session.get("question_count", 1), current_question, user_answer)

        result = ask_gemini_sdk(conversation, questions_content, log_content)

        interviewer_reply = result.get("interviewer_reply", "Thank you. Let's continue.")
        interview_complete = result.get("interview_complete", False)
        next_question = result.get("next_question", "")

        if interview_complete or not next_question:
            interview_store["active"] = False  # mark done so further answers are blocked
            return jsonify({"completed": True, "reply": interviewer_reply})

        session["current_question"] = next_question
        session["question_count"] = session.get("question_count", 1) + 1

        return jsonify({"completed": False, "reply": interviewer_reply})

    except Exception as e:
        print("ERROR:", e)
        import traceback
        traceback.print_exc()
        return jsonify({
            "completed": False,
            "reply": "Let's keep going. Can you describe your biggest professional achievement?"
        })


# ─────────────────────────────────────────────────────────────────────────────
# EVALUATE — called by frontend after interview completes
# Reads the full conversation from session, sends to Gemini for deep evaluation
# Returns structured feedback that maps directly to FeedbackPage variables
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        # Read from interview_store so it works regardless of session cookie
        conversation = interview_store.get("conversation", [])
        if not conversation:
            # Fallback to session
            conversation = session.get("conversation", [])
        if not conversation:
            return jsonify({"error": "No conversation found to evaluate."}), 400

        # Build full transcript string for Gemini
        transcript_text = ""
        for i, turn in enumerate(conversation, 1):
            transcript_text += f"Q{i}: {turn['question']}\nA{i}: {turn['answer']}\n\n"

        prompt = f"""
You are an expert HR evaluator and career coach. Evaluate this job interview transcript thoroughly.

--- INTERVIEW TRANSCRIPT ---
{transcript_text}
--- END OF TRANSCRIPT ---

Analyze the candidate's performance across all answers. Be specific, honest, and constructive.

Return ONLY valid JSON, no markdown, no backticks:
{{
  "overall_score": 78,
  "verdict": "GOOD EFFORT",
  "summary": "One sentence overall summary of the candidate's performance.",
  "duration_minutes": 15,
  "score_categories": [
    {{ "label": "Communication", "score": 80, "desc": "Specific observation about how they communicated" }},
    {{ "label": "Technical Depth", "score": 70, "desc": "Specific observation about technical knowledge shown" }},
    {{ "label": "Problem Solving", "score": 75, "desc": "Specific observation about their approach to problems" }},
    {{ "label": "Confidence", "score": 72, "desc": "Specific observation about their confidence and delivery" }}
  ],
  "strengths": [
    "Specific strength observed from the actual answers (not generic)",
    "Another specific strength",
    "Another specific strength"
  ],
  "improvements": [
    "Specific skill gap with actionable advice on how to improve it",
    "Another skill gap with actionable improvement tip",
    "Another skill gap with actionable improvement tip"
  ],
  "skill_gaps": [
    {{ "skill": "Skill name", "gap": "What was missing", "how_to_improve": "Concrete resource or action" }},
    {{ "skill": "Skill name", "gap": "What was missing", "how_to_improve": "Concrete resource or action" }}
  ],
  "transcript": [
    {{
      "q": "The interview question asked",
      "a": "The candidate's answer (verbatim or close summary)",
      "score": 78,
      "feedback": "One sentence specific feedback on this particular answer"
    }}
  ]
}}

Rules:
- overall_score must be 0-100 integer
- verdict must be one of: "EXCELLENT PERFORMANCE", "GOOD EFFORT", "NEEDS IMPROVEMENT"
- All scores must be 0-100 integers
- Be specific to WHAT THE CANDIDATE ACTUALLY SAID — no generic feedback
- skill_gaps must describe real gaps visible in the transcript
- how_to_improve must be actionable (e.g. "Practice STAR method for behavioral questions", "Study system design on Educative.io")
        """

        response = model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "").strip()
        evaluation = json.loads(raw)
        print("Evaluation result:", evaluation)

        # Store evaluation so frontend can fetch it at /feedback-data
        interview_store["evaluation"] = evaluation
        interview_store["active"] = False
        interview_store["questions_for_gemini"] = ""

        return jsonify({"status": "ok", "evaluation": evaluation})

    except Exception as e:
        print("EVALUATE ERROR:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# FEEDBACK DATA — frontend can fetch this after evaluation is done
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/feedback-data", methods=["GET"])
def feedback_data():
    evaluation = interview_store.get("evaluation")
    if not evaluation:
        return jsonify({"ready": False})
    return jsonify({"ready": True, "evaluation": evaluation})
# ─────────────────────────────────────────────────────────────────────────────
# TEST ONLY — seed fake conversation and call evaluate in one request
# GET http://127.0.0.1:5000/test-evaluate
# Remove this route before production
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/test-evaluate", methods=["GET"])
def test_evaluate():
    # Inject fake conversation directly into store
    interview_store["conversation"] = [
        {"question": "Tell me about yourself.", "answer": "I am a frontend developer with 2 years of React experience. I have built several e-commerce projects."},
        {"question": "What is your greatest strength?", "answer": "My greatest strength is problem solving. I enjoy breaking down complex problems into smaller pieces."},
        {"question": "Why do you want this role?", "answer": "I want to grow as an engineer and this role offers great challenges with modern tech stack."},
    ]
    return jsonify({"status": "ok", "message": "Fake conversation seeded. Now POST /evaluate to test."})



if __name__ == "__main__":
    app.run(debug=True)