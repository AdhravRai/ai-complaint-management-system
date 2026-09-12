from app.database.database import Base, engine
from app.database.models import Complaint


Base.metadata.create_all(bind=engine)

print("Database tables created.")