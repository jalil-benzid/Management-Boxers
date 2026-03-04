python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn[standard]
pip install sqlalchemy aiosqlite
pip freeze > requirements.txt
uvicorn src.main:app --reload
http://127.0.0.1:8000/docs
pip install fastapi uvicorn
pip freeze > requirements.txt
pip install python-dotenv