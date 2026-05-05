import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    auth_plugin='mysql_native_password'
)

cursor = conn.cursor()

def save_log(question, answer):
    query = "INSERT INTO logs (question, answer) VALUES (%s, %s)"
    values = (question, answer)
    cursor.execute(query, values)
    conn.commit()