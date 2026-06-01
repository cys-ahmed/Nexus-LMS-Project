CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

CREATE TABLE IF NOT EXISTS users (
    user_id    INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    email      VARCHAR(200) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('Admin','Student') NOT NULL DEFAULT 'Student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    course_id   INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    instructor  VARCHAR(200) NOT NULL,
    price       DECIMAL(10,2) NOT NULL DEFAULT 0,
    level       VARCHAR(50)  NOT NULL DEFAULT 'All Levels',
    status      ENUM('published','draft','archived') NOT NULL DEFAULT 'draft',
    emoji       VARCHAR(10)  DEFAULT '📚',
    image       MEDIUMTEXT,
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    course_id     INT NOT NULL,
    progress      INT NOT NULL DEFAULT 0,
    enrolled_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_course (user_id, course_id),
    FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(300) NOT NULL,
    body       TEXT         NOT NULL,
    severity   ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
    author     VARCHAR(100) NOT NULL DEFAULT 'Admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    course_id  INT NOT NULL,
    rating     TINYINT NOT NULL DEFAULT 5,
    body       TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_course_review (user_id, course_id),
    FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (username, email, password, role) VALUES
    ('admin',   'admin@nexus.io',   'admin',   'Admin'),
    ('student', 'student@nexus.io', 'student', 'Student'),
    ('user',    'user@nexus.io',    'user',    'Student');

INSERT IGNORE INTO courses (title, category, instructor, price, level, status, emoji, image, description) VALUES
    ('React – The Complete Guide',   'Web Development', 'Sarah Johnson',       89,  'All Levels',  'published', '⚛️',  'assets/courses_img/react_js.png',       'Master React from basics to advanced concepts including Hooks, Redux, and Next.js.'),
    ('Python for Data Science',      'Data Science',    'Dr. Ahmed Al-Rashid', 85,  'Beginner',    'published', '🐍',  'assets/courses_img/python.png',         'Learn Python for data analysis, visualization, and machine learning.'),
    ('Ethical Hacking A–Z',          'Cybersecurity',   'Marcus Chen',         79,  'All Levels',  'published', '🔐', 'assets/courses_img/ethical_hacking.png','Complete ethical hacking and penetration testing course from zero to expert.'),
    ('UI/UX Design with Figma',      'UI/UX Design',    'Emma Whitfield',      55,  'Beginner',    'draft',     '🎨', 'assets/courses_img/ui_ux.png',          'Design beautiful user interfaces with Figma, from wireframes to prototypes.'),
    ('Docker & Kubernetes Complete', 'DevOps & Cloud',  'Mumshad Mannambeth',  95,  'Intermediate','published', '🐳', 'assets/courses_img/docker.png',         'Master containerization and orchestration with Docker and Kubernetes.'),
    ('Deep Learning Specialization', 'AI & ML',         'Andrew Ng',           0,   'Intermediate','published', '🤖', 'assets/courses_img/Deep_Learning.png',  'Deep dive into neural networks, CNNs, RNNs, and modern AI architectures.');

INSERT IGNORE INTO enrollments (user_id, course_id, progress) VALUES
    (2, 1, 72),
    (2, 2, 45),
    (2, 3, 18),
    (3, 1, 55),
    (3, 5, 30);

INSERT IGNORE INTO announcements (title, body, severity, author) VALUES
    ('Welcome to Nexus!',                'The platform is now live. Start exploring our courses and earn certificates.',         'info',     'admin'),
    ('New Courses Added',                'We have added 3 new courses in AI & ML and DevOps. Check them out in the catalog!',   'info',     'admin'),
    ('Scheduled Maintenance',            'The platform will be down for maintenance on Sunday from 2–4 AM UTC.',                'warning',  'admin');
