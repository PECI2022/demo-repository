echo "Starting MDFAA"

source venv/bin/activate

docker start mongo

lsof -i tcp:8080 | awk '/8080/{print $2}' | xargs kill
cd Frontend
python3 server.py &
cd ..

lsof -i tcp:5001 | awk '/5001/{print $2}' | xargs kill
cd Backend
python3 server.py &
cd ..

echo "DONE, PRESS [ENTER]!"