import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.models.base import Base
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis, JobMatch
from app.database.session import SessionLocal, engine
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@resumeanalyzer.com").first()
        if admin:
            print("Admin user already exists.")
            return
        admin = User(
            name="Admin",
            email="admin@resumeanalyzer.com",
            password_hash=hash_password("Admin@123456"),
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Admin user created!")
        print("Email: admin@resumeanalyzer.com")
        print("Password: Admin@123456")
    finally:
        db.close()

if __name__ == "__main__":
    seed()