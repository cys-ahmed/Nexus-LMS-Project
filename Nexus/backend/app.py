import pymysql
import os
from flask import Flask, request, jsonify, g, make_response, send_from_directory
from flask_cors import CORS

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app, origins=[
    "null",
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://localhost:5000",
    "http://10.10.1.145",
    "http://10.10.1.145:80",
    "http://nexus.com",
    "http://www.nexus.com"
], supports_credentials=True)

DB_CONFIG = {
    "host":        os.getenv("DB_HOST", "mysql"),
    "port":        int(os.getenv("DB_PORT", "3306")),
    "user":        os.getenv("DB_USER", "admin"),
    "password":    os.getenv("DB_PASSWORD", "admin"),
    "database":    os.getenv("DB_NAME", "mydb"),
    "cursorclass": pymysql.cursors.DictCursor,
    "charset":     "utf8mb4",
    "ssl_disabled": True,
}


def get_db():
    db = getattr(g, "_database", None)
    if db is None or not db.open:
        db = g._database = pymysql.connect(**DB_CONFIG)
    return db


@app.teardown_appcontext
def close_db(exc):
    db = getattr(g, "_database", None)
    if db is not None and db.open:
        db.close()


import datetime
import decimal

def serial(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


def safe_json(data):
    import json
    return app.response_class(
        response=json.dumps(data, default=serial),
        status=200,
        mimetype='application/json'
    )


@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")

    query = (
        "SELECT * FROM users WHERE "
        "(username = '" + username + "' OR email = '" + username + "') "
        "AND password = '" + password + "'"
    )

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(query)
        row = cur.fetchone()
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

    if row:
        return safe_json({
            "success": True,
            "user": {
                "id":       row["user_id"],
                "username": row["username"],
                "email":    row["email"],
                "role":     row["role"],
                "joined":   row["created_at"],
            },
        })
    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@app.route("/api/users", methods=["GET"])
def list_users():
    db  = get_db()
    cur = db.cursor()
    cur.execute("SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id")
    return safe_json(cur.fetchall())


@app.route("/api/users", methods=["POST"])
def add_user():
    data     = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    email    = data.get("email", "").strip()
    password = data.get("password", "temp123")
    role     = data.get("role", "Student")

    if not username or not email:
        return jsonify({"success": False, "error": "username and email are required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (username, email, password, role)
        )
        db.commit()
        return jsonify({"success": True, "id": cur.lastrowid, "message": "User added"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    db.commit()
    return jsonify({"success": True, "message": "User deleted"})

@app.route("/api/users/search")
def search_users():
    q = request.args.get("q", "")
    query = "SELECT user_id, username, email, role FROM users WHERE username LIKE '%" + q + "%'"
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(query)
        return safe_json(cur.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/change-password", methods=["POST"])
def change_password():
    data             = request.get_json(silent=True) or {}
    user_id          = data.get("user_id")
    current_password = data.get("current_password", "")
    new_password     = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not user_id or not current_password or not new_password or not confirm_password:
        return jsonify({"success": False, "error": "Please fill in all fields."}), 400
    if len(new_password) < 6:
        return jsonify({"success": False, "error": "New password must be at least 6 characters."}), 400
    if new_password != confirm_password:
        return jsonify({"success": False, "error": "New passwords do not match."}), 400

    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT user_id FROM users WHERE user_id = %s AND password = %s",
        (user_id, current_password)
    )
    if not cur.fetchone():
        return jsonify({"success": False, "error": "Current password is incorrect"}), 401

    cur.execute("UPDATE users SET password = %s WHERE user_id = %s", (new_password, user_id))
    db.commit()
    return jsonify({"success": True, "message": "Password updated successfully"})


@app.route("/api/profile/update", methods=["POST"])
def update_profile():
    data     = request.get_json(silent=True) or {}
    user_id  = data.get("user_id")
    username = data.get("username", "").strip()
    email    = data.get("email", "").strip()

    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "UPDATE users SET username=%s, email=%s WHERE user_id=%s",
            (username, email, user_id)
        )
        db.commit()
        return jsonify({"success": True, "message": "Profile updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/courses", methods=["GET"])
def list_courses():
    db  = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM courses ORDER BY course_id")
    return safe_json(cur.fetchall())


@app.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):
    db  = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM courses WHERE course_id = %s", (course_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({"error": "Not found"}), 404
    return safe_json(row)


@app.route("/api/courses", methods=["POST"])
def add_course():
    data        = request.get_json(silent=True) or {}
    title       = data.get("title", "").strip()
    category    = data.get("category", "General")
    instructor  = data.get("instructor", "").strip()
    price       = data.get("price", 0)
    level       = data.get("level", "All Levels")
    status      = data.get("status", "draft")
    emoji       = data.get("emoji", "📚")
    image       = data.get("image", "")
    description = data.get("description", "")

    if not title or not instructor:
        return jsonify({"success": False, "error": "title and instructor are required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO courses (title,category,instructor,price,level,status,emoji,image,description) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (title, category, instructor, price, level, status, emoji, image, description)
        )
        db.commit()
        return jsonify({"success": True, "id": cur.lastrowid, "message": "Course added"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    data   = request.get_json(silent=True) or {}
    fields = ["title", "category", "instructor", "price", "level", "status", "emoji", "image", "description"]
    updates, params = [], []

    for f in fields:
        if f in data:
            updates.append(f"{f} = %s")
            params.append(data[f])

    if not updates:
        return jsonify({"success": False, "error": "No fields to update"}), 400

    params.append(course_id)
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(f"UPDATE courses SET {', '.join(updates)} WHERE course_id = %s", params)
        db.commit()
        return jsonify({"success": True, "message": "Course updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM courses WHERE course_id = %s", (course_id,))
    db.commit()
    return jsonify({"success": True, "message": "Course deleted"})


@app.route("/api/courses/search")
def search_courses():
    q = request.args.get("q", "")
    query = "SELECT * FROM courses WHERE title LIKE '%" + q + "%' OR category LIKE '%" + q + "%'"
    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(query)
        return safe_json(cur.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/enrollments", methods=["GET"])
def list_enrollments():
    """List all enrollments (admin view) or filter by user_id or course_id."""
    user_id   = request.args.get("user_id")
    course_id = request.args.get("course_id")

    db  = get_db()
    cur = db.cursor()

    if user_id:
        cur.execute("""
            SELECT e.id, e.user_id, e.course_id, e.progress, e.enrolled_at, e.last_accessed,
                   c.title, c.category, c.instructor, c.price, c.level, c.status,
                   c.emoji, c.image, c.description
            FROM enrollments e
            JOIN courses c ON e.course_id = c.course_id
            WHERE e.user_id = %s
            ORDER BY e.enrolled_at DESC
        """, (user_id,))
    elif course_id:
        cur.execute("""
            SELECT e.id, e.user_id, e.course_id, e.progress, e.enrolled_at, e.last_accessed,
                   u.username, u.email
            FROM enrollments e
            JOIN users u ON e.user_id = u.user_id
            WHERE e.course_id = %s
            ORDER BY e.enrolled_at DESC
        """, (course_id,))
    else:
        cur.execute("""
            SELECT e.id, e.user_id, e.course_id, e.progress, e.enrolled_at,
                   u.username, u.email, c.title as course_title
            FROM enrollments e
            JOIN users u ON e.user_id = u.user_id
            JOIN courses c ON e.course_id = c.course_id
            ORDER BY e.enrolled_at DESC
        """)

    return safe_json(cur.fetchall())


@app.route("/api/enrollments", methods=["POST"])
def enroll():
    data      = request.get_json(silent=True) or {}
    user_id   = data.get("user_id")
    course_id = data.get("course_id")

    if not user_id or not course_id:
        return jsonify({"success": False, "error": "user_id and course_id required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO enrollments (user_id, course_id, progress) VALUES (%s, %s, 0) "
            "ON DUPLICATE KEY UPDATE last_accessed = NOW()",
            (user_id, course_id)
        )
        db.commit()
        return jsonify({"success": True, "message": "Enrolled successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/enrollments/<int:enrollment_id>", methods=["DELETE"])
def unenroll(enrollment_id):
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM enrollments WHERE id = %s", (enrollment_id,))
    db.commit()
    return jsonify({"success": True, "message": "Unenrolled"})


@app.route("/api/enrollments/by-user-course", methods=["DELETE"])
def unenroll_by_user_course():
    data      = request.get_json(silent=True) or {}
    user_id   = data.get("user_id")
    course_id = data.get("course_id")
    if not user_id or not course_id:
        return jsonify({"success": False, "error": "user_id and course_id required"}), 400
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM enrollments WHERE user_id=%s AND course_id=%s", (user_id, course_id))
    db.commit()
    return jsonify({"success": True, "message": "Unenrolled"})


@app.route("/api/enrollments/progress", methods=["PUT"])
def update_progress():
    data      = request.get_json(silent=True) or {}
    user_id   = data.get("user_id")
    course_id = data.get("course_id")
    progress  = data.get("progress", 0)

    if not user_id or not course_id:
        return jsonify({"success": False, "error": "user_id and course_id required"}), 400

    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE enrollments SET progress=%s, last_accessed=NOW() WHERE user_id=%s AND course_id=%s",
        (progress, user_id, course_id)
    )
    db.commit()
    return jsonify({"success": True, "message": "Progress updated"})


@app.route("/api/announcements", methods=["GET"])
def get_announcements():
    db  = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM announcements ORDER BY created_at DESC")
    return safe_json(cur.fetchall())


@app.route("/api/announcements", methods=["POST"])
def add_announcement():
    data     = request.get_json(silent=True) or {}
    title    = data.get("title", "").strip()
    body     = data.get("body", "").strip()
    severity = data.get("severity", "info")
    author   = data.get("author", "Admin")

    if not title or not body:
        return jsonify({"success": False, "error": "title and body are required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO announcements (title, body, severity, author) VALUES (%s,%s,%s,%s)",
            (title, body, severity, author)
        )
        db.commit()
        return jsonify({"success": True, "id": cur.lastrowid, "message": "Announcement added"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/announcements/<int:ann_id>", methods=["DELETE"])
def delete_announcement(ann_id):
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM announcements WHERE id = %s", (ann_id,))
    db.commit()
    return jsonify({"success": True, "message": "Announcement deleted"})


@app.route("/api/announcements/clear", methods=["DELETE"])
def clear_announcements():
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM announcements")
    db.commit()
    return jsonify({"success": True, "message": "All announcements cleared"})


@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    course_id = request.args.get("course_id")
    db  = get_db()
    cur = db.cursor()
    if course_id:
        cur.execute("""
            SELECT r.id, r.user_id, r.course_id, r.rating, r.body, r.created_at,
                   u.username
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.course_id = %s
            ORDER BY r.created_at DESC
        """, (course_id,))
    else:
        cur.execute("""
            SELECT r.id, r.user_id, r.course_id, r.rating, r.body, r.created_at,
                   u.username
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            ORDER BY r.created_at DESC
        """)
    return safe_json(cur.fetchall())


@app.route("/api/reviews", methods=["POST"])
def add_review():
    data      = request.get_json(silent=True) or {}
    user_id   = data.get("user_id")
    course_id = data.get("course_id")
    rating    = data.get("rating", 5)
    body      = data.get("body", "").strip()

    if not user_id or not course_id or not body:
        return jsonify({"success": False, "error": "user_id, course_id, and body required"}), 400

    db  = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO reviews (user_id, course_id, rating, body) VALUES (%s,%s,%s,%s)",
            (user_id, course_id, rating, body)
        )
        db.commit()
        return jsonify({"success": True, "id": cur.lastrowid})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/api/stats", methods=["GET"])
def get_stats():
    db  = get_db()
    cur = db.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM users WHERE role='Student'")
    students = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM courses WHERE status='published'")
    active_courses = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM enrollments")
    total_enrollments = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM courses")
    total_courses = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM announcements")
    total_announcements = cur.fetchone()["cnt"]
    cur.execute("""
        SELECT COALESCE(SUM(c.price), 0) as revenue
        FROM enrollments e JOIN courses c ON e.course_id = c.course_id
    """)
    revenue = cur.fetchone()["revenue"]

    return jsonify({
        "students":            students,
        "active_courses":      active_courses,
        "total_courses":       total_courses,
        "total_enrollments":   total_enrollments,
        "total_announcements": total_announcements,
        "revenue":             float(revenue),
    })


@app.route("/search")
def search_page():
    q = request.args.get("q", "")  # ⚠️ reflected raw (Reflected XSS demo)
    html = f"""<!DOCTYPE html>
<html><head><title>Search – Nexus</title></head>
<body style="font-family:sans-serif;padding:2rem">
  <h1>Search Results for: {q}</h1>
  <form method="GET" action="/search">
    <input name="q" value="{q}" style="padding:.5rem;width:300px"/>
    <button type="submit">Search</button>
  </form>
  <hr/>
  <p>You searched for: <b>{q}</b></p>
</body></html>"""
    return make_response(html, 200, {"Content-Type": "text/html"})


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker healthcheck"""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    target = os.path.join(FRONTEND_DIR, path)
    if path and os.path.exists(target):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
