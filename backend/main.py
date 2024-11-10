import os
from datetime import datetime as d, timedelta as td
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


class Log(BaseModel):
    message: str
    sequence_number: int

class Logs(BaseModel):
    logs: list[Log]

FILE_NAME = "log.txt"
DELIMITER = "*"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    if not os.path.exists(FILE_NAME):
        with open(FILE_NAME, 'w') as file:
            pass

@app.post("/save-log")
def save_log(log: Log):
    with open(FILE_NAME, 'a+') as file:
        file.write(f"{log.sequence_number}{DELIMITER}{log.message}{DELIMITER}{d.now() + td(hours=2)}\n")

    return log

@app.post("/save-logs")
def save_logs(logs: Logs):
    with open(FILE_NAME, 'a+') as file:
        for log in logs.logs:
            file.write(f"{log.sequence_number}{DELIMITER}{log.message}{DELIMITER}{d.now()}\n")

    return logs

@app.get("/get-logs")
def get_logs():
    logs = []

    with open(FILE_NAME, 'r') as file:
        while row := file.readline().strip():
            sequence_number, message, datetime = row.split(DELIMITER)

            logs.append({"sequence_number":sequence_number, "message":message, "datetime":datetime})

    return logs

@app.get("/clear-logs")
def clear_logs():
    with open(FILE_NAME, 'w') as file:
        pass

