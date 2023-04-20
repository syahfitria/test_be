FROM python:3.10

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN apt update && pip install -r requirements.txt

EXPOSE 8000

CMD python -m uvicorn main:app --host 0.0.0.0 --reload